import mongoose from 'mongoose';
import {
  SURAHS_LIST,
  JUZ_LIST,
  SurahMeta,
  JuzMeta,
  SurahDetail,
} from '../data/quranData.js';
import { Bookmark, IBookmark } from '../models/Bookmark.js';
import { ReadingProgress, IReadingProgress } from '../models/ReadingProgress.js';

export class QuranService {
  /**
   * Retrieves all 114 Surahs metadata list
   */
  static getSurahs(): SurahMeta[] {
    return SURAHS_LIST;
  }

  /**
   * Retrieves all 30 Juz index list
   */
  static getJuzList(): JuzMeta[] {
    return JUZ_LIST;
  }

  /**
   * Retrieves full Surah with verses from Quran.com API
   */
  static async getSurahDetail(surahNumber: number): Promise<SurahDetail> {
    const meta = SURAHS_LIST.find((s) => s.number === surahNumber);
    if (!meta) {
      throw new Error(`Surah #${surahNumber} not found.`);
    }

    const padded = String(surahNumber).padStart(3, '0');
    const audioRecitations = [
      {
        reciterId: '7',
        reciterName: 'Sheikh Mishary Rashid Alafasy',
        audioUrl: `https://server8.mp3quran.net/afs/${padded}.mp3`,
      },
      {
        reciterId: '6',
        reciterName: 'Sheikh Mahmoud Khalil Al-Husary',
        audioUrl: `https://server13.mp3quran.net/husr/${padded}.mp3`,
      },
      {
        reciterId: '2',
        reciterName: 'Sheikh Abdul Basit Abdul Samad',
        audioUrl: `https://server7.mp3quran.net/basit/${padded}.mp3`,
      },
    ];

    try {
      const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?per_page=300&fields=text_uthmani,text_indopak,text_imlaei&translations=20,234`
      );
      if (res.ok) {
        const data: any = await res.json();
        const ayahs = (data.verses || []).map((v: any) => ({
          number: v.verse_number,
          arabic: v.text_uthmani || v.text_indopak || '',
          translation: v.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '') || '',
          translationUrdu: v.translations?.[1]?.text?.replace(/<[^>]*>?/gm, '') || '',
          juz: v.juz_number,
          page: v.page_number,
        }));

        return {
          ...meta,
          bismillahPre: surahNumber !== 1 && surahNumber !== 9,
          ayahs,
          audioRecitations,
        };
      }
    } catch {
      // Fallback
    }

    return {
      ...meta,
      bismillahPre: surahNumber !== 1 && surahNumber !== 9,
      ayahs: [],
      audioRecitations,
    };
  }

  /**
   * Search across Surah names and meanings
   */
  static searchQuran(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { surahs: [], ayahs: [] };

    const matchedSurahs = SURAHS_LIST.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        s.number.toString() === q ||
        s.arabicName.includes(q)
    ).slice(0, 15);

    return {
      surahs: matchedSurahs,
      ayahs: [],
    };
  }

  /**
   * Bookmarks Management
   */
  static async getBookmarks(userId: string | mongoose.Types.ObjectId): Promise<IBookmark[]> {
    return Bookmark.find({ userId }).sort({ createdAt: -1 });
  }

  static async addBookmark(
    userId: string | mongoose.Types.ObjectId,
    surahNumber: number,
    ayahNumber: number,
    surahName: string,
    ayahText?: string
  ): Promise<IBookmark> {
    const bookmark = await Bookmark.findOneAndUpdate(
      { userId, surahNumber, ayahNumber },
      { surahName, ayahText },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return bookmark;
  }

  static async removeBookmark(
    userId: string | mongoose.Types.ObjectId,
    surahNumber: number,
    ayahNumber: number
  ): Promise<boolean> {
    const res = await Bookmark.deleteOne({ userId, surahNumber, ayahNumber });
    return res.deletedCount > 0;
  }

  /**
   * Reading Progress Tracking
   */
  static async getProgress(
    userId: string | mongoose.Types.ObjectId
  ): Promise<IReadingProgress | null> {
    return ReadingProgress.findOne({ userId });
  }

  static async updateProgress(
    userId: string | mongoose.Types.ObjectId,
    surahNumber: number,
    ayahNumber: number,
    surahName: string,
    pageNumber?: number
  ): Promise<IReadingProgress> {
    const progress = await ReadingProgress.findOneAndUpdate(
      { userId },
      { surahNumber, ayahNumber, surahName, pageNumber },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return progress;
  }
}
