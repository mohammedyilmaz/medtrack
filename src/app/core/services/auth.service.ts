import { Injectable, signal } from '@angular/core';

export interface Nurse {
  username: string;
  name: string;
}

// Demo-only credentials. A real app would authenticate against a backend.
const NURSES = [{ username: 'nurse', password: 'nurse123', name: 'Nurse Emma Carter' }];
const KEY = 'medtrack:user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<Nurse | null>(this.load());

  login(username: string, password: string): boolean {
    const found = NURSES.find((n) => n.username === username.trim().toLowerCase() && n.password === password);
    if (!found) return false;
    const user = { username: found.username, name: found.name };
    this.user.set(user);
    try { localStorage.setItem(KEY, JSON.stringify(user)); } catch { /* ignore */ }
    return true;
  }

  logout(): void {
    this.user.set(null);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }

  private load(): Nurse | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Nurse) : null;
    } catch {
      return null;
    }
  }
}
