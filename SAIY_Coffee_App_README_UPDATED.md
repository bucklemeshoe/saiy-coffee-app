
# 📱 Order App — MVP Build README (Updated Tech Stack)

## Overview
We are building a **mobile ordering app** for Order App.  
Customers can:
- Create an account & profile
- Browse the menu
- Place an order for collection
- Select a collection time (ASAP or scheduled)
- (Optional) Share live location until arrival
- Pay on arrival (card, not in‑app)
- Receive order status updates
- Orders are marked “Collected” by staff in the admin dashboard

This MVP ships to **Android (Play Store)** and **iOS (App Store)** using **Capacitor**.

---

## Finalized Technical Choices
- **Frontend:** React (Vite) + **Capacitor** (not Expo)
- **UI Framework:** Ionic React components (optional but recommended for native-feel with Capacitor)
- **State:** Zustand (lightweight) or Redux Toolkit
- **Auth:** **Clerk** (email/password + social providers)
- **Backend & DB:** **Supabase** (Postgres, Row Level Security, RPC/Edge Functions, Storage)
- **APIs:** Supabase JS client; server-side logic in Supabase Edge Functions
- **Push Notifications:** Capacitor Push Notifications (APNs on iOS, FCM on Android) – optionally via OneSignal to simplify
- **Maps/Location:** Capacitor Geolocation + Map provider (Mapbox GL JS or Google Maps JS SDK)
- **Admin Dashboard:** Custom web app (React + Supabase) with Clerk admin role
- **CI/CD:** Optional – GitHub Actions for builds; manual store submissions for MVP

> We are **not** using Webflow, Expo, or Firebase.

---

## Data Models (Supabase)

### `users` (application profile table; Clerk is the identity provider)
```
id: uuid (PK) — equals auth.uid() from Clerk JWT mapping
email: text
name: text
phone: text
dietary_prefs: text
created_at: timestamptz default now()
```

### `menu_items`
```
id: uuid (PK)
name: text
category: text  -- e.g., "Coffee", "Hot/Cold", "Snacks", "Extras", "Drinks"
description: text
price: numeric(10,2)
image_url: text
is_active: boolean default true
created_at: timestamptz default now()
```

### `orders`
```
id: uuid (PK)
user_id: uuid references users(id)
items: jsonb   -- array of { menu_item_id: uuid, quantity: int, notes: text }
status: text   -- 'pending' | 'preparing' | 'ready' | 'collected' | 'cancelled'
pickup_time: timestamptz
share_location: boolean default false
current_location: geography(Point, 4326) null   -- optional live location
created_at: timestamptz default now()
```

### `order_events` (optional auditing)
```
id: uuid (PK)
order_id: uuid references orders(id)
actor: text     -- 'system' | 'user' | 'staff'
event: text     -- 'created' | 'status_changed' | 'location_updated' | ...
metadata: jsonb
created_at: timestamptz default now()
```

> **RLS**: enable RLS on all tables. Users can `SELECT` only their own `orders`; staff/admin can access all.

---

## Auth & RLS: Clerk + Supabase Integration

Goal: Use **Clerk** for auth while keeping Supabase RLS secure.

1. **Clerk as the Identity Provider**
   - Frontend handles sign‑in/up with Clerk (React SDK).
   - After auth, obtain the **Clerk session token** (JWT).

2. **Talk to Supabase with the User’s JWT**
   - Initialize Supabase client with a custom `getAccessToken` hook that supplies the Clerk JWT as `Authorization: Bearer <token>` to PostgREST (via a proxy or using Supabase helpers).
   - Configure Supabase to **trust the external JWT** and map `auth.uid()` to Clerk’s `sub` claim (follow Clerk + Supabase guide).

3. **Row Level Security (RLS)**
   - Example policy on `orders`:
     ```sql
     create policy "users can view own orders"
     on public.orders
     for select using (user_id = auth.uid());

     create policy "users can insert own orders"
     on public.orders
     for insert with check (user_id = auth.uid());
     ```

