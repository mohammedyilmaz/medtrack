import { Injectable, computed, inject, signal } from '@angular/core';
import { Delivery, Dose, DoseStatus, DoseView } from '../models/medication';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { SyncQueueService } from './sync-queue.service';

const MIN = 60_000;
const DUE_WINDOW = 30 * MIN;

// [minutes from "now" at seed time, patient, bed, drug, amount, route, note]
// Relative times mean the demo always has overdue, due and upcoming doses.
const SEED_ROWS: [number, string, string, string, string, string, string?][] = [
  [-150, 'Ahmed Al-Farsi', 'ICU-01', 'Metoprolol', '50 mg', 'Oral'],
  [-95, 'Maria Gonzalez', 'ICU-02', 'Vancomycin', '1 g', 'IV', 'Infuse over 60 minutes'],
  [-45, 'John Becker', 'ICU-03', 'Salbutamol', '2.5 mg', 'Nebulised'],
  [-20, 'Leyla Demir', 'ICU-04', 'Levetiracetam', '500 mg', 'IV'],
  [-5, 'Omar Haddad', 'CAR-11', 'Apixaban', '5 mg', 'Oral', 'Check for bleeding first'],
  [10, 'Sophie Laurent', 'CAR-12', 'Furosemide', '40 mg', 'IV'],
  [25, 'Chen Wei', 'CAR-13', 'Aspirin', '75 mg', 'Oral'],
  [55, 'David Smith', 'GEN-21', 'Amoxicillin', '500 mg', 'Oral', 'Give with food'],
  [85, 'Yusuf Aydin', 'GEN-23', 'Insulin glargine', '20 units', 'SC', 'Check glucose before dose'],
  [120, 'Aylin Kaya', 'GEN-22', 'Paracetamol', '1 g', 'Oral'],
  [180, 'Emma Wilson', 'GEN-24', 'Enoxaparin', '40 mg', 'SC'],
  [240, 'Fatima Zahra', 'CAR-14', 'Bisoprolol', '2.5 mg', 'Oral'],
];

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private readonly storage = inject(StorageService);
  private readonly queue = inject(SyncQueueService);
  private readonly auth = inject(AuthService);

  readonly doses = signal<Dose[]>([]);
  readonly deliveries = signal<Delivery[]>([]);
  readonly loaded = signal(false);
  /** Ticks every 30 s so statuses (overdue / due) move on their own */
  readonly now = signal(Date.now());

  readonly items = computed<DoseView[]>(() => {
    const byDose = new Map(this.deliveries().map((d) => [d.doseId, d]));
    const now = this.now();
    return this.doses()
      .map((d) => {
        const delivery = byDose.get(d.id);
        return { ...d, delivery, status: this.statusOf(d, delivery, now) };
      })
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  });

  readonly total = computed(() => this.doses().length);
  readonly deliveredCount = computed(() => this.deliveries().length);
  readonly overdueCount = computed(() => this.items().filter((i) => i.status === 'overdue').length);

  readonly history = computed(() =>
    this.items()
      .filter((i) => i.delivery)
      .sort((a, b) => b.delivery!.deliveredAt.localeCompare(a.delivery!.deliveredAt)),
  );

  constructor() {
    setInterval(() => this.now.set(Date.now()), 30_000);
    this.queue.confirmed.subscribe((doseId) => this.markSynced(doseId));
    void this.init();
  }

  async deliver(dose: Dose): Promise<void> {
    if (this.deliveries().some((d) => d.doseId === dose.id)) return;
    const by = this.auth.user()?.name ?? 'Unknown';
    const deliveredAt = new Date().toISOString();

    // 1) Save on the device first, so the nurse never waits for the network.
    this.deliveries.update((l) => [...l, { doseId: dose.id, deliveredAt, deliveredBy: by, synced: false }]);
    await this.storage.set('deliveries', this.deliveries());

    // 2) Queue it for the server; it is sent now if online, or as soon as the connection returns.
    await this.queue.enqueue({ id: crypto.randomUUID(), doseId: dose.id, deliveredAt, deliveredBy: by });
  }

  async resetDemo(): Promise<void> {
    await this.queue.clear();
    for (const key of ['doses', 'deliveries', 'seededOn', 'server']) await this.storage.remove(key);
    await this.init();
  }

  private async init(): Promise<void> {
    const today = new Date().toDateString();
    const seededOn = await this.storage.get<string>('seededOn', '');
    let doses = await this.storage.get<Dose[]>('doses', []);
    let deliveries = await this.storage.get<Delivery[]>('deliveries', []);

    if (seededOn !== today || doses.length === 0) {
      ({ doses, deliveries } = this.seed());
      await this.storage.set('doses', doses);
      await this.storage.set('deliveries', deliveries);
      await this.storage.set('seededOn', today);
    }
    this.doses.set(doses);
    this.deliveries.set(deliveries);
    this.loaded.set(true);
  }

  private seed(): { doses: Dose[]; deliveries: Delivery[] } {
    const base = Date.now();
    const doses: Dose[] = SEED_ROWS.map(([offset, patient, bed, drug, amount, route, note], i) => ({
      id: `dose-${i + 1}`,
      patient, bed, drug, amount, route, note,
      scheduledAt: new Date(base + offset * MIN).toISOString(),
    }));
    // The two earliest doses were already given this morning, so History is not empty.
    const deliveries: Delivery[] = doses.slice(0, 2).map((d) => ({
      doseId: d.id,
      deliveredAt: new Date(new Date(d.scheduledAt).getTime() + 4 * MIN).toISOString(),
      deliveredBy: 'Nurse Emma Carter',
      synced: true,
    }));
    return { doses, deliveries };
  }

  private markSynced(doseId: string): void {
    this.deliveries.update((l) => l.map((d) => (d.doseId === doseId ? { ...d, synced: true } : d)));
    void this.storage.set('deliveries', this.deliveries());
  }

  private statusOf(d: Dose, delivery: Delivery | undefined, now: number): DoseStatus {
    if (delivery) return 'delivered';
    const diff = new Date(d.scheduledAt).getTime() - now;
    if (diff < -DUE_WINDOW) return 'overdue';
    if (diff <= DUE_WINDOW) return 'due';
    return 'upcoming';
  }
}
