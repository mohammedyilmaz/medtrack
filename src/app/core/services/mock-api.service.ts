import { Injectable, inject } from '@angular/core';
import { PendingAction } from '../models/medication';
import { NetworkStatusService } from './network-status.service';
import { StorageService } from './storage.service';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Stands in for a real backend (for example Spring Boot + JWT).
 * It behaves like one: it takes a moment, fails when there is no connection,
 * and is idempotent, so retrying the same delivery never creates duplicates.
 * To use a real API, replace the body of postDelivery with an HttpClient call.
 */
@Injectable({ providedIn: 'root' })
export class MockApiService {
  private readonly network = inject(NetworkStatusService);
  private readonly storage = inject(StorageService);

  async postDelivery(action: PendingAction): Promise<void> {
    if (!this.network.online()) throw new Error('Network unavailable');
    await sleep(350 + Math.random() * 450);
    if (!this.network.online()) throw new Error('Network lost during request');

    const server = await this.storage.get<Record<string, PendingAction>>('server', {});
    server[action.doseId] = action;
    await this.storage.set('server', server);
  }
}
