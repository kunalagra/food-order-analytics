import type {
  PaginatedOrders,
  VendorAdapter,
  VendorCredentials,
} from "../types";
import { VendorError } from "../types";
import { parseZomatoResponse, type ZomatoApiResponse } from "./parser";

const ZOMATO_API_BASE = "https://www.zomato.com";
const ORDERS_ENDPOINT = "/webroutes/user/orders";

export const zomatoAdapter: VendorAdapter = {
  info: {
    id: "zomato",
    name: "Zomato",
    icon: "https://play-lh.googleusercontent.com/HJdzprqlCwh_8YNyhMBU6rIaGBGwxHXflZuuqI3iR4US7Jb-bSYiJk_DKV2la9SoBM0K",
    color: "#E23744",
    description: "Food delivery from Zomato",
  },

  getAuthInstructions(): string {
    return `To connect your Zomato account:

1. Open **zomato.com** in your browser and log in
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the **Application** tab → **Cookies** → **zomato.com**
4. Find and copy the entire cookie string, or just these key cookies:
   - \`PHPSESSID\`
   - \`csrf\`
   - \`zat\` (Zomato Auth Token)
5. Paste the cookie value below

Your cookies are stored locally in your browser and only sent to Zomato's servers.`;
  },

  async fetchOrders(
    credentials: VendorCredentials,
    page = 1,
  ): Promise<PaginatedOrders> {
    const url = new URL(ORDERS_ENDPOINT, ZOMATO_API_BASE);
    url.searchParams.set("page", page.toString());

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36",
          Cookie: credentials.cookie,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new VendorError(
            "Authentication failed. Your Zomato cookie may have expired.",
            "AUTH_FAILED",
            "zomato",
          );
        }
        if (response.status === 429) {
          throw new VendorError(
            "Too many requests. Please wait a moment and try again.",
            "RATE_LIMITED",
            "zomato",
          );
        }
        throw new VendorError(
          `Zomato API returned ${response.status}`,
          "UNKNOWN",
          "zomato",
        );
      }

      const data: ZomatoApiResponse = await response.json();

      if (!data.sections?.SECTION_USER_ORDER_HISTORY) {
        throw new VendorError(
          "Unexpected response format from Zomato",
          "PARSE_ERROR",
          "zomato",
        );
      }

      return parseZomatoResponse(data);
    } catch (error) {
      if (error instanceof VendorError) {
        throw error;
      }

      throw new VendorError(
        `Failed to fetch orders: ${error instanceof Error ? error.message : "Unknown error"}`,
        "NETWORK_ERROR",
        "zomato",
      );
    }
  },
};
