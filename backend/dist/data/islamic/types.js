/**
 * Normalizes Arabic text by removing Tashkeel (diacritics) and unifying letter variants
 */
export function normalizeArabicText(text) {
    if (!text)
        return '';
    return text
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/[إأآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .trim()
        .toLowerCase();
}
