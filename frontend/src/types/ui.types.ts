export type Theme = 'dark' | 'light';

export interface QazaCount {
  fajr: number;
  zuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

export interface NavRoute {
  path: string;
  label: string;
  arabicLabel?: string;
  iconName: string;
  isSecondary?: boolean;
  badge?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
