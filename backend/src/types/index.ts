// Backend Shared Type Definitions (Phase 1 Foundation)

export type SunniMadhhab = 'hanafi' | 'shafii' | 'maliki' | 'hanbali';

export type CalculationConvention =
  | 'Karachi'
  | 'MWL'
  | 'ISNA'
  | 'Egypt'
  | 'Makkah'
  | 'Tehran'
  | 'Gulf'
  | 'Moonsighting';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}
