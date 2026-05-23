"use client";

import { OrderList } from "@/components/order-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendorIcon } from "@/components/vendor-icon";
import { useCredentials } from "@/lib/credentials-context";
import { getAllVendorInfo, getVendor } from "@/lib/vendors";

export function VendorDashboard() {
  const { hasCredentials } = useCredentials();
  const vendors = getAllVendorInfo();

  if (vendors.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No vendors configured.</p>
      </div>
    );
  }

  const defaultVendor = vendors[0].id;

  return (
    <Tabs defaultValue={defaultVendor} className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <TabsList variant="line">
          {vendors.map((vendor) => (
            <TabsTrigger key={vendor.id} value={vendor.id}>
              <VendorIcon icon={vendor.icon} size="sm" className="mr-1.5" />
              {vendor.name}
              {hasCredentials(vendor.id) && (
                <span
                  className="ml-1.5 size-2 rounded-full"
                  style={{ backgroundColor: vendor.color }}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {vendors.map((vendor) => {
        const _adapter = getVendor(vendor.id);

        return (
          <TabsContent key={vendor.id} value={vendor.id}>
            <div className="space-y-6">
              {/* Orders list */}
              <OrderList vendorId={vendor.id} />
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
