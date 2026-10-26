export interface Dose {
  id: string;
  patient: string;
  bed: string;
  drug: string;
  amount: string;
  route: string;
  /** ISO date-time the dose is due */
  scheduledAt: string;
  note?: string;
}

export interface Delivery {
  doseId: string;
  deliveredAt: string;
  deliveredBy: string;
  /** false while the record only exists on this device */
  synced: boolean;
}

export type DoseStatus = 'overdue' | 'due' | 'upcoming' | 'delivered';

export interface DoseView extends Dose {
  status: DoseStatus;
  delivery?: Delivery;
}

export interface PendingAction {
  id: string;
  doseId: string;
  deliveredAt: string;
  deliveredBy: string;
}
