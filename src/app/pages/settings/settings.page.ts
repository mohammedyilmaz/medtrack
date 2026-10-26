import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader,
  IonNote, IonTitle, IonToggle, IonToolbar,
} from '@ionic/angular/standalone';
import { OfflineBannerComponent } from '../../components/offline-banner/offline-banner.component';
import { AuthService } from '../../core/services/auth.service';
import { MedicationService } from '../../core/services/medication.service';
import { NetworkStatusService } from '../../core/services/network-status.service';
import { SyncQueueService } from '../../core/services/sync-queue.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    OfflineBannerComponent, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem,
    IonLabel, IonToggle, IonButton, IonIcon, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Settings</ion-title></ion-toolbar>
      <app-offline-banner />
    </ion-header>
    <ion-content>
      <div class="mt-wrap">
        <ion-list>
          <ion-list-header><ion-label>Try offline mode</ion-label></ion-list-header>
          <ion-item lines="full">
            <ion-toggle [checked]="net.simulatedOffline()" (ionChange)="net.setSimulatedOffline($event.detail.checked)">
              Simulate no connection
              <ion-note color="medium" class="ion-text-wrap">
                Give a few doses while this is on, then switch it off and watch them sync.
              </ion-note>
            </ion-toggle>
          </ion-item>
          <ion-item lines="full">
            <ion-label>
              <h3>Waiting to sync</h3>
              <p>{{ queue.pending().length }} {{ queue.pending().length === 1 ? 'delivery' : 'deliveries' }}</p>
            </ion-label>
            <ion-button slot="end" fill="outline" (click)="queue.flush()"
                        [disabled]="!net.online() || queue.syncing() || queue.pending().length === 0">
              <ion-icon name="sync-outline" slot="start" /> Sync now
            </ion-button>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header><ion-label>Account and data</ion-label></ion-list-header>
          <ion-item lines="full">
            <ion-label><h3>{{ auth.user()?.name }}</h3><p>Signed in</p></ion-label>
            <ion-button slot="end" fill="clear" (click)="logout()">
              <ion-icon name="log-out-outline" slot="start" /> Sign out
            </ion-button>
          </ion-item>
          <ion-item lines="full" button detail="false" (click)="confirmReset()">
            <ion-icon name="trash-outline" slot="start" color="danger" />
            <ion-label color="danger">Reset demo data</ion-label>
          </ion-item>
        </ion-list>

        <p class="about">
          MedTrack is a demo with fictional patients and medicines. It is not a medical device.
          Data is stored on this device and sent to a simulated server.
        </p>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-note { display: block; margin-top: .25rem; font-size: .8rem; }
    .about { color: var(--ion-color-medium); font-size: .8rem; padding: 1rem; }
  `],
})
export class SettingsPage {
  readonly net = inject(NetworkStatusService);
  readonly queue = inject(SyncQueueService);
  readonly auth = inject(AuthService);
  private readonly med = inject(MedicationService);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertController);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async confirmReset(): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Reset demo data?',
      message: 'This clears all deliveries and the sync queue and creates a fresh schedule.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Reset', role: 'destructive', handler: () => void this.med.resetDemo() },
      ],
    });
    await alert.present();
  }
}
