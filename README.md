# MedTrack

An offline-first medication rounds app built with **Ionic 8**, **Angular 18** and **Capacitor**.
Nurses can confirm medication deliveries with no connection. Changes are saved on the device
and synced automatically when the network returns.

**Live demo:** _add your Vercel link here_ (login: `nurse` / `nurse123`)

## Try the offline mode (30 seconds)

1. Sign in with the demo account.
2. Open **Settings** and switch on **Simulate no connection**.
3. Go back to **Schedule** and give two or three doses. An orange banner shows they are saved on the device.
4. Open **Settings** again and switch the simulation off. The banner changes to "Syncing" and the
   doses show as **Synced** in **History**.

In a production build the service worker also caches the app, so it opens even with the network turned off.
On a phone, "Add to Home Screen" installs it like a native app.

## Features

- Today's schedule grouped as Overdue, Due now, Later today and Given, with live status changes
- Confirmation step before every delivery
- Offline outbox: saved on the device first, then synced in order
- Offline banner, per-delivery sync state, pending count badge, pull to refresh, manual Sync now
- History of deliveries with who gave them and when
- Light and dark mode (follows the system), works on phones and desktops
- Ready for Android and iOS with Capacitor

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/medtrack/browser (includes the service worker)
```

Requires Node 18.19+ (Node 20 or 22 recommended).

## Build an Android app (APK)

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android      # opens Android Studio, then Build > Build APK
```

## How the offline sync works

```
Give dose -> save delivery on device -> add to queue (outbox) -> send when online
                                                           |-> server confirms -> remove from queue, mark Synced
                                                           |-> network error   -> keep in queue, retry later
```

- `SyncQueueService` keeps the queue in device storage and retries when the connection returns.
- `MockApiService` simulates a server (delay, offline failure, idempotent writes).
  To connect a real backend, replace `postDelivery()` with an `HttpClient` call to your API.
- Storage uses Capacitor Preferences: localStorage on the web, native storage on Android and iOS.

## Project structure

```
src/app/
  core/
    models/medication.ts
    services/ storage, network-status, mock-api, sync-queue, medication, auth
    guards/auth.guard.ts
  components/offline-banner/
  pages/ login, tabs, schedule, history, settings
```

All patients and medicines are fictional. This is a demo and not a medical device.
