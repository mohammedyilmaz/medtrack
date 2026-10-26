import { Component, inject } from '@angular/core';
import { IonBadge, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { SyncQueueService } from '../../core/services/sync-queue.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="schedule">
          <ion-icon name="medkit-outline" />
          <ion-label>Schedule</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="history">
          <ion-icon name="list-outline" />
          <ion-label>History</ion-label>
          @if (queue.pending().length) { <ion-badge color="warning">{{ queue.pending().length }}</ion-badge> }
        </ion-tab-button>
        <ion-tab-button tab="settings">
          <ion-icon name="settings-outline" />
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  readonly queue = inject(SyncQueueService);
}
