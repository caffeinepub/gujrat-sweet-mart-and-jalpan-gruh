/**
 * Sends an automatic WhatsApp notification to the shop admin
 * when a new order is placed. Opens the WhatsApp link in a new tab
 * so the main checkout flow is not interrupted.
 */

export interface OrderNotifyParams {
  orderId: bigint | number;
  customerName: string;
  customerPhone: string;
  address: string;
  items: Array<{ name: string; quantity: number; totalPrice: number }>;
  paymentMethod: "cod" | "upi" | "card";
  grandTotal: number;
  deliveryMethod: "delivery" | "pickup";
}

export function notifyAdminWhatsApp(params: OrderNotifyParams): void {
  const adminNumber =
    localStorage.getItem("shop_whatsapp_number") || "917875199999";

  const paymentLabel =
    params.paymentMethod === "cod"
      ? "Cash on Delivery"
      : params.paymentMethod === "upi"
        ? "UPI"
        : "Card (Online)";

  const deliveryLabel =
    params.deliveryMethod === "pickup" ? "Store Pickup" : "Home Delivery";

  const itemLines = params.items
    .map((i) => `  • ${i.name} x${i.quantity} = ₹${i.totalPrice.toFixed(2)}`)
    .join("\n");

  const message = [
    "🛒 *NEW ORDER RECEIVED!*",
    "",
    `📦 Order ID: #${params.orderId}`,
    `👤 Customer: ${params.customerName}`,
    `📞 Phone: ${params.customerPhone}`,
    `📍 ${deliveryLabel}: ${params.address}`,
    "",
    "*Items:*",
    itemLines,
    "",
    `💳 Payment: ${paymentLabel}`,
    `💰 Total: ₹${params.grandTotal.toFixed(2)}`,
    "",
    "Please confirm the order as soon as possible.",
  ].join("\n");

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${adminNumber}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
