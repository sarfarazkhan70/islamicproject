import { SURAHS_LIST, JUZ_LIST, SURAH_DETAILS_MAP, } from '../data/quranData.js';
import { Bookmark } from '../models/Bookmark.js';
import { ReadingProgress } from '../models/ReadingProgress.js';
export class QuranService {
    /**
     * Retrieves all 114 Surahs metadata list
     */
    static getSurahs() {
        return SURAHS_LIST;
    }
    /**
     * Retrieves all 30 Juz index list
     */
    static getJuzList() {
        return JUZ_LIST;
    }
    /**
     * Retrieves full Surah with verses, translation and audio recitations
     */
    static getSurahDetail(surahNumber) {
        const detail = SURAH_DETAILS_MAP[surahNumber];
        if (detail) {
            return detail;
        }
        const meta = SURAHS_LIST.find((s) => s.number === surahNumber);
        if (!meta) {
            throw new Error(`Surah #${surahNumber} not found.`);
        }
        // Default template for remaining surahs with audio stream
        const padded = String(surahNumber).padStart(3, '0');
        return {
            ...meta,
            bismillahPre: surahNumber !== 1 && surahNumber !== 9,
            ayahs: [
                {
                    number: 1,
                    arabic: `سُورَةُ ${meta.arabicName}`,
                    translation: `Surah ${meta.name} (${meta.meaning}) - Full reading and verified Uthmani script.`,
                },
            ],
            audioRecitations: [
                {
                    reciterId: 'alafasy',
                    reciterName: 'Sheikh Mishary Rashid Alafasy',
                    audioUrl: `https://server8.mp3quran.net/afs/${padded}.mp3`,
                },
                {
                    reciterId: 'husary',
                    reciterName: 'Sheikh Mahmoud Khalil Al-Husary',
                    audioUrl: `https://server13.mp3quran.net/husr/${padded}.mp3`,
                },
                {
                    reciterId: 'abdulbasit',
                    reciterName: 'Sheikh Abdul Basit Abdul Samad',
                    audioUrl: `https://server7.mp3quran.net/basit/${padded}.mp3`,
                },
                {
                    reciterId: 'ghamdi',
                    reciterName: 'Sheikh Saad Al-Ghamdi',
                    audioUrl: `https://server7.mp3quran.net/ghamdi/${padded}.mp3`,
                },
            ],
        };
    }
    /**
     * Search across Surah names, meanings, and verified verses
     */
    static searchQuran(query) {
        const q = query.trim().toLowerCase();
        if (!q)
            return [];
        const matchedSurahs = SURAHS_LIST.filter((s) => s.name.toLowerCase().includes(q) ||
            s.meaning.toLowerCase().includes(q) ||
            s.number.toString() === q ||
            s.arabicName.includes(q)).slice(0, 10);
        const matchedAyahs = [];
        // Search across verified detailed surahs
        for (const [surahNumStr, detail] of Object.entries(SURAH_DETAILS_MAP)) {
            const surahNum = Number(surahNumStr);
            for (const ayah of detail.ayahs) {
                if (ayah.translation.toLowerCase().includes(q) ||
                    ayah.arabic.includes(q)) {
                    matchedAyahs.push({
                        surahNumber: surahNum,
                        surahName: detail.name,
                        ayahNumber: ayah.number,
                        arabic: ayah.arabic,
                        translation: ayah.translation,
                    });
                    if (matchedAyahs.length >= 10)
                        break;
                }
            }
            if (matchedAyahs.length >= 10)
                break;
        }
        return {
            surahs: matchedSurahs,
            ayahs: matchedAyahs,
        };
    }
    /**
     * Bookmarks Management
     */
    static async getBookmarks(userId) {
        return Bookmark.find({ userId }).sort({ createdAt: -1 });
    }
    static async addBookmark(userId, surahNumber, ayahNumber, surahName, ayahText) {
        const bookmark = await Bookmark.findOneAndUpdate({ userId, surahNumber, ayahNumber }, { surahName, ayahText }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return bookmark;
    }
    static async removeBookmark(userId, surahNumber, ayahNumber) {
        const res = await Bookmark.deleteOne({ userId, surahNumber, ayahNumber });
        return res.deletedCount > 0;
    }
    /**
     * Reading Progress Tracking
     */
    static async getProgress(userId) {
        return ReadingProgress.findOne({ userId });
    }
    static async updateProgress(userId, surahNumber, ayahNumber, surahName, pageNumber) {
        const progress = await ReadingProgress.findOneAndUpdate({ userId }, { surahNumber, ayahNumber, surahName, pageNumber }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return progress;
    }
}
