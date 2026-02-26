# Specification

## Summary
**Goal:** Add a user profile system with Principal ID display, delivery access requests, and admin approval workflow for the Gujrat Sweet Mart app.

**Planned changes:**
- Extend the backend user profile model to include full name, contact number, email, Principal ID, and a `deliveryApprovalStatus` field (`pending`, `approved`, `rejected`); new profiles default to `pending`
- Add backend functions: `getMyProfile()`, `getAllPendingDeliveryProfiles()` (admin-only), `approveDeliveryPrincipal()` (admin-only, also grants delivery role), and `rejectDeliveryPrincipal()` (admin-only)
- Add a Profile page accessible to all logged-in users showing editable name, contact number, and email fields; read-only Principal ID with copy-to-clipboard; current delivery approval status; and a "Request Delivery Access" button
- Update the delivery dashboard access gate to require both the delivery role and `deliveryApprovalStatus = approved`; show appropriate messages for pending and rejected users
- Add a "Delivery Approvals" tab in the Admin panel listing pending profiles with Approve/Reject buttons and success toasts
- Add React Query hooks: `useMyProfile`, `usePendingDeliveryProfiles`, `useApproveDeliveryPrincipal`, and `useRejectDeliveryPrincipal`
- Add a Profile link in the header navigation for logged-in users

**User-visible outcome:** Users can view and edit their profile, see their Principal ID, and request delivery access. Admins can review pending delivery access requests and approve or reject them from a new Admin panel tab. Approved users gain access to the delivery dashboard automatically.
