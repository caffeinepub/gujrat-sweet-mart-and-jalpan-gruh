# Gujrat Sweet Mart and Jalpan Gruh

## Current State
- `UserProfile` contains `principalId` field displayed directly in Profile page and admin panel
- `saveCallerUserProfile` takes `(fullName, contactNumber, email)` — no username
- `DeliveryApprovalManagement` shows raw principal ID string for each pending user
- `ProfileSetup` only asks for a name on first login
- No concept of username; principal ID is the only user identity shown

## Requested Changes (Diff)

### Add
- `username: Text` field to `UserProfile` type in backend
- `usernameIndex: Map<Text, Principal>` in backend for uniqueness enforcement
- `checkUsernameAvailable(username: Text): async Bool` backend query
- Username is required to be more than 8 characters long
- Username must be globally unique; backend traps with "This username is already occupied" if taken
- `setUsername(username: Text): async ()` backend function to let users set/change their username

### Modify
- `saveCallerUserProfile` now also accepts `username: Text` as first param and validates/stores it
- `ProfileSetup.tsx`: add username field with client-side length validation (>8 chars) and server-side uniqueness check; show error message if already taken
- `Profile.tsx`: show username prominently at top of identity card; hide/deemphasize raw principal ID
- `DeliveryApprovalManagement.tsx`: show `username` instead of principal ID string in each card
- `backend.d.ts`: reflect new `username` field and updated function signature
- `useUserProfile.ts`: update mutation to pass username

### Remove
- Principal ID as the primary visible user identifier across all UI surfaces

## Implementation Plan
1. Update `main.mo`: add `username` to `UserProfile`, add `usernameIndex` map, stable vars, add `checkUsernameAvailable`, update `saveCallerUserProfile` to validate and store username, update pre/postupgrade hooks
2. Update `backend.d.ts`: add `username` to `UserProfile`, add `checkUsernameAvailable`, update `saveCallerUserProfile` signature
3. Update `ProfileSetup.tsx`: add username field, length check (>8), availability check on submit
4. Update `Profile.tsx`: show username as identity, deemphasize principal ID
5. Update `DeliveryApprovalManagement.tsx`: show username instead of principal ID
6. Update `useUserProfile.ts`: pass username in mutation
