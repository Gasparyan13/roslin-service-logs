export type ServiceType = 'planned' | 'unplanned' | 'emergency';

export interface ServiceLogBase {
  providerId: string;
  serviceOrder: string;
  carId: string;
  odometer: number;
  engineHours: number;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  type: ServiceType;
  serviceDescription: string;
}

export interface ServiceLog extends ServiceLogBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLogDraft extends ServiceLogBase {
  id: string;
  isSaved: boolean;
  lastSavedAt?: string;
}
