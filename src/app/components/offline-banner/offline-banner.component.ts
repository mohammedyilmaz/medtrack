import { Component, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { NetworkStatusService } from '../../core/services/network-status.service';
import { SyncQueueService } from '../../core/services/sync-queue.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div role="status" aria-live="polite">
      @if (!net.online()) {
        <div class="banner offline">
          <ion-icon name="cloud-offline-outline" />
          <div>
            <strong>You are offline</strong>
            <span>
              Deliveries are saved on this device and sent automatically when the connection returns.
              @if (count() > 0) { {{ count() }} waiting. }
            </span>
          </div>
        </div>
      } @else if (queue.syncing() || count() > 0) {
        <div class="banner syncing">
          <ion-icon name="sync-outline" />
          <div><strong>Syncing {{ count() }} {{ count() === 1 ? 'delivery' : 'deliveries' }}</strong></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .banner { display: flex; gap: .75rem; align-items: center; padding: .6rem 1rem; font-size: .85rem; }
    .banner ion-icon { font-size: 1.4rem; flex: none; }
    .banner div { display: flex; flex-direction: column; }
    .offline { background: #b45309; color: #fff; }
    .syncing { background: var(--ion-color-primary); color: #fff; }
    .syncing ion-icon { animation: spin 1.2s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class OfflineBannerComponent {
  readonly net = inject(NetworkStatusService);
  readonly queue = inject(SyncQueueService);
  readonly count = computed(() => this.queue.pending().length);
}
