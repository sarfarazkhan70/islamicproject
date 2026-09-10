import fs from 'fs';

async function main() {
  const res = await fetch('https://archive.org/metadata/kanzuliman_201907');
  const data = await res.json();
  const mp3s = data.files.filter(f => f.name.endsWith('.mp3') && f.format === 'VBR MP3');
  const surahMap = {};
  for (let i = 1; i <= 114; i++) {
    surahMap[i] = [];
  }

  mp3s.forEach(f => {
    const match = f.name.match(/^(\d{3})\.\s*(.+)\.mp3$/i);
    if (match) {
      const sNum = parseInt(match[1], 10);
      surahMap[sNum].push({
        fileName: f.name,
        title: f.title || match[2].replace(/_/g, ' '),
        duration: parseFloat(f.length || '0'),
        sizeBytes: parseInt(f.size || '0', 10),
        url: 'https://archive.org/download/kanzuliman_201907/' + encodeURIComponent(f.name)
      });
    }
  });

  for (let i = 1; i <= 114; i++) {
    surahMap[i].sort((a, b) => a.fileName.localeCompare(b.fileName));
  }

  const output = `/**
 * Complete Authentic Kanz-ul-Iman Audio Dataset
 * Source: Internet Archive (kanzuliman_201907) - Complete Audio QURAN (Kanzul Iman)
 * Creator: Ala Hazrat Imam Ahmad Raza Khan (Paigham-e-Raza)
 * Description: Tilawat of the Holy Quran with Authentic Kanz-ul-Iman Urdu Translation
 * Total: 114 Surahs (142 MP3 Tracks covering full Surahs with multi-part support)
 */

export interface KanzulImanAudioTrack {
  fileName: string;
  title: string;
  duration: number; // in seconds
  sizeBytes: number;
  url: string;
}

export const KANZUL_IMAN_ARCHIVE_IDENTIFIER = 'kanzuliman_201907';
export const KANZUL_IMAN_BASE_URL = 'https://archive.org/download/kanzuliman_201907/';

export const KANZUL_IMAN_AUDIO_MAP: Record<number, KanzulImanAudioTrack[]> = ${JSON.stringify(surahMap, null, 2)};

/**
 * Returns all audio tracks (parts) for a given Surah number (1-114)
 */
export function getKanzulImanAudioTracks(surahNumber: number): KanzulImanAudioTrack[] {
  const clamped = Math.max(1, Math.min(114, surahNumber));
  return KANZUL_IMAN_AUDIO_MAP[clamped] || [];
}

/**
 * Returns the audio URL for a specific Surah and part index (0-based)
 */
export function getKanzulImanSurahAudioUrl(surahNumber: number, partIndex: number = 0): string {
  const tracks = getKanzulImanAudioTracks(surahNumber);
  if (tracks.length === 0) return '';
  const validIndex = Math.max(0, Math.min(tracks.length - 1, partIndex));
  return tracks[validIndex].url;
}

/**
 * Returns whether a Surah is divided into multiple audio parts
 */
export function isKanzulImanMultiPart(surahNumber: number): boolean {
  const tracks = getKanzulImanAudioTracks(surahNumber);
  return tracks.length > 1;
}

/**
 * Returns the total duration in seconds for a Surah across all its parts
 */
export function getKanzulImanSurahDuration(surahNumber: number): number {
  const tracks = getKanzulImanAudioTracks(surahNumber);
  return tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
}
`;

  fs.writeFileSync('src/data/kanzulImanAudioData.ts', output, 'utf-8');
  console.log('Successfully generated src/data/kanzulImanAudioData.ts');
}

main().catch(console.error);
