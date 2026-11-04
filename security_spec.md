# LowStack Firebase Security Specification

## 1. Data Invariants
1. **User Scoping & Isolation**: All user-generated offers, pages, creatives, deliverables, mined ads, and credits belong strictly to `/users/{userId}`. No user may read or write another user's workspace documents.
2. **Authentication Gate**: Any access requires a valid authenticated Firebase user (`request.auth.uid != null`).
3. **Identity Verification**: On creation and mutation, `userId` must strictly match `request.auth.uid`.
4. **Document ID Sanitization**: All document IDs must conform to `isValidId(id)` (alphanumeric, hyphens, underscores, size <= 128).
5. **Length and Field Boundaries**: All string fields are constrained with max lengths (e.g. titles <= 256, copies <= 2048) to prevent denial of wallet attacks.
6. **Global Default-Deny**: Any unmatched path under `/databases/{database}/documents` is denied by default (`allow read, write: if false;`).

## 2. Dirty Dozen Payloads (Rejection Matrix)
1. **Unauthenticated Read**: Attempting to read `/users/user123/offers/offer1` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Cross-Tenant Snoop**: Authenticated user `userA` attempting to read `/users/userB/offers/offer1` -> `PERMISSION_DENIED`.
3. **Cross-Tenant Write**: Authenticated user `userA` attempting to write `/users/userB/offers/offer1` -> `PERMISSION_DENIED`.
4. **ID Poisoning Attack**: Writing an offer with an invalid document ID containing path traversal characters or 2KB length -> `PERMISSION_DENIED`.
5. **Shadow Field Injection**: Writing an offer with unauthorized administrative ghost fields -> `PERMISSION_DENIED`.
6. **Empty Title Bypass**: Writing an offer with an empty title string -> `PERMISSION_DENIED`.
7. **Giant String / Wallet Attack**: Submitting a copy with > 50,000 characters -> `PERMISSION_DENIED`.
8. **Missing Mandatory Fields**: Submitting an offer without `promise` or `mechanism` -> `PERMISSION_DENIED`.
9. **Direct Admin Bypass**: Attempting to set admin credentials without backend authorization -> `PERMISSION_DENIED`.
10. **Public Collection List Scraping**: Attempting a collectionGroup query across all users -> `PERMISSION_DENIED`.
11. **Spoofed User UID**: Sending `userId: 'userVictim'` in the body when auth token is `request.auth.uid: 'userAttacker'` -> `PERMISSION_DENIED`.
12. **Non-Owner Profile Mutation**: Modifying another user's profile document -> `PERMISSION_DENIED`.
