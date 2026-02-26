# Specification

## Summary
**Goal:** Add an online payment status indicator for admins and replace the hardcoded estimated delivery time with an admin-controlled delivery time that can only be set after an order is dispatched.

**Planned changes:**
- Add a `paymentStatus` field (`pending`, `paid`, `failed`) to the order data model in the backend; mark orders as `paid` when Stripe payment verification succeeds.
- Display a payment status badge (green "Paid", yellow "Unpaid", red "Failed", or "COD") on each order row in the Admin Orders Management panel.
- Add an optional `deliveryTime` field (numeric value + unit: minutes/hours/days) to the order data model in the backend.
- Add an admin-only `setDeliveryTime(orderId, value, unit)` backend function that only succeeds when the order has been dispatched (status: shipped, outForDelivery, or delivered).
- Remove all hardcoded/auto-calculated estimated delivery time displays from MyOrders, OrderConfirmation, and PaymentSuccess pages.
- Show the admin-set delivery time to customers in MyOrders and OrderConfirmation only when it has been explicitly set; hide the section entirely otherwise.
- Add a delivery time input form (numeric field + unit selector + "Set Delivery Time" button) in the Admin Orders Management panel for dispatched orders; pre-fill current values if already set.
- Add a `useSetDeliveryTime` mutation hook and update `useOrders` hooks to include `deliveryTime` data.

**User-visible outcome:** Admins can instantly see whether payment has been received for each order, and can set a specific delivery time (in minutes, hours, or days) on dispatched orders. Customers only see delivery time information once the admin has explicitly set it; no estimated times are shown automatically.
