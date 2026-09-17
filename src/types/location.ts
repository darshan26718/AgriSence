export type LocationPermissionStatus =
  | 'idle'
  | 'requesting'
  | 'enabled'
  | 'denied'
  | 'unavailable';

export interface UserLiveLocation {
  status: LocationPermissionStatus;
  coords: { lat: number; lng: number } | null;
  approxAddress?: string;
  accuracyMeters?: number;
  timestamp?: number;
  errorMessage?: string;
}
