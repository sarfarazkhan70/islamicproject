export interface IslamicNameItem {
  id: string;
  number: number;
  arabic: string;
  transliteration: string;
  romanUrdu: string;
  urdu: string;
  english: string;
  explanation: string;
  reference: string;
  audioUrl?: string;
  startTime?: number;
  endTime?: number;
  category?: 'allah' | 'prophet';
}


export type NamesFilter = 'all' | 'favorites';

export interface NamesAudioState {
  currentPlayingId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Normalizes Arabic text by removing Tashkeel (diacritics) and unifying letter variants
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim()
    .toLowerCase();
}

