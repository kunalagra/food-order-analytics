import type { Order } from "@/lib/vendors/types";

export interface SpendingByMonth {
  month: string;
  year: number;
  amount: number;
  orders: number;
}

export interface TopRestaurant {
  id: string;
  name: string;
  imageUrl?: string;
  orders: number;
  totalSpent: number;
  vendorId: string;
  locality?: string;
  rating?: number;
  url?: string;
}

export interface TopItem {
  name: string;
  quantity: number;
  orders: number;
}

export interface OrderStreak {
  days: number;
  startDate: Date;
  endDate: Date;
}

export interface DayStats {
  day: string;
  orders: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  spent: number;
}

export interface TimeOfDayStats {
  morning: number; // 5am - 12pm
  afternoon: number; // 12pm - 5pm
  evening: number; // 5pm - 9pm
  night: number; // 9pm - 5am
}

export interface Analytics {
  // Summary
  totalSpent: number;
  totalOrders: number;
  totalUniqueItems: number;
  averageOrderValue: number;

  // By vendor
  spendingByVendor: Record<string, { amount: number; orders: number }>;

  // Time-based
  spendingByMonth: SpendingByMonth[];
  spendingByYear: { year: number; amount: number; orders: number }[];
  dailyActivity: DailyActivity[];
  timeOfDay: TimeOfDayStats;
  hourlyActivity: number[];

  // Lists
  // List accessors
  topRestaurants: TopRestaurant[]; // Top 10
  allRestaurants: TopRestaurant[]; // All
  topItems: TopItem[];
  allItems: TopItem[];

  // Insights
  highestOrder: Order | null;
  lowestOrder: Order | null;
  longestStreak: OrderStreak | null;
  mostActiveDay: DayStats | null;

  // Trends
  monthlyAverage: number;
  thisMonthSpent: number;
  lastMonthSpent: number;
}

/**
 * Parse currency string to number (handles ₹X,XXX.XX format)
 */
