import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AlertController, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader,
  IonProgressBar, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonTitle, IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { OfflineBannerComponent } from '../../components/offline-banner/offline-banner.component';
import { DoseStatus, DoseView } from '../../core/models/medication';
import { MedicationService } from '../../core/services/medication.service';
import { NetworkStatusService } from '../../core/services/network-status.service';
import { SyncQueueService } from '../../core/services/sync-queue.service';

type Filter = 'todo' | 'done' | 'all';

const GROUPS: { key: DoseStatus; label: string }[] = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'due', label: 'Due now' },
  { key: 'upcoming', label: 'Later today' },
  { key: 'delivered', label: 'Given' },
];

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    DatePipe, OfflineBannerComponent, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton,
    IonLabel, IonList, IonListHeader, IonItem, IonButton, IonIcon, IonProgressBar, IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>Today's rounds</ion-title></ion-toolbar>
      <app-offline-banner />
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)"><ion-refresher-content /></ion-refresher>

      <div class="mt-wrap">
        <section class="summary">
          <div class="count">
            <span class="big">{{ med.deliveredCount() }}</span>
            <span class="of">of {{ med.total() }} doses given</span>
          </div>
          @if (med.overdueCount() > 0) {
            <span class="overdue-chip">{{ med.overdueCount() }} overdue</span>
          }
          <ion-progress-bar [value]="progress()" />
        </section>

        <ion-segment [value]="filter()" (ionChange)="filter.set($any($event.detail.value))">
          <ion-segment-button value="todo"><ion-label>To give</ion-label></ion-segment-button>
          <ion-segment-button value="done"><ion-label>Given</ion-label></ion-segment-button>
          <ion-segment-button value="all"><ion-label>All</ion-label></ion-segment-button>
        </ion-segment>

        @for (g of groups(); track g.key) {
          <ion-list>
            <ion-list-header><ion-label>{{ g.label }} ({{ g.items.length }})</ion-label></ion-list-header>
            @for (d of g.items; track d.id) {
              <ion-item lines="full" [class]="'row ' + d.status">
                <div class="time" slot="start">{{ d.scheduledAt | date: 'HH:mm' }}</div>
                <ion-label class="ion-text-wrap">
                  <h2>{{ d.drug }} <span class="amount">{{ d.amount }}</span></h2>
                  <p>{{ d.patient }}, bed {{ d.bed }}</p>
                  <p>{{ d.note ? d.route + ', ' + d.note : d.route }}</p>
                </ion-label>
                @if (d.delivery) {
                  <div slot="end" class="given">
                    <ion-icon name="checkmark-circle" />
                    <span>{{ d.delivery.deliveredAt | date: 'HH:mm' }}</span>
                  </div>
                } @else {
                  <ion-button slot="end" size="default" (click)="confirm(d)" [attr.aria-label]="'Give ' + d.drug + ' to ' + d.patient">
                    Give
                  </ion-button>
                }
              </ion-item>
            }
          </ion-list>
        } @empty {
          <p class="empty">
            @if (filter() === 'todo') { Every dose is given. Nice work. } @else { Nothing here yet. }
          </p>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .summary { padding: 1rem 1rem .75rem; display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem 1rem; }
    .summary ion-progress-bar { flex-basis: 100%; height: 6px; border-radius: 3px; }
    .count { display: flex; align-items: baseline; gap: .4rem; }
    .big { font-size: 2.4rem; font-weight: 700; line-height: 1; color: var(--ion-color-primary); }
    .of { color: var(--ion-color-medium); }
    .overdue-chip { margin-left: auto; background: var(--mt-overdue); color: #fff; font-size: .8rem; font-weight: 600; padding: .15rem .6rem; border-radius: 999px; }
    ion-segment { margin: 0 1rem .5rem; width: calc(100% - 2rem); }
    ion-list-header { padding-top: .5rem; }
    .row { --padding-start: .75rem; border-left: 4px solid var(--c, transparent); }
    .row.overdue { --c: var(--mt-overdue); }
    .row.due { --c: var(--mt-due); }
    .row.upcoming { --c: var(--mt-upcoming); }
    .row.delivered { --c: var(--mt-done); }
    .time { font-size: 1.15rem; font-weight: 700; font-variant-numeric: tabular-nums; min-width: 3.2rem; margin-inline-end: .5rem; }
    .overdue .time { color: var(--mt-overdue); }
    h2 { font-weight: 600; margin: 0 0 .15rem; }
    .amount { font-weight: 400; color: var(--ion-color-medium); margin-left: .25rem; }
    .given { display: flex; flex-direction: column; align-items: center; color: var(--mt-done); font-size: .75rem; }
    .given ion-icon { font-size: 1.6rem; }
    .empty { text-align: center; color: var(--ion-color-medium); padding: 2.5rem 1rem; }
  `],
})
export class SchedulePage {
  readonly med = inject(MedicationService);
  private readonly queue = inject(SyncQueueService);
  private readonly net = inject(NetworkStatusService);
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);

  readonly filter = signal<Filter>('todo');
  readonly progress = computed(() => (this.med.total() ? this.med.deliveredCount() / this.med.total() : 0));

  readonly groups = computed(() => {
    const f = this.filter();
    const items = this.med.items().filter((i) => (f === 'all' ? true : f === 'done' ? !!i.delivery : !i.delivery));
    return GROUPS.map((g) => ({ ...g, items: items.filter((i) => i.status === g.key) })).filter((g) => g.items.length);
  });

  async confirm(d: DoseView): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Confirm delivery',
      message: `${d.drug} ${d.amount} (${d.route}) for ${d.patient}, bed ${d.bed}.`,
      buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Confirm', role: 'confirm' }],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') return;

    await this.med.deliver(d);
    const toast = await this.toasts.create({
      message: this.net.online() ? 'Delivery recorded.' : 'Saved on this device. It will sync when you are back online.',
      duration: 2500,
      position: 'top',
      color: this.net.online() ? 'success' : 'warning',
    });
    await toast.present();
  }

  async refresh(ev: Event): Promise<void> {
    await this.queue.flush();
    (ev.target as unknown as { complete(): void }).complete();
  }
}
