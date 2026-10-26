import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IonContent, IonInput, IonButton, IonIcon],
  template: `
    <ion-content [fullscreen]="true">
      <main class="wrap">
        <div class="brand"><ion-icon name="medkit-outline" /><h1>MedTrack</h1></div>
        <p class="tagline">Medication rounds that keep working when the network does not.</p>

        <form (ngSubmit)="submit()">
          <ion-input label="Username" labelPlacement="floating" fill="outline" name="username"
                     [(ngModel)]="username" autocomplete="username" />
          <ion-input label="Password" labelPlacement="floating" fill="outline" type="password" name="password"
                     [(ngModel)]="password" autocomplete="current-password" />

          @if (error()) { <p class="error" role="alert">{{ error() }}</p> }

          <ion-button type="submit" expand="block" [disabled]="!username || !password">Sign in</ion-button>
          <ion-button type="button" expand="block" fill="outline" (click)="useDemo()">Use the demo nurse account</ion-button>
        </form>

        <p class="hint">Demo account: nurse / nurse123. All patients are fictional.</p>
      </main>
    </ion-content>
  `,
  styles: [`
    .wrap { max-width: 380px; margin: 0 auto; padding: 14vh 1.25rem 2rem; display: flex; flex-direction: column; gap: .5rem; }
    .brand { display: flex; align-items: center; gap: .6rem; color: var(--ion-color-primary); }
    .brand ion-icon { font-size: 2.2rem; }
    h1 { margin: 0; font-size: 2rem; font-weight: 700; }
    .tagline { margin: 0 0 1.25rem; color: var(--ion-color-medium); }
    form { display: flex; flex-direction: column; gap: .9rem; }
    .error { color: var(--ion-color-danger); margin: 0; font-size: .9rem; }
    .hint { color: var(--ion-color-medium); font-size: .8rem; margin-top: 1rem; }
  `],
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly error = signal('');

  useDemo(): void {
    this.username = 'nurse';
    this.password = 'nurse123';
    this.submit();
  }

  submit(): void {
    if (this.auth.login(this.username, this.password)) {
      this.router.navigateByUrl('/schedule', { replaceUrl: true });
    } else {
      this.error.set('Wrong username or password. Use the demo account below.');
    }
  }
}