4. **Staff/Admin**
   - Assign Clerk roles (e.g., `role=admin`).
   - Create policies that allow `admin` to bypass restrictions, e.g.:
     ```sql
     using (exists (select 1 from current_setting('request.jwt.claims', true)::jsonb js
                    where js->>'role' = 'admin'))
     ```

---

## Push Notifications (Capacitor)
- **Android:** FCM configuration (google-services.json) – still used only for notifications.
- **iOS:** APNs certificates/keys; update entitlements and provisioning.
- Use **Capacitor Push Notifications** plugin to register device token; store token in `user_devices` table.
- Trigger sends from **Supabase Edge Functions** on order status changes (or use OneSignal REST for simplicity).

---

## Live Location (Optional)
- Ask for location permission when user toggles "Share Live Location".
- Periodically update `orders.current_location` via `Capacitor Geolocation` + an Edge Function endpoint.
- Staff view can render a tiny map with user ETA (Mapbox Directions API optional).

---

## Screens (App)
1. **Auth** (Clerk): Sign In / Sign Up
2. **Profile Setup**: name, phone, dietary (optional)
3. **Menu**: list by categories; item details
4. **Cart**: items, quantities, notes
5. **Pickup Time**: ASAP or scheduled
6. **Review & Submit**: summary + share location toggle
7. **Order Status**: Pending → Preparing → Ready → Collected (with push updates)
8. **Orders History** (nice-to-have)

## Screens (Admin Web)
1. **Auth** (Clerk; requires `admin` role)
2. **Orders Board**: filters by status, update status, mark collected
3. **Menu Management** (optional in MVP)

---

## Folder Structure (Monorepo suggestion)
```
/apps
  /mobile    # React + Vite + Capacitor app
  /admin     # React app for dashboard
/packages
  /ui        # Shared UI components (design system)
  /lib       # Shared utils (api client, types)
/supabase
  /migrations  # SQL
  /functions   # Edge Functions (Deno)
```

---

## Build Steps (Detailed)

### 1) Bootstrap
- Create monorepo (pnpm + turborepo recommended) or separate repos.
- `apps/mobile`: Vite + React + Ionic (optional) + Capacitor.
- `apps/admin`: React + Vite (or Next.js if SSR is desired).

### 2) Configure Clerk
- Create Clerk app, set redirect URLs.
- Add Clerk React provider to both mobile and admin apps.
- Configure roles (`user`, `admin`).

### 3) Configure Supabase
- Create project; set up tables and RLS policies as above.
- Create **service role key** for server-side Edge Functions.
- Configure JWT verification for external provider (Clerk).

### 4) Connect Frontend → Supabase
- In mobile app, after Clerk sign-in, pass the user token with Supabase requests.
- Implement data fetching for `menu_items`, mutations for `orders`.

### 5) Orders Flow
- Cart → Build payload → Call Edge Function to validate & insert order atomically.
- On insert, send push notification "Order received".

### 6) Push Notifications
- Register device tokens; store per user.
- Edge Function sends push notification on status changes.

### 7) Live Location (optional)
- Start/stop background location updates (reasonable intervals).
- Update order’s `current_location` via Edge Function.

### 8) Admin Dashboard
- Clerk‑protected route for admins.
- Read/write orders via Supabase; update status transitions.

### 9) Capacitor Native Builds
- `npx cap add ios` / `npx cap add android`
- Sync after each web build: `npx cap sync`
- iOS: open Xcode workspace, set bundle id, signing, entitlements (push, location).
- Android: set package id, generate keystore, configure FCM.

### 10) QA & Submission
- Test on real devices (camera/location/push).
- App Store & Play Store assets: icons, screenshots, privacy policy.
- Fill data safety / privacy questionnaires (explain location & notifications usage).

---

## Environment Management: Local vs Cloud

### Local Development (Recommended for Development)
**Prerequisites:**
- Docker Desktop running
- Supabase CLI via npx

**Setup Local Environment:**
```bash
# Start local Supabase stack
npx supabase start

# Reset database with migrations + seed data
npx supabase db reset
```

