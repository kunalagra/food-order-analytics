import { type NextRequest, NextResponse } from "next/server";
import { getVendor, VendorError } from "@/lib/vendors";

interface RouteParams {
  params: Promise<{
    vendor: string;
  }>;
}

/**
 * GET /api/vendors/[vendor]/orders
 * Fetches orders from the specified vendor
 *
 * Headers:
 *   X-Vendor-Cookie: The authentication cookie for the vendor
 *
 * Query params:
 *   page: Page number (default: 1)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { vendor: vendorId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = Number.parseInt(searchParams.get("page") || "1", 10);

  // Get cookie from header
  const cookie = request.headers.get("X-Vendor-Cookie");

  if (!cookie) {
    return NextResponse.json(
      { error: "Missing X-Vendor-Cookie header" },
      { status: 400 },
    );
  }

  // Get vendor adapter
  const vendor = getVendor(vendorId);

  if (!vendor) {
    return NextResponse.json(
      { error: `Unknown vendor: ${vendorId}` },
      { status: 404 },
    );
  }

  try {
    const orders = await vendor.fetchOrders({ cookie }, page);

    return NextResponse.json(orders);
  } catch (error) {
    if (error instanceof VendorError) {
      const statusCode =
        error.code === "AUTH_FAILED"
          ? 401
          : error.code === "RATE_LIMITED"
            ? 429
            : 500;

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: statusCode },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
