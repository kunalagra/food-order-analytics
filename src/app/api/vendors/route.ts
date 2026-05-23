import { NextResponse } from "next/server";
import { getAllVendorInfo } from "@/lib/vendors";

/**
 * GET /api/vendors
 * Returns list of all available vendors
 */
export async function GET() {
  const vendors = getAllVendorInfo();

  return NextResponse.json({
    vendors,
  });
}
