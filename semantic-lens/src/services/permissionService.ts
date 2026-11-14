/**
 * Storage and Photo Library Permission Service
 * Handles Android 13+ granular READ_MEDIA_IMAGES and iOS PHPhotoLibrary permissions.
 */

export type PermissionStatus = 'granted' | 'denied' | 'limited' | 'undetermined';

export interface PermissionResponse {
  status: PermissionStatus;
  canAskAgain: boolean;
  granted: boolean;
}

export class PermissionService {
  private currentStatus: PermissionStatus = 'undetermined';

  /**
   * Checks current permission status without prompting
   */
  public async checkPermission(): Promise<PermissionResponse> {
    try {
      // Dynamic import of expo-media-library if present in runtime
      // @ts-ignore
      const MediaLibrary = await import('expo-media-library').catch(() => null);
      if (MediaLibrary) {
        const res = await MediaLibrary.getPermissionsAsync();
        this.currentStatus = res.granted ? 'granted' : (res.status === 'limited' ? 'limited' : 'denied');
        return {
          status: this.currentStatus,
          canAskAgain: res.canAskAgain,
          granted: res.granted || res.status === 'limited'
        };
      }
    } catch (e) {
      console.warn('[PermissionService] Native MediaLibrary module not detected, using simulation status.');
    }

    // Default granted in development/emulator simulation
    return {
      status: 'granted',
      canAskAgain: true,
      granted: true
    };
  }

  /**
   * Prompts user for photo library / storage access
   * Android: READ_MEDIA_IMAGES / READ_EXTERNAL_STORAGE
   * iOS: PHPhotoLibrary requestAuthorization
   */
  public async requestPermission(): Promise<PermissionResponse> {
    try {
      // @ts-ignore
      const MediaLibrary = await import('expo-media-library').catch(() => null);
      if (MediaLibrary) {
        const res = await MediaLibrary.requestPermissionsAsync();
        this.currentStatus = res.granted ? 'granted' : (res.status === 'limited' ? 'limited' : 'denied');
        return {
          status: this.currentStatus,
          canAskAgain: res.canAskAgain,
          granted: res.granted || res.status === 'limited'
        };
      }
    } catch (e) {
      console.warn('[PermissionService] Failed to request native permissions:', e);
    }

    // Dev/emulator fallback
    this.currentStatus = 'granted';
    return {
      status: 'granted',
      canAskAgain: true,
      granted: true
    };
  }

  public getStatus(): PermissionStatus {
    return this.currentStatus;
  }
}

export const permissionService = new PermissionService();
