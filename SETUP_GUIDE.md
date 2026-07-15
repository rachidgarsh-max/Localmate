# LocalMate — Guía completa: de este código a una app real en Play Store

This app is real, working code — not a demo. Follow these steps in order.
Each step is something only you can do (accounts, payments, identity verification),
but the instructions are exact.

**Current status (what's real vs. what's next):**
- ✅ Homepage, keyword-based search, category browsing — fully working.
- ✅ "Become a Pro" sign-up form — writes real data to your database.
- ✅ Professionals stay hidden until `approved: true` is set on their record
  (a basic version of the admin approval step) — see Part 6.
- ⏳ Not yet built: customer accounts/login, real booking confirmations, chat,
  maps, notifications, payments/premium plans. These are Part 7's roadmap.

## Part 1 — Get the app running on your computer

1. Install [Node.js](https://nodejs.org) (choose the LTS version) if you don't have it.
2. Unzip this project, open a terminal inside the folder, and run:
   ```
   npm install
   npm run dev
   ```
3. It will open at `http://localhost:5173`. Right now it will show a connection
   error, because it needs a real database — that's Part 2.

## Part 2 — Set up a free real database (Firebase)

This is what makes the data *real* instead of mock data — providers who fill out
the "Publicar mi negocio" form will actually be saved and visible to everyone.

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Add project** → name it (e.g. "manitas-cerca") → finish the wizard.
   (You can skip Google Analytics.)
3. In the left sidebar, click **Build → Firestore Database** → **Create database**
   → choose a location close to Spain (e.g. `eur3`) → start in **test mode** for now
   (you'll lock it down before launch — see Part 2b).
4. Click the gear icon → **Project settings** → scroll to "Your apps" → click the
   `</>` (web) icon → register the app (any nickname) → it will show you a config
   object with keys like `apiKey`, `authDomain`, etc.
5. In your project folder, copy `.env.example` to a new file named `.env`, and
   paste in those values, e.g.:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=manitas-cerca.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=manitas-cerca
   VITE_FIREBASE_STORAGE_BUCKET=manitas-cerca.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
6. Restart `npm run dev`. The app should now load real (empty) data, and the
   "Publicar mi negocio" form should actually save providers.

### Part 2b — Lock down the database before you launch

Test mode allows anyone to read/write. Before real users touch it, go to
**Firestore Database → Rules** and set something like:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /professionals/{doc} {
      allow read: if true;
      allow create: if request.resource.data.name is string
                    && request.resource.data.phone is string
                    && request.resource.data.approved == false; // can't self-approve
      allow update, delete: if false; // only you, manually in the console, for now
    }
  }
}
```
This is a starting point, not a full security setup — good enough for launch,
worth revisiting once you have real usage.

## Part 3 — Put it on the real internet (a website)

1. Push the project to a free [GitHub](https://github.com) repository.
2. Go to https://vercel.com, sign up with GitHub, click **Add New Project**,
   import the repo, add the same environment variables from your `.env` file
   in Vercel's settings, and deploy.
3. You'll get a real URL like `manitas-cerca.vercel.app` — this is already a
   usable, installable web app (people can "Add to Home Screen" on Android/iOS).

At this point, you already have something you can send to people. Play Store
is a further step, useful for discoverability but not required to be "real."

## Part 4 — Turn it into an Android app for the Play Store

Since this is a web app, the standard path is wrapping it as a **Trusted Web
Activity (TWA)** — this is Google's own supported way to publish web apps,
not a workaround.

1. Go to https://www.pwabuilder.com
2. Enter your Vercel URL and click **Start**.
3. It will score your app (manifest, icons, etc. — this project already has
   the basics) and let you **Package for Stores → Android**.
4. It generates a signed `.aab` file — download it. Keep the signing key it
   gives you somewhere safe; you'll need it for every future update.

## Part 5 — Google Play Console (the account you asked about)

Confirmed current requirements as of mid-2026:
- **$25 USD one-time fee** (not annual).
- You need 2-Step Verification on your Google account, a non-prepaid card,
  and government ID for identity verification (can take a few hours to 2
  business days).
- **New personal accounts must run a closed test with at least 12 testers
  for 14 consecutive days** before you can publish publicly. Plan for this —
  it means roughly 2–4 weeks from signup to live app, not overnight.

Steps:
1. Go to https://play.google.com/console/signup and pay the $25 fee.
2. Complete identity verification.
3. Create your app listing, upload the `.aab` from PWABuilder.
4. Set up the closed test with 12 testers (can be friends, family — anyone
   with a Gmail address who installs and uses it).
5. After 14 days, apply for production access.

## Part 6 — Finding providers (this part really is on you)

A few ideas, since you mentioned you'll handle outreach:
- Start with people you already know in Cox, Granja de Rocamora, etc.
- Local Facebook groups for Vega Baja towns are very active for this kind
  of word-of-mouth service.
- Once you have 10–15 real listings, the app stops looking empty and is
  much easier to show to more providers as proof it's real.

## Part 6 — Approving new professionals (your admin step for now)

Right now there's no admin panel UI — you approve people directly in Firebase:
1. Go to **Firestore Database → Data → professionals** in the Firebase console.
2. Click a new submission, find the `approved` field, change it from `false`
   to `true`, save.
3. It appears on the site instantly (no redeploy needed).

A real admin panel (a proper dashboard with buttons instead of editing the
database by hand) is worth building once you have enough sign-ups that this
gets tedious — come back and I'll build it.

## Part 7 — Roadmap for the remaining features

These are real systems, each buildable, but each is its own chunk of work
best done one at a time so you can test as you go:

1. **Customer accounts (login/register)** — Firebase Authentication (free,
   same project). Unlocks favorites, booking history, reviews.
2. **Real AI-understood search** — replace the keyword list in `App.jsx`
   with a call to Anthropic's API (needs an API key from
   console.anthropic.com) so it understands phrasing the keyword list
   doesn't cover.
3. **Booking system** — a `bookings` collection, date/time picker, status
   (pending/confirmed), notifications on change.
4. **Reviews** — tied to completed bookings so only real customers can post.
5. **Chat** — a `messages` collection with real-time updates (same pattern
   as the professionals list); auto-translation would call a translation
   API per message.
6. **Maps** — Google Maps JavaScript API (needs its own API key and, above
   a free quota, billing).
7. **Notifications** — Firebase Cloud Messaging for push notifications.
8. **Premium plans / payments** — Stripe, plus the ranking/badge logic.

Tell me which one to build next and I'll do the same thing I did for
sign-up: real code, wired into this same project, with setup steps for
whatever new account or API key it needs.

## Where to go if you get stuck

Come back to this chat any time — I can help debug errors, add features
(reviews, WhatsApp links, an admin approval step before listings go live),
or adjust the design. I can't click through Firebase/Vercel/Play Console for
you, but I can walk through any screen with you if something doesn't match
what's described here.
