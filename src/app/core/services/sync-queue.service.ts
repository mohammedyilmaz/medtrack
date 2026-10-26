import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { Subject } from 'rxjs';
import { PendingAction } from '../models/medication';
import { MockApiService } from './mock-api.service';
import { NetworkStatusService } from './network-status.service';
import { StorageService } from './storage.service';

/**
 * Outbox pattern: every change is written to this queue on the device first,
 * then sent to the server when a connection is available. Order is preserved
 * and an action is only removed after the server confirmed it.
 */
@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private readonly storage = inject(StorageService);
  private readonly api = inject(MockApiService);
  private readonly network = inject(NetworkStatusService);

  readonly pending = signal<PendingAction[]>([]);
  readonly syncing = signal(false);
  /** Emits the dose id each time the server confirms a delivery */
  readonly confirmed = new Subject<string>();

  private readonly ready: Promise<void>;

  constructor() {
    this.ready = this.storage.get<PendingAction[]>('queue', []).then((q) => this.pending.set(q));

    // Whenever we come back online (and once at startup), push whatever is waiting.
    effect(() => {
      if (this.network.online()) untracked(() => void this.flush());
    });
  }

  async enqueue(action: PendingAction): Promise<void> {
    await this.ready;
    this.pending.update((list) => [...list, action]);
    await this.persist();
    if (this.network.online()) void this.flush();
  }

  async flush(): Promise<void> {
    await this.ready;
    if (this.syncing() || !this.network.online()) return;
    this.syncing.set(true);
    try {
      let next: PendingAction | undefined;
      while ((next = this.pending()[0])) {
        try {
          await this.api.postDelivery(next);
        } catch {
          break; // still offline or server error: keep the item and retry later
        }
        const done = next;
        this.pending.update((list) => list.filter((a) => a.id !== done.id));
        await this.persist();
        this.confirmed.next(done.doseId);
      }
    } finally {
      this.syncing.set(false);
    }
  }

  async clear(): Promise<void> {
    await this.ready;
    this.pending.set([]);
    await this.persist();
  }

  private persist(): Promise<void> {
    return this.storage.set('queue', this.pending());
  }
}