**Local Environment Variables (.env files):**
```bash
# apps/mobile/.env & apps/admin/.env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SUPABASE_EXTERNAL_JWT=false
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Local URLs:**
- **Mobile App**: http://localhost:5173
- **Admin App**: http://localhost:5174  
- **Supabase Studio**: http://127.0.0.1:54323
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

**Benefits:**
- ✅ Faster development (no network latency)
- ✅ Work offline
- ✅ Full database access via Studio
- ✅ Menu loads without authentication
- ✅ Reset data anytime with `npx supabase db reset`

### Cloud/Production Environment
**Setup Cloud Environment:**
1. Deploy migrations in Supabase Dashboard → SQL Editor
2. Deploy Edge Functions in Supabase Dashboard → Edge Functions
3. Configure Clerk JWT integration (JWT template + Supabase external auth)

**Cloud Environment Variables (.env files):**
```bash
# apps/mobile/.env & apps/admin/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_EXTERNAL_JWT=true
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

**Additional Cloud Variables:**
- `PUSH_ONE_SIGNAL_APP_ID` (if using OneSignal)
- `MAPBOX_TOKEN` (if using Mapbox)
- Edge Functions: `SUPABASE_SERVICE_ROLE_KEY`

**Benefits:**
- ✅ Real authentication flow with Clerk
- ✅ Production-ready data persistence
- ✅ Sharable URLs for testing
- ✅ Push notifications work
- ✅ Ready for mobile app builds

### Switching Between Environments
1. **Update `.env` files** in `apps/mobile/` and `apps/admin/`
2. **Restart dev servers** (Vite will auto-restart when .env changes)
3. **Clear browser storage** if needed (localStorage, cookies)

### Development Workflow
1. **Start with Local** for fast iteration and testing
2. **Test on Cloud** before committing major features
3. **Deploy to Cloud** for production builds and app store submissions

### Quick Commands

**Start Local Supabase Stack:**
```bash
# Start all Supabase services (requires Docker Desktop)
npx supabase start

# Reset database with fresh migrations + seed data
npx supabase db reset

# Stop all Supabase services
npx supabase stop

# Check status and URLs
npx supabase status
```

**Run Development Servers:**
```bash
# Mobile app (from project root)
cd apps/mobile && npm run dev
# Opens at: http://localhost:5173

# Admin dashboard (from project root)  
cd apps/admin && npm run dev
# Opens at: http://localhost:5174

# Or use root scripts:
npm run dev:mobile   # runs mobile app
npm run dev:admin    # runs admin app
```

**Useful Development Commands:**
```bash
# Install dependencies for all workspaces
npm install

# Build all apps
npm run build

# Open Supabase Studio (database management)
open http://127.0.0.1:54323

# View database directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

**Typical Development Session:**
```bash
# 1. Start Supabase (once per session)
npx supabase start

# 2. Run mobile app (in separate terminal)
cd apps/mobile && npm run dev

# 3. Run admin app (optional, in separate terminal)
cd apps/admin && npm run dev

# 4. When done, stop Supabase (optional)
npx supabase stop
```

---

## Example RLS Policies (snippet)
```sql
-- users can only see their own profile
create policy "users read own profile"
on public.users
for select using (id = auth.uid());

-- orders: user owns their orders
create policy "orders select own"
on public.orders
for select using (user_id = auth.uid());

create policy "orders insert own"
on public.orders
for insert with check (user_id = auth.uid());
```

---

## Task List (MVP)
- [ ] Clerk auth wired in mobile and admin
- [ ] Supabase schema & RLS
- [ ] Menu list + detail
- [ ] Cart + order create
- [ ] Order status screen + subscriptions
- [ ] Push notifications on status change
- [ ] Admin: orders board + status updates
- [ ] (Optional) Live location + map view
- [ ] Capacitor builds + store submissions

---

## Notes for GPT‑5 in Cursor
- Prefer **type‑safe** APIs with Zod schemas for order payloads.
- Use `@supabase/supabase-js` on client; Edge Functions for critical writes.
- Keep components small and testable; write minimal unit tests for order creation and RLS.
- Avoid heavy native plugins beyond Push + Geolocation to keep review simple.

