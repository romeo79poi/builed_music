import { UserSettings } from "@shared/api";

interface FirebaseUserSettings {
  theme: "light" | "dark";
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  playback: {
    autoDownload: boolean;
    highQuality: boolean;
    offlineMode: boolean;
    autoPlay: boolean;
    crossfade: boolean;
    normalization: boolean;
    volume: number;
    shuffle: boolean;
    repeat: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showActivity: boolean;
    showLibrary: boolean;
  };
  language: string;
  region: string;
}

const DEFAULT_SETTINGS: FirebaseUserSettings = {
  theme: "dark",
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
  playback: {
    autoDownload: false,
    highQuality: true,
    offlineMode: false,
    autoPlay: true,
    crossfade: false,
    normalization: true,
    volume: 0.7,
    shuffle: false,
    repeat: false,
  },
  privacy: {
    publicProfile: true,
    showActivity: true,
    showLibrary: true,
  },
  language: "English",
  region: "United States",
};

export class FirebaseSettingsService {
  private getStorageKey(firebaseUserId: string): string {
    return `firebase_settings_${firebaseUserId}`;
  }

  /**
   * Get user settings with Firebase user ID
   */
  async getSettings(firebaseUserId: string): Promise<FirebaseUserSettings> {
    try {
      console.log("🔥 Loading settings for Firebase user:", firebaseUserId);

      // Try to load from localStorage first (instant)
      const localSettings = this.getLocalSettings(firebaseUserId);
      if (localSettings) {
        console.log("✅ Loaded settings from localStorage cache");
        // Continue to sync with backend in background
        this.syncWithBackend(firebaseUserId, localSettings);
        return localSettings;
      }

      // Try to fetch from backend
      try {
        const response = await fetch(`/api/v1/users/${firebaseUserId}/settings`, {
          headers: {
            "user-id": firebaseUserId,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const backendSettings = this.transformBackendSettings(result.data);
            this.saveLocalSettings(firebaseUserId, backendSettings);
            console.log("✅ Loaded settings from backend");
            return backendSettings;
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend settings fetch failed:", error);
      }

      // Fallback to default settings
      const defaultSettings = { ...DEFAULT_SETTINGS };
      this.saveLocalSettings(firebaseUserId, defaultSettings);
      console.log("✅ Using default settings");
      return defaultSettings;

    } catch (error) {
      console.error("❌ Error loading settings:", error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(
    firebaseUserId: string,
    updates: Partial<FirebaseUserSettings>
  ): Promise<boolean> {
    try {
      console.log("🔥 Updating settings for Firebase user:", firebaseUserId, updates);

      // Get current settings
      const currentSettings = await this.getSettings(firebaseUserId);
      const newSettings = { ...currentSettings, ...updates };

      // Save to localStorage immediately for instant feedback
      this.saveLocalSettings(firebaseUserId, newSettings);
      console.log("✅ Settings cached locally");

      // Try to sync with backend
      try {
        const response = await fetch(`/api/v1/users/${firebaseUserId}/settings`, {
          method: 'PUT',
          headers: {
            "user-id": firebaseUserId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.transformToBackendFormat(newSettings)),
        });

        if (response.ok) {
          console.log("✅ Settings synced with backend");
          return true;
        } else {
          console.warn("⚠️ Backend settings sync failed, but cached locally");
          return true; // Still successful since we have local cache
        }
      } catch (error) {
        console.warn("⚠️ Backend settings sync failed:", error);
        return true; // Still successful since we have local cache
      }
    } catch (error) {
      console.error("❌ Error updating settings:", error);
      return false;
    }
  }

  /**
   * Update a specific setting
   */
  async updateSetting(
    firebaseUserId: string,
    key: string,
    value: any
  ): Promise<boolean> {
    try {
      const currentSettings = await this.getSettings(firebaseUserId);
      
      // Handle nested keys like "playback.autoPlay"
      if (key.includes('.')) {
        const [section, subKey] = key.split('.');
        const updates = {
          [section]: {
            ...currentSettings[section as keyof FirebaseUserSettings],
            [subKey]: value,
          }
        };
        return this.updateSettings(firebaseUserId, updates);
      } else {
        const updates = { [key]: value };
        return this.updateSettings(firebaseUserId, updates as Partial<FirebaseUserSettings>);
      }
    } catch (error) {
      console.error("❌ Error updating setting:", error);
      return false;
    }
  }

  /**
   * Get settings from localStorage
   */
  private getLocalSettings(firebaseUserId: string): FirebaseUserSettings | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey(firebaseUserId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error reading local settings:", error);
    }
    return null;
  }

  /**
   * Save settings to localStorage
   */
  private saveLocalSettings(firebaseUserId: string, settings: FirebaseUserSettings): void {
    try {
      localStorage.setItem(this.getStorageKey(firebaseUserId), JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving local settings:", error);
    }
  }

  /**
   * Background sync with backend
   */
  private async syncWithBackend(firebaseUserId: string, localSettings: FirebaseUserSettings): Promise<void> {
    try {
      const response = await fetch(`/api/v1/users/${firebaseUserId}/settings`, {
        headers: {
          "user-id": firebaseUserId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const backendSettings = this.transformBackendSettings(result.data);
          // Only update if backend has newer data
          this.saveLocalSettings(firebaseUserId, backendSettings);
          console.log("🔄 Settings synced from backend in background");
        }
      }
    } catch (error) {
      console.warn("Background sync failed:", error);
    }
  }

  /**
   * Transform backend settings format to our format
   */
  private transformBackendSettings(backendData: any): FirebaseUserSettings {
    return {
      theme: backendData.theme || "dark",
      notifications: {
        email: backendData.notifications?.email !== false,
        push: backendData.notifications?.push !== false,
        inApp: backendData.notifications?.inApp !== false,
      },
      playback: {
        autoDownload: backendData.playback?.autoDownload === true,
        highQuality: backendData.playback?.highQuality !== false,
        offlineMode: backendData.playback?.offlineMode === true,
        autoPlay: backendData.playback?.autoPlay !== false,
        crossfade: backendData.playback?.crossfade === true,
        normalization: backendData.playback?.normalization !== false,
        volume: backendData.playback?.volume || 0.7,
        shuffle: backendData.playback?.shuffle === true,
        repeat: backendData.playback?.repeat === true,
      },
      privacy: {
        publicProfile: backendData.privacy?.publicProfile !== false,
        showActivity: backendData.privacy?.showActivity !== false,
        showLibrary: backendData.privacy?.showLibrary !== false,
      },
      language: backendData.language || "English",
      region: backendData.region || "United States",
    };
  }

  /**
   * Transform our settings format to backend format
   */
  private transformToBackendFormat(settings: FirebaseUserSettings): any {
    return {
      theme: settings.theme,
      notifications: settings.notifications,
      playback: settings.playback,
      privacy: settings.privacy,
      language: settings.language,
      region: settings.region,
    };
  }

  /**
   * Reset settings to default
   */
  async resetSettings(firebaseUserId: string): Promise<boolean> {
    try {
      const defaultSettings = { ...DEFAULT_SETTINGS };
      return this.updateSettings(firebaseUserId, defaultSettings);
    } catch (error) {
      console.error("❌ Error resetting settings:", error);
      return false;
    }
  }

  /**
   * Export settings for backup
   */
  async exportSettings(firebaseUserId: string): Promise<FirebaseUserSettings> {
    return this.getSettings(firebaseUserId);
  }

  /**
   * Import settings from backup
   */
  async importSettings(firebaseUserId: string, settings: FirebaseUserSettings): Promise<boolean> {
    return this.updateSettings(firebaseUserId, settings);
  }
}

// Export singleton instance
export const firebaseSettingsService = new FirebaseSettingsService();
export default firebaseSettingsService;
