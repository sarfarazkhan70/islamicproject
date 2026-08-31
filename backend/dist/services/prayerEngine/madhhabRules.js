/**
 * SUNNI MADHHAB AS'R SHADOW RULES
 * ==============================================================================
 * Madhhab shadow factor definitions for the four Sunni juristic schools:
 *
 * 1. Hanafi School (Imam Abu Hanifa):
 *    Asr begins when the shadow of any object becomes TWICE the length of the
 *    object, in addition to the shadow at solar noon (Mithlayn - 2x shadow).
 *
 * 2. Shafi'i School (Imam al-Shafi'i):
 *    Asr begins when the shadow of any object becomes EQUAL to the length of
 *    the object, in addition to the shadow at solar noon (Mithl - 1x shadow).
 *
 * 3. Maliki School (Imam Malik ibn Anas):
 *    Follows the 1x shadow factor (Mithl).
 *
 * 4. Hanbali School (Imam Ahmad ibn Hanbal):
 *    Follows the 1x shadow factor (Mithl).
 * ==============================================================================
 */
export const MADHHAB_RULES = {
    hanafi: {
        key: 'hanafi',
        name: 'Hanafi',
        arabicName: 'الحنفي',
        imam: 'Imam Abu Hanifah (RA)',
        shadowFactor: 2,
        description: 'Asr starts when shadow reaches twice the object height (Mithlayn).',
    },
    shafii: {
        key: 'shafii',
        name: "Shafi'i",
        arabicName: 'الشافعي',
        imam: "Imam Muhammad ibn Idris al-Shafi'i (RA)",
        shadowFactor: 1,
        description: 'Asr starts when shadow equals the object height (Mithl).',
    },
    maliki: {
        key: 'maliki',
        name: 'Maliki',
        arabicName: 'المالكي',
        imam: 'Imam Malik ibn Anas (RA)',
        shadowFactor: 1,
        description: 'Asr starts when shadow equals the object height (Mithl).',
    },
    hanbali: {
        key: 'hanbali',
        name: 'Hanbali',
        arabicName: 'الحنبلي',
        imam: 'Imam Ahmad ibn Hanbal (RA)',
        shadowFactor: 1,
        description: 'Asr starts when shadow equals the object height (Mithl).',
    },
};
export function getMadhhabShadowMultiplier(madhhab = 'hanafi') {
    return MADHHAB_RULES[madhhab]?.shadowFactor ?? 2;
}
