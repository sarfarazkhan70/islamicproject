import React, { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { getDailyHadith, getHadithByNumber, DailyHadith } from '../../data/dailyHadithData';
import { HijriDate } from '../../utils/hijriCalendar';
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DailyHadithCardProps {
  date?: Date | string | HijriDate | { year?: number; month?: number; day?: number };
  hadithNumber?: number;
  className?: string;
}

export const DailyHadithCard: React.FC<DailyHadithCardProps> = ({
  date,
  hadithNumber,
  className = '',
}) => {
  const [hadith, setHadith] = useState<DailyHadith>(() => {
    if (hadithNumber) {
      const target = getHadithByNumber(hadithNumber);
      if (target) return target;
    }
    return getDailyHadith(date);
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hadithNumber) {
      const target = getHadithByNumber(hadithNumber);
      if (target) {
        setHadith(target);
        return;
      }
    }
    setHadith(getDailyHadith(date));
  }, [date, hadithNumber]);

  const handleCopyText = () => {
    const text = `📖 Sahih al-Bukhari — Hadith No. ${hadith.hadithNumber} (${hadith.reference})\n\n${hadith.arabicText}\n\nاردو ترجمہ:\n${hadith.urduTranslation}\n\nEnglish Translation:\n${hadith.englishTranslation}\n\n— Sahih al-Bukhari (صحیح البخاری)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={`daily-hadith-card ${className}`}>
      {/* Header Row: Badge & Center-Aligned Styled Combined Heading Box */}
      <div className="hadith-card-header">
        <div className="hadith-badge-group">
          <span className="hadith-pill-gold">
            <Sparkles size={13} className="text-gold" />
            <span>Hadith of the Day • آج کی حدیث</span>
          </span>
        </div>
        <div className="hadith-heading-box">
          <h2 className="hadith-theme-title">
            {hadith.theme || 'Purity of the Heart (طہارتِ قلب اور باطن)'}
          </h2>
        </div>
      </div>

      {/* Main Content: Exact Hierarchy Required */}
      <div className="hadith-content-stack">
        {/* 1. ARABIC HADITH TEXT (TOP) */}
        <div className="hadith-section-box hadith-arabic-box">
          <div className="hadith-section-meta">
            <span className="hadith-section-tag hadith-tag-arabic">
              الحديث الشريف (عربي)
            </span>
          </div>

          <p className="hadith-arabic-text" dir="rtl" lang="ar">
            {hadith.arabicText}
          </p>

          <div className="hadith-narrator-arabic" dir="rtl">
            <span className="narrator-label">راوي:</span> {hadith.narrator}
          </div>
        </div>

        {/* 2. URDU TRANSLATION (BELOW ARABIC) */}
        <div className="hadith-section-box hadith-urdu-box">
          <div className="hadith-section-meta">
            <div className="hadith-urdu-meta-group">
              <span className="hadith-section-tag hadith-tag-urdu">
                اردو ترجمہ (مفہومِ حدیث)
              </span>
              <span className="hadith-translator-pill">
                ترجمہ: {hadith.urduTranslator || 'اعلیٰ حضرت امام احمد رضا خان علیہ الرحمہ'}
              </span>
            </div>
          </div>

          {hadith.hasAlaHazratTranslation ? (
            <p className="hadith-urdu-text" dir="rtl" lang="ur">
              {hadith.urduTranslation}
            </p>
          ) : (
            <p className="text-sm text-muted" dir="rtl" style={{ fontStyle: 'italic', padding: 'var(--space-2) 0' }}>
              اس حدیث مبارکہ کا ترجمہ اعلیٰ حضرت کتب خانہ ایڈیشن کے مطابق جلد شامل کیا جائے گا۔
            </p>
          )}
        </div>

        {/* 3. ENGLISH TRANSLATION (BELOW URDU) */}
        <div className="hadith-section-box hadith-english-box">
          <div className="hadith-section-meta">
            <span className="hadith-section-tag hadith-tag-english">
              English Translation
            </span>
          </div>

          <p className="hadith-english-text" dir="ltr" lang="en">
            {hadith.englishTranslation}
          </p>
        </div>

        {/* 4. HADITH REFERENCE & SOURCE (BOTTOM) */}
        <div className="hadith-footer-bar">
          <div className="hadith-reference-info">
            <Link
              to={hadith.libraryReadUrl}
              className="hadith-ref-badge"
              title={`Open Sahih al-Bukhari Hadith No. ${hadith.hadithNumber} in Bukhari Sharif Library (Page ${hadith.pageNumber})`}
            >
              <BookOpen size={14} className="text-gold" />
              <strong>Sahih al-Bukhari — Hadith No. {hadith.hadithNumber}</strong>
            </Link>
            <span className="hadith-chapter-text">
              {hadith.bookNameEnglish} ({hadith.bookNameArabic}) • Islamic Library
            </span>
          </div>

          <div className="hadith-footer-actions">
            <button
              type="button"
              onClick={handleCopyText}
              className="btn btn-sm btn-outline hadith-action-btn"
              title="Copy Hadith & Translations"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} style={{ color: 'var(--brand-primary)' }} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <span>Share / Copy</span>
                </>
              )}
            </button>

            <Link
              to={hadith.libraryReadUrl}
              className="btn btn-sm btn-secondary hadith-action-btn"
              title={`Open Sahih al-Bukhari Hadith No. ${hadith.hadithNumber} in Bukhari Sharif Library`}
            >
              <span>Read in Library</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
