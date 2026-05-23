import { OrderList } from "@/components/order-list";

export default function OrdersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground">
          Detailed history across all your platforms
        </p>
      </div>

      <OrderList />
    </div>
  );
}
