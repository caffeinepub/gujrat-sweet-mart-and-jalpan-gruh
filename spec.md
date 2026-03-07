# Gujrat Sweet Mart and Jalpan Gruh

## Current State
Full-stack ICP app with:
- Product catalog (sweets, snacks, namkeen, beverages, cookies, accompaniments) with per-kg / single-unit options
- Shopping cart, checkout with Cash on Delivery / online (Stripe) payment
- Order management: place, cancel (before out-for-delivery), track status (orderPlaced → shipped → outForDelivery → delivered)
- Admin panel with tabs: Products, Orders, UPI Setup, Delivery Staff, Approvals, Homepage
- Customer profile (first-time checkout collects name/phone/address)
- Delivery person dashboard (approved via admin)
- First-login principal becomes admin
- Homepage with editable logo, address, hours, phone (via admin)
- Fuzzy product search
- Category navigation from homepage

## Requested Changes (Diff)

### Add
- **Delivery/Pickup toggle on checkout**: Let customers choose between "Home Delivery" and "Store Pickup". Store pickup should skip address requirement.
- **SEO meta tags in index.html**: Add descriptive `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:type`, `og:locale`), Twitter Card tags, and canonical link for Gujrat Sweet Mart.
- **Google Business structured data (JSON-LD)**: Add `LocalBusiness` / `FoodEstablishment` schema in `<script type="application/ld+json">` covering name, address, telephone, openingHours, servesCuisine, priceRange in index.html.
- **Pickup badge on orders**: Show "Pickup" vs "Delivery" label on order cards in My Orders and Admin orders panel.

### Modify
- **Checkout page**: Add delivery method selector (Delivery / Pickup) before the address field. Hide address field when Pickup is selected.
- **Order model (frontend only)**: Pass delivery method info as part of order notes or address (e.g. address = "STORE PICKUP" when pickup selected) — no backend change needed, backend already stores address as text.
- **index.html**: Enrich with SEO meta tags and JSON-LD structured data.
- **Footer in App.tsx**: Add Cookies and Accompaniments category links (currently missing from footer).

### Remove
- Nothing to remove.

## Implementation Plan
1. Update `index.html` with SEO meta tags (description, OG, Twitter Card) and Google Business JSON-LD structured data.
2. Update `Checkout.tsx` to add a Delivery/Pickup toggle. When Pickup is selected, skip address collection and set address to "STORE PICKUP" when creating the order.
3. Update `MyOrders.tsx` and `OrdersManagement.tsx` (admin orders) to show a Delivery/Pickup badge based on whether the stored address is "STORE PICKUP".
4. Update `App.tsx` footer to add Cookies and Accompaniments links.
5. Validate (typecheck + lint + build).
