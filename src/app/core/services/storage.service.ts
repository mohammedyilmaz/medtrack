import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Thin JSON wrapper over Capacitor Preferences.
 * On the web it uses localStorage; on Android/iOS it uses native storage, so data survives app restarts.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'medtrack:';

  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const { value } = await Preferences.get({ key: this.prefix + key });
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Preferences.set({ key: this.prefix + key, value: JSON.stringify(value) });
    } catch (e) {
      console.error('Could not save', key, e);
    }
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key: this.prefix + key });
  }
}
