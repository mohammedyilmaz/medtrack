# MedTrack

  **Live demo:** https://medtrack-omega-flame.vercel.app (login: `nurse` / `nurse123`)

<img width="332" height="720" alt="Screenshot_1" src="https://github.com/user-attachments/assets/b4929fbf-4fb5-4619-a0f7-384de6c15858" />

<img width="329" height="710" alt="Screenshot_2" src="https://github.com/user-attachments/assets/fecadcc5-7941-48ee-9c85-fe4c47a33a40" />

<img width="324" height="717" alt="Screenshot_3" src="https://github.com/user-attachments/assets/75bb9e10-329b-4be1-8741-cedbd33eb596" />

<img width="328" height="716" alt="Screenshot_4" src="https://github.com/user-attachments/assets/3c9e3ed9-5f93-41b7-8900-1749b86fe84a" />

<img width="325" height="712" alt="Screenshot_5" src="https://github.com/user-attachments/assets/15490b14-33b9-4bde-b56f-f044180f1040" />

<img width="329" height="716" alt="Screenshot_6" src="https://github.com/user-attachments/assets/f8e139fb-5e8f-4e0f-9a11-89ce5edb29bb" />

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
