# Specification

## Summary
**Goal:** Add beverages category, unit type selection (per kg or single unit), and product photo upload functionality.

**Planned changes:**
- Add 'beverages' as a fourth product category option in backend and frontend
- Add unit type field to products with 'per_kg' and 'single' options
- Add file upload functionality to ProductForm for product photos stored as base64
- Display unit type alongside price on product cards (e.g., '₹150/kg' or '₹50/piece')
- Display product photos on ProductCard components when available

**User-visible outcome:** Admins can add beverages products, specify whether products are priced per kg or per unit, and upload product photos. Customers see product photos, pricing units, and the new beverages category on the Products page.
