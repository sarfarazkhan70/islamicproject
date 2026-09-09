import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  KANZUL_IMAN_MIN_PAGE,
  KANZUL_IMAN_MAX_PAGE,
  getKanzulImanPageForSurah,
  getKanzulImanPageForJuz,
  getKanzulImanSurahByPage,
  getKanzulImanJuzByPage,
} from '../../data/kanzulImanData';
import { KanzulImanService } from '../../services/kanzulImanService';
import { SURAHS_LIST, JUZ_LIST } from '../../data/quranData';
import { useQuranStore } from '../../stores/useQuranStore';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Bookmark,
} from 'lucide-react';

interface KanzulImanPageViewerProps {
  initialPage?: number;
}

// Generate the array of all 1,198 Kanz-ul-Iman Mushaf pages (1 to 1198)
const ALL_PAGES = Array.from(
  { length: KANZUL_IMAN_MAX_PAGE - KANZUL_IMAN_MIN_PAGE + 1 },
  (_, i) => KANZUL_IMAN_MIN_PAGE + i
);

export const KanzulImanPageViewerComponent: React.FC<KanzulImanPageViewerProps> = ({
  initialPage = KANZUL_IMAN_MIN_PAGE,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPage.toString());
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const activePageRef = useRef<number>(currentPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { bookmarks, toggleBookmark } = useQuranStore();

  const currentSurahNum = getKanzulImanSurahByPage(currentPage);
  const currentJuzNum = getKanzulImanJuzByPage(currentPage);
  const currentSurahMeta = SURAHS_LIST[currentSurahNum - 1] || SURAHS_LIST[0];
  const currentJuzMeta = JUZ_LIST[currentJuzNum - 1] || JUZ_LIST[0];

  const isPageBookmarked = bookmarks.some(
    (b) => b.type === 'page' && b.pageNumber === currentPage
  );

  // Sync direct input box with current page
  useEffect(() => {
    setDirectPageInput(currentPage.toString());
  }, [currentPage]);

  // Smooth or instant scroll to target Mushaf page
  const scrollToPage = useCallback((page: number, behavior: ScrollBehavior = 'auto') => {
    const clamped = Math.max(KANZUL_IMAN_MIN_PAGE, Math.min(KANZUL_IMAN_MAX_PAGE, page));
    setCurrentPage(clamped);
    activePageRef.current = clamped;
    isProgrammaticScrollRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const performScroll = () => {
      const el = document.getElementById(`kanzul-mushaf-page-${clamped}`);
      if (el) {
        const yOffset = -130;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior });
      }
    };

    performScroll();
    requestAnimationFrame(performScroll);

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 400);
  }, []);

  // Initial scroll on mount and when initialPage prop changes
  useEffect(() => {
    if (initialPage && initialPage >= KANZUL_IMAN_MIN_PAGE && initialPage <= KANZUL_IMAN_MAX_PAGE) {
      scrollToPage(initialPage, 'auto');
    }
  }, [initialPage, scrollToPage]);

  // Track currently visible page during vertical scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        let bestEntry: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        });

        if (bestEntry && maxRatio >= 0.2) {
          const pageAttr = (bestEntry as IntersectionObserverEntry).target.getAttribute('data-page');
          const page = parseInt(pageAttr || '', 10);
          if (!isNaN(page) && page !== activePageRef.current) {
            activePageRef.current = page;
            setCurrentPage(page);
          }
        }
      },
      {
        root: null,
        rootMargin: '-10% 0px -30% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    const pageElements = document.querySelectorAll('.kanzul-mushaf-page-card');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Surah Selection Handler -> Jumps directly to Surah's verified starting Mushaf page
  const handleSurahSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sNum = parseInt(e.target.value, 10);
    if (!isNaN(sNum) && sNum >= 1 && sNum <= 114) {
      const targetPage = getKanzulImanPageForSurah(sNum);
      scrollToPage(targetPage, 'auto');
    }
  };

  // Para / Juz Selection Handler -> Jumps directly to Para's verified starting Mushaf page
  const handleParaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pNum = parseInt(e.target.value, 10);
    if (!isNaN(pNum) && pNum >= 1 && pNum <= 30) {
      const targetPage = getKanzulImanPageForJuz(pNum);
      scrollToPage(targetPage, 'auto');
    }
  };

  // Direct Page Number Search / Jump Form
  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pNum = parseInt(directPageInput, 10);
    if (!isNaN(pNum) && pNum >= KANZUL_IMAN_MIN_PAGE && pNum <= KANZUL_IMAN_MAX_PAGE) {
      scrollToPage(pNum, 'auto');
    }
  };

  const handleToggleBookmark = () => {
    toggleBookmark({
      type: 'page',
      pageNumber: currentPage,
      surahNumber: currentSurahMeta.number,
      surahName: `Kanzul Iman - ${currentSurahMeta.name}`,
      surahArabicName: currentSurahMeta.arabicName,
      juzNumber: currentJuzMeta.number,
      juzName: currentJuzMeta.name,
      juzArabicName: currentJuzMeta.arabicName,
    });
  };

  return (
    <div className="kanzul-reading-wrapper" style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
      {/* Sticky Top Control Toolbar: [Surah] [Para] [Page] + Zoom */}
      <div
        className="card"
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 30,
          padding: '10px 16px',
          marginBottom: 'var(--space-5)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Left / Center: Clean Selectors [Surah] [Para] [Page] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          {/* 1. Surah Select */}
          <div style={{ minWidth: 150, flex: '1 1 180px' }}>
            <select
              id="kanzul-surah-select"
              value={currentSurahNum}
              onChange={handleSurahSelect}
              className="selector-select-input"
              aria-label="Select Surah"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {SURAHS_LIST.map((s) => {
                const cleanArabicName = s.arabicName
                  .replace(/^سورة\s+|^سورۃ\s+|^سُوْرَةُ\s+/u, '')
                  .trim();
                const arabicFormatted = `سورۃ ${cleanArabicName}`;
                return (
                  <option key={s.number} value={s.number}>
                    {arabicFormatted} — Surah {s.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2. Para / Juz Select */}
          <div style={{ minWidth: 140, flex: '1 1 160px' }}>
            <select
              id="kanzul-para-select"
              value={currentJuzNum}
              onChange={handleParaSelect}
              className="selector-select-input"
              aria-label="Select Para"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {JUZ_LIST.map((j) => (
                <option key={j.number} value={j.number}>
                  {j.number}    {j.arabicName} — {j.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Direct Page Search / Jump */}
          <form
            onSubmit={handleDirectPageSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              padding: '2px 6px',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Page</span>

            <input
              type="number"
              min={KANZUL_IMAN_MIN_PAGE}
              max={KANZUL_IMAN_MAX_PAGE}
              value={directPageInput}
              onChange={(e) => setDirectPageInput(e.target.value)}
              aria-label="Page Number"
              style={{
                width: '54px',
                textAlign: 'center',
                padding: '4px 2px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--brand-gold)',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-mono)',
              }}
            />

            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              / {KANZUL_IMAN_MAX_PAGE}
            </span>

            <button
              type="submit"
              className="btn btn-xs btn-primary"
              style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 'bold' }}
            >
              Go
            </button>
          </form>
        </div>

        {/* Right: Clean Zoom & Bookmark Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={() => setZoomLevel((z) => Math.max(0.7, +(z - 0.1).toFixed(2)))}
            title="Zoom Out"
            style={{ padding: '6px' }}
          >
            <ZoomOut size={15} />
          </button>
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              minWidth: '36px',
              textAlign: 'center',
            }}
          >
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={() => setZoomLevel((z) => Math.min(1.8, +(z + 0.1).toFixed(2)))}
            title="Zoom In"
            style={{ padding: '6px' }}
          >
            <ZoomIn size={15} />
          </button>
          {zoomLevel !== 1.0 && (
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => setZoomLevel(1.0)}
              title="Reset Zoom"
              style={{ padding: '6px' }}
            >
              <RotateCcw size={14} />
            </button>
          )}

          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={handleToggleBookmark}
            title={isPageBookmarked ? 'Bookmark Saved' : 'Bookmark this Page'}
            style={{
              padding: '6px 8px',
              color: isPageBookmarked ? 'var(--brand-gold)' : 'var(--text-secondary)',
            }}
          >
            <Bookmark size={15} fill={isPageBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Vertical Continuous Scroll Stream of Complete Kanzul Iman Mushaf Pages */}
      <div
        className="kanzul-vertical-page-stream"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          paddingBottom: 'var(--space-16)',
        }}
      >
        {ALL_PAGES.map((pageNum) => {
          const isNearby = Math.abs(pageNum - currentPage) <= 3;
          const imageUrl = KanzulImanService.getKanzulImanPageImageUrl(pageNum, 'desktop');
          const fallbackUrl = KanzulImanService.getKanzulImanPageFallbackUrl(pageNum);
          const pageSurahNum = getKanzulImanSurahByPage(pageNum);
          const pageJuzNum = getKanzulImanJuzByPage(pageNum);
          const surahMeta = SURAHS_LIST[pageSurahNum - 1] || SURAHS_LIST[0];

          return (
            <div
              key={pageNum}
              id={`kanzul-mushaf-page-${pageNum}`}
              data-page={pageNum}
              className="kanzul-mushaf-page-card"
              style={{
                maxWidth: `${Math.round(820 * zoomLevel)}px`,
                width: '100%',
                minHeight: '480px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: pageNum === currentPage ? '2px solid var(--brand-gold)' : '1px solid var(--border-default)',
                boxShadow: pageNum === currentPage ? '0 8px 30px rgba(245, 158, 11, 0.15)' : 'var(--shadow-sm)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                scrollMarginTop: '130px',
                scrollSnapAlign: 'start',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Subtle Page Top Banner */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  backgroundColor: pageNum === currentPage ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-surface-elevated)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: pageNum === currentPage ? 'var(--brand-gold)' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                <span>
                  {surahMeta.name} • Para {pageJuzNum}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  Page {pageNum} of {KANZUL_IMAN_MAX_PAGE}
                </span>
              </div>

              {/* Complete Mushaf Page Image Container */}
              <div
                style={{
                  width: '100%',
                  padding: '4px sm:p-2',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Kanzul Iman Mushaf Page ${pageNum} - Surah ${surahMeta.name}`}
                  loading={isNearby ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={pageNum === currentPage ? 'high' : isNearby ? 'auto' : 'low'}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== fallbackUrl) {
                      img.src = fallbackUrl;
                    }
                  }}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Subtle Page Bottom Footer */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 16px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>کنز الایمان فی ترجمۃ القرآن • صفحہ {pageNum}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const KanzulImanPageViewer = memo(KanzulImanPageViewerComponent);