function parseCurrency(value: string): number {
  // Remove currency symbol and commas, then parse
  const cleaned = value.replace(/[₹,\s]/g, "");
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Get month key from date (YYYY-MM)
 */
function getMonthKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get date key (YYYY-MM-DD)
 */
function getDateKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Get day name from date
 */
function getDayName(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Calculate longest streak of consecutive days with orders
 */
function calculateStreak(orders: Order[]): OrderStreak | null {
  if (orders.length === 0) return null;

  // Get unique dates (normalized to day start)
  const dates = [
    ...new Set(
      orders.map((o) => {
        const d = new Date(o.orderDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }),
    ),
  ].sort((a, b) => a - b);

  if (dates.length === 0) return null;

  let maxStreak = 1;
  let maxStart = dates[0];
  let maxEnd = dates[0];

  let currentStreak = 1;
  let currentStart = dates[0];

  const ONE_DAY = 24 * 60 * 60 * 1000;

  for (let i = 1; i < dates.length; i++) {
    const diff = dates[i] - dates[i - 1];

    // Allow for small time discrepancies, verify day difference
    // Actually, since we normalized to setHours(0,0,0,0), exactly 24h is correct.
    if (diff === ONE_DAY) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxStart = currentStart;
        maxEnd = dates[i];
      }
    } else {
      // Reset streak
      currentStreak = 1;
      currentStart = dates[i];
    }
  }

  return {
    days: maxStreak,
    startDate: new Date(maxStart),
    endDate: new Date(maxEnd),
  };
}

/**
 * Compute analytics from orders
 */
export function computeAnalytics(orders: Order[]): Analytics {
  if (orders.length === 0) {
    return {
      totalSpent: 0,
      totalOrders: 0,
      totalUniqueItems: 0,
      averageOrderValue: 0,
      spendingByVendor: {},
      spendingByMonth: [],
      spendingByYear: [],
      dailyActivity: [],
      timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      hourlyActivity: new Array(24).fill(0),
      topRestaurants: [],
      allRestaurants: [],
      topItems: [],
      allItems: [],
      highestOrder: null,
      lowestOrder: null,
      longestStreak: null,
      mostActiveDay: null,
      monthlyAverage: 0,
      thisMonthSpent: 0,
      lastMonthSpent: 0,
    };
  }

  // Basic aggregations
  let totalSpent = 0;
  let highestOrder: Order | null = null;
  let highestOrderValue = 0;

  // Initialize with first order for comparison
  let lowestOrder: Order | null = orders[0];
  // We'll calculate the value inside the loop to be safe, but init high
  let lowestOrderValue = Number.MAX_SAFE_INTEGER;

  const vendorStats: Record<string, { amount: number; orders: number }> = {};
  const monthStats: Record<string, { amount: number; orders: number }> = {};
  const yearStats: Record<number, { amount: number; orders: number }> = {};
  const restaurantStats: Record<string, TopRestaurant> = {};
  const itemStats: Record<string, { quantity: number; orders: number }> = {};
  const dayStats: Record<string, number> = {};
  const dailyActivity: Record<string, DailyActivity> = {};
  const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const hourlyActivity = new Array(24).fill(0);

  for (const order of orders) {
    const orderDate = new Date(order.orderDate);
    const amount = parseCurrency(order.totalCost);
    totalSpent += amount;

    // Highest order
    if (amount > highestOrderValue) {
      highestOrderValue = amount;
      highestOrder = order;
    }

    // Lowest order (ignore zero/negative if any)
    if (amount > 0 && amount < lowestOrderValue) {
      lowestOrderValue = amount;
      lowestOrder = order;
    }

    // By vendor
    if (!vendorStats[order.vendorId]) {
      vendorStats[order.vendorId] = { amount: 0, orders: 0 };
    }
    vendorStats[order.vendorId].amount += amount;
    vendorStats[order.vendorId].orders++;

    // By month
    const monthKey = getMonthKey(orderDate);
    if (!monthStats[monthKey]) {
      monthStats[monthKey] = { amount: 0, orders: 0 };
    }
    monthStats[monthKey].amount += amount;
    monthStats[monthKey].orders++;

    // By year
    const year = orderDate.getFullYear();
    if (!yearStats[year]) {
      yearStats[year] = { amount: 0, orders: 0 };
    }
    yearStats[year].amount += amount;
    yearStats[year].orders++;

    // Daily activity
    const dateKey = getDateKey(orderDate);
    if (!dailyActivity[dateKey]) {
      dailyActivity[dateKey] = { date: dateKey, count: 0, spent: 0 };
    }
    dailyActivity[dateKey].count++;
    dailyActivity[dateKey].spent += amount;

    // Time of day
    const hour = orderDate.getHours();
    hourlyActivity[hour]++;

    if (hour >= 5 && hour < 12) timeOfDay.morning++;
    else if (hour >= 12 && hour < 17) timeOfDay.afternoon++;
    else if (hour >= 17 && hour < 21) timeOfDay.evening++;
    else timeOfDay.night++;

    // By restaurant
    const restId = `${order.vendorId}-${order.restaurant.id}`;
    if (!restaurantStats[restId]) {
      restaurantStats[restId] = {
        id: order.restaurant.id,
        name: order.restaurant.name,
        imageUrl: order.restaurant.imageUrl,
        orders: 0,
        totalSpent: 0,
        vendorId: order.vendorId,
        locality: order.restaurant.locality,
        rating: order.restaurant.rating, // Now using number | undefined
        url: order.restaurant.url,
      };
    }
    restaurantStats[restId].orders++;
    restaurantStats[restId].totalSpent += amount;

    // By item
    for (const item of order.items) {
      const itemKey = item.name.toLowerCase().trim();
      if (!itemStats[itemKey]) {
        itemStats[itemKey] = { quantity: 0, orders: 0 };
      }
      itemStats[itemKey].quantity += item.quantity;
      itemStats[itemKey].orders++;
    }

    // By day of week
    const day = getDayName(orderDate);
    dayStats[day] = (dayStats[day] || 0) + 1;
  }

  // Process monthly data
  const spendingByMonth = Object.entries(monthStats)
    .map(([key, stats]) => ({
      month: key,
      year: Number.parseInt(key.split("-")[0], 10),
      amount: Math.round(stats.amount * 100) / 100,
      orders: stats.orders,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Process yearly data
  const spendingByYear = Object.entries(yearStats)
    .map(([year, stats]) => ({
      year: Number.parseInt(year, 10),
      amount: Math.round(stats.amount * 100) / 100,
      orders: stats.orders,
    }))
    .sort((a, b) => a.year - b.year);

  // All restaurants
  const allRestaurants = Object.values(restaurantStats).sort(
    (a, b) => b.orders - a.orders,
  );

  // Top restaurants
  const topRestaurants = allRestaurants.slice(0, 10);

  // Top items
  const allItems = Object.entries(itemStats)
    .map(([name, stats]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      quantity: stats.quantity,
      orders: stats.orders,
    }))
    .sort((a, b) => b.quantity - a.quantity);

  const topItems = allItems.slice(0, 10);

  // Most active day
  const mostActiveDay =
    Object.entries(dayStats)
      .map(([day, orders]) => ({ day, orders }))
      .sort((a, b) => b.orders - a.orders)[0] || null;

  // Streak
  const longestStreak = calculateStreak(orders);

  // Monthly average
  const monthlyAverage =
    spendingByMonth.length > 0 ? totalSpent / spendingByMonth.length : 0;

  // This month and last month
  const now = new Date();
  const thisMonthKey = getMonthKey(now);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = getMonthKey(lastMonth);

  const thisMonthSpent = monthStats[thisMonthKey]?.amount || 0;
  const lastMonthSpent = monthStats[lastMonthKey]?.amount || 0;

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalOrders: orders.length,
    totalUniqueItems: Object.keys(itemStats).length,
    averageOrderValue: Math.round((totalSpent / orders.length) * 100) / 100,
    spendingByVendor: vendorStats,
    spendingByMonth,
    spendingByYear,
    dailyActivity: Object.values(dailyActivity).sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
    timeOfDay,
    hourlyActivity,
    topRestaurants,
    allRestaurants,
    topItems,
    allItems,
    highestOrder,
    lowestOrder:
      lowestOrderValue === Number.MAX_SAFE_INTEGER ? null : lowestOrder,
    longestStreak,
    mostActiveDay,
    monthlyAverage: Math.round(monthlyAverage * 100) / 100,
    thisMonthSpent: Math.round(thisMonthSpent * 100) / 100,
    lastMonthSpent: Math.round(lastMonthSpent * 100) / 100,
  };
}
