import type { Order, OrderStatus } from "../types";

// Zomato API response types
interface ZomatoOrderEntity {
  orderId: number;
  totalCost: string;
  rating: unknown;
  ratingV2: string;
  orderDate: string;
  hashId: string;
  status: number;
  paymentStatus: number;
  dishString: string;
  deliveryDetails: {
    deliveryAddress: string;
    deliveryStatus: number;
    deliveryMessage: string;
    deliveryLabel: string;
  };
  resInfo: {
    id: number;
    name: string;
    thumb: string;
    rating: {
      aggregate_rating: string;
      votes: string;
    };
    resUrl: string;
    locality: {
      localityName: string;
      addressString: string;
    };
  };
  showReorderButton: boolean;
  reOrderUrl: string;
}

interface ZomatoOrderHistorySection {
  count: number;
  currentPage: number;
  totalPages: number;
  paginationText: string;
  entities: Array<{
    entity_type: string;
    entity_ids: number[];
  }>;
}

export interface ZomatoApiResponse {
  sections: {
    SECTION_USER_ORDER_HISTORY: ZomatoOrderHistorySection;
  };
  entities: {
    ORDER: Record<string, ZomatoOrderEntity>;
  };
}

/**
 * Maps Zomato delivery status codes to normalized status
 */
function mapDeliveryStatus(status: number): OrderStatus {
  switch (status) {
    case 1:
      return "pending";
    case 2:
      return "confirmed";
    case 3:
      return "out_for_delivery";
    case 4:
      return "delivered";
    case 5:
      return "cancelled";
    default:
      return "unknown";
  }
}

/**
 * Parse Zomato date string to Date object
 * Format: "December 24, 2025 at 08:07 PM"
 */
function parseZomatoDate(dateStr: string): Date {
  // Replace "at" with comma for standard parsing
  const normalizedDate = dateStr.replace(" at ", ", ");
  const parsed = new Date(normalizedDate);

  if (Number.isNaN(parsed.getTime())) {
    return new Date(); // Fallback to current date if parsing fails
  }

  return parsed;
}

/**
 * Parse dish string into order items
 * Format: "2 x Nadiyadi Bhusa, 1 x Papdi"
 */
function parseDishString(
  dishString: string,
): Array<{ name: string; quantity: number }> {
  if (!dishString) return [];

  return dishString.split(", ").map((item) => {
    const match = item.match(/^(\d+)\s*x\s*(.+)$/);
    if (match) {
      return {
        quantity: Number.parseInt(match[1], 10),
        name: match[2].trim(),
      };
    }
    return { quantity: 1, name: item.trim() };
  });
}

/**
 * Parse a single Zomato order entity into normalized Order format
 */
export function parseZomatoOrder(entity: ZomatoOrderEntity): Order {
  const status = mapDeliveryStatus(entity.deliveryDetails.deliveryStatus);
  const orderDate = parseZomatoDate(entity.orderDate);

  return {
    id: `zomato-${entity.orderId}`,
    vendorId: "zomato",
    accountId: "",
    orderId: entity.orderId.toString(),
    totalCost: entity.totalCost,
    orderDate,
    orderDateFormatted: entity.orderDate,
    status,
    statusLabel: entity.deliveryDetails.deliveryLabel,
    items: parseDishString(entity.dishString),
    itemsSummary: entity.dishString,
    restaurant: {
      id: entity.resInfo.id.toString(),
      name: entity.resInfo.name,
      imageUrl: entity.resInfo.thumb,
      rating: entity.resInfo.rating?.aggregate_rating
        ? Number.parseFloat(entity.resInfo.rating.aggregate_rating)
        : undefined,
      ratingCount: entity.resInfo.rating?.votes,
      locality: entity.resInfo.locality?.localityName,
      address: entity.resInfo.locality?.addressString,
      url: entity.resInfo.resUrl,
    },
    deliveryAddress: entity.deliveryDetails.deliveryAddress,
    reorderUrl: entity.showReorderButton
      ? `https://www.zomato.com${entity.reOrderUrl}`
      : undefined,
    rawData: entity,
  };
}

/**
 * Parse full Zomato API response into paginated orders
 */
export function parseZomatoResponse(response: ZomatoApiResponse) {
  const section = response.sections.SECTION_USER_ORDER_HISTORY;
  const orderEntities = response.entities.ORDER || {};

  // Get order IDs from the section
  const orderIds = section.entities
    .filter((e) => e.entity_type === "ORDER")
    .flatMap((e) => e.entity_ids);

  // Parse each order in the order they appear
  const orders = orderIds
    .map((id) => orderEntities[id.toString()])
    .filter(Boolean)
    .map(parseZomatoOrder);

  return {
    orders,
    totalCount: section.count,
    currentPage: section.currentPage,
    totalPages: section.totalPages,
    hasMore: section.currentPage < section.totalPages,
  };
}
