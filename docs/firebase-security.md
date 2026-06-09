**Summary**
- Purpose: tighten Firebase security surface (client, rules, server-side)

**Quick fixes applied**
- Ensured `.env` is listed in `.gitignore` (already present).
- Added App Check initialization to `src/firebase.js` (uses `VITE_RECAPTCHA_SITE_KEY`).
- Added example `firestore.rules` and `storage.rules` files for deployment.

**Required environment variables (client)**
- `VITE_FIREBASE_*` (existing)
- `VITE_RECAPTCHA_SITE_KEY` — reCAPTCHA v3 site key for App Check

**Server-side (recommended)**
- Move any privileged operations (creating admin-only documents, issuing custom tokens, privileged writes) to Cloud Functions using the Admin SDK and a service account.

**Firestore schema (recommended collections & fields)**
- `users/{userId}`
  - `displayName` (string)
  - `email` (string)
  - `roles` (map) — e.g. `{ admin: true }`
  - `createdAt` (timestamp)

- `events/{eventId}`
  - `title` (string)
  - `description` (string)
  - `startsAt` (timestamp)
  - `createdBy` (uid)
  - `public` (boolean)

- `applications/{appId}`
  - `userId` (uid)
  - `status` (string) — e.g. `pending`, `approved`, `rejected`
  - `submittedAt` (timestamp)

**Security rules snippets**
- See `firestore.rules` and `storage.rules` in repo root.

**Rollout checklist**
1. Create reCAPTCHA site key and set `VITE_RECAPTCHA_SITE_KEY` in local `.env` (do not commit).
2. Test App Check in staging and inspect metrics in Firebase console.
3. Deploy `firestore.rules` and `storage.rules` with `firebase deploy --only firestore:rules,storage:rules`.
4. Move privileged code to Cloud Functions and use Admin SDK.
5. Optionally rotate keys and remove old API keys from the project if compromised.

**Notes & next steps**
- If you need, I can: 1) add a Cloud Function scaffold for issuing role claims; 2) add a minimal server endpoint to handle sensitive operations; 3) create a migration script to add `roles.admin` to chosen users.
