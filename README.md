# MedTrack

  **Live demo:** https://medtrack-omega-flame.vercel.app (login: `nurse` / `nurse123`)

<img width="1918" height="906" alt="Screenshot_1" src="https://github.com/user-attachments/assets/d06a41fc-6f43-43e9-bef1-1c894f417d59" />

<img width="1919" height="915" alt="Screenshot_2" src="https://github.com/user-attachments/assets/aa3b7cf6-ec09-4bef-93e9-8546e6ee1d5a" />

<img width="1918" height="902" alt="Screenshot_3" src="https://github.com/user-attachments/assets/6600e685-ec37-4cdf-9eb0-b62ae7b41c8d" />

<img width="1915" height="906" alt="Screenshot_4" src="https://github.com/user-attachments/assets/dc1e7260-f646-4784-80ec-ca0f08ea7cc6" />

<img width="1918" height="902" alt="Screenshot_5" src="https://github.com/user-attachments/assets/82c2bbcc-ed34-4682-ab50-edd8d1983234" />

<img width="1911" height="900" alt="Screenshot_6" src="https://github.com/user-attachments/assets/92ac6642-6bd2-458f-8b43-a1d615f6246c" />

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
