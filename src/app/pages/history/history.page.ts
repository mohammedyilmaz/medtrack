import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { OfflineBannerComponent } from '../../components/offline-banner/offline-banner.component';
import { MedicationService } from '../../core/services/medication.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe, OfflineBannerComponent, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Delivery history</ion-title></ion-toolbar>
      <app-offline-banner />
    </ion-header>
    <ion-content>
      <div class="mt-wrap">
        @if (med.history().length === 0) {
          <p class="empty">Nothing given yet. Doses you confirm on the Schedule tab appear here.</p>
        }
        <ion-list>
          @for (d of med.history(); track d.id) {
            <ion-item lines="full">
              <ion-label class="ion-text-wrap">
                <h2>{{ d.drug }} {{ d.amount }}</h2>
                <p>{{ d.patient }}, bed {{ d.bed }}</p>
                <p>Given {{ d.delivery!.deliveredAt | date: 'HH:mm' }} by {{ d.delivery!.deliveredBy }}</p>
              </ion-label>
              @if (d.delivery!.synced) {
                <span slot="end" class="state ok"><ion-icon name="cloud-done-outline" /> Synced</span>
              } @else {
                <span slot="end" class="state wait"><ion-icon name="time-outline" /> Waiting to sync</span>
              }
            </ion-item>
          }
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [`
    h2 { font-weight: 600; }
    .state { display: inline-flex; align-items: center; gap: .3rem; font-size: .8rem; font-weight: 600; }
    .state.ok { color: var(--mt-done); }
    .state.wait { color: var(--mt-due); }
    .empty { text-align: center; color: var(--ion-color-medium); padding: 2.5rem 1rem; }
  `],
})
export class HistoryPage {
  readonly med = inject(MedicationService);
}
