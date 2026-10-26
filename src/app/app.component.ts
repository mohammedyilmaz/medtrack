import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle, checkmarkCircle, cloudDoneOutline, cloudOfflineOutline, ellipseOutline, listOutline,
  lockClosedOutline, logOutOutline, medkitOutline, personOutline, refreshOutline, settingsOutline,
  syncOutline, timeOutline, trashOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
export class AppComponent {
  constructor() {
    addIcons({
      alertCircle, checkmarkCircle, cloudDoneOutline, cloudOfflineOutline, ellipseOutline, listOutline,
      lockClosedOutline, logOutOutline, medkitOutline, personOutline, refreshOutline, settingsOutline,
      syncOutline, timeOutline, trashOutline,
    });
  }
}
