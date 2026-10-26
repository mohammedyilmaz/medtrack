import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private readonly zone = inject(NgZone);

  /** What the device reports (airplane mode, no signal, ...) */
  readonly deviceOnline = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  /** Demo switch so the offline behaviour can be tried on a desktop browser */
  readonly simulatedOffline = signal(false);
  readonly online = computed(() => this.deviceOnline() && !this.simulatedOffline());

  constructor() {
    Network.getStatus().then((s) => this.zone.run(() => this.deviceOnline.set(s.connected)));
    Network.addListener('networkStatusChange', (s) => this.zone.run(() => this.deviceOnline.set(s.connected)));
  }

  setSimulatedOffline(value: boolean): void {
    this.simulatedOffline.set(value);
  }
}
