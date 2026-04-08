import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { ToolDefinition } from "../providers/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Order {
  orderId: string;
  customer: string;
  status: string;
  items: string[];
  total: number;
  trackingNumber?: string | null;
  estimatedDelivery?: string;
  shippedDate?: string | null;
  deliveredDate?: string;
  cancelledDate?: string;
  refundStatus?: string;
}

// Load mock order data
const orders: Order[] = JSON.parse(
  readFileSync(join(__dirname, "../data/orders.json"), "utf-8")
);

export const checkOrderDefinition: ToolDefinition = {
  name: "check_order",
  description:
    "Look up the status of a customer order by order ID. Returns order details including status, items, tracking number, and delivery estimate.",
  parameters: {
    type: "object",
    properties: {
      order_id: {
        type: "string",
        description: 'The order ID to look up (e.g., "ORD-12345")',
      },
    },
    required: ["order_id"],
  },
};

export function checkOrder(args: Record<string, unknown>): string {
  const orderId = String(args.order_id).toUpperCase();

  const order = orders.find(
    (o) => o.orderId.toUpperCase() === orderId
  );

  if (!order) {
    return JSON.stringify({
      found: false,
      message: `No order found with ID ${orderId}. Please verify the order number.`,
    });
  }

  return JSON.stringify({
    found: true,
    orderId: order.orderId,
    customer: order.customer,
    status: order.status,
    items: order.items,
    total: `$${order.total.toFixed(2)}`,
    trackingNumber: order.trackingNumber ?? "Not yet assigned",
    estimatedDelivery: order.estimatedDelivery ?? "TBD",
    shippedDate: order.shippedDate ?? "Not yet shipped",
    ...(order.deliveredDate && { deliveredDate: order.deliveredDate }),
    ...(order.cancelledDate && { cancelledDate: order.cancelledDate }),
    ...(order.refundStatus && { refundStatus: order.refundStatus }),
  });
}
