import React, { useEffect, useRef, memo } from 'react';
import {
  MIN_MUSHAF_PAGE,
  MAX_MUSHAF_PAGE,
} from '../../data/quranData';
import { QuranApiService } from '../../services/quranApiService';

interface QuranApiPageViewerProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  surahNumber?: number;
}

// All Pakistani 15-Line Mushaf pages (Pages 2 to 611)
const ALL_MUSHAF_PAGES = Array.from(
  { length: MAX_MUSHAF_PAGE - MIN_MUSHAF_PAGE + 1 },
  (_, i) => MIN_MUSHAF_PAGE + i
);

const MushafPageViewerComponent: React.FC<QuranApiPageViewerProps> = ({
  currentPage,
  onPageChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePageRef = useRef<number>(currentPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload nearby pages around the active reading position
  useEffect(() => {
    const pagesToPreload = [
      currentPage,
      currentPage + 1,
      currentPage - 1,
      currentPage + 2,
      currentPage - 2,
    ].filter((p) => p >= MIN_MUSHAF_PAGE && p <= MAX_MUSHAF_PAGE);

    pagesToPreload.forEach((p) => {
      const url = QuranApiService.getMushafPageImageUrl(p, 'desktop');
      const img = new Image();
      img.src = url;
    });
  }, [currentPage]);

  // Jump to target page when currentPage changes via Search (Page / Para / Surah / Bookmark)
  useEffect(() => {
    if (activePageRef.current === currentPage) {
      return;
    }
    activePageRef.current = currentPage;
    isProgrammaticScrollRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const scrollToPage = () => {
      const pageEl = document.getElementById(`mushaf-page-${currentPage}`);
      if (pageEl) {
        pageEl.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    };

    // Execute scroll jump immediately and on next animation frame
    scrollToPage();
    requestAnimationFrame(scrollToPage);

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 450);
  }, [currentPage]);

  // Initial scroll to starting page on mount
  useEffect(() => {
    isProgrammaticScrollRef.current = true;
    const scrollToInitial = () => {
      const pageEl = document.getElementById(`mushaf-page-${currentPage}`);
      if (pageEl) {
        pageEl.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    };
    scrollToInitial();
    requestAnimationFrame(scrollToInitial);

    const timer = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // IntersectionObserver to detect currently visible page during natural vertical scrolling
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

        if (bestEntry && maxRatio >= 0.25) {
          const page = parseInt((bestEntry as IntersectionObserverEntry).target.getAttribute('data-page') || '', 10);
          if (!isNaN(page) && page !== activePageRef.current) {
            activePageRef.current = page;
            onPageChange(page);
          }
        }
      },
      {
        root: null,
        rootMargin: '-15% 0px -25% 0px', // Center-weighted reading detection zone
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    const pageElements = document.querySelectorAll('.mushaf-page-item');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [onPageChange]);

  return (
    <div
      ref={containerRef}
      className="quran-api-page-viewer select-text flex flex-col items-center w-full"
    >
      {/* Continuous Vertical Scroll Stream of Pakistani 15-Line Mushaf Pages */}
      <div className="mushaf-page-frame-container w-full max-w-[620px] mx-auto flex flex-col items-center gap-6 py-2 pb-24">
        {ALL_MUSHAF_PAGES.map((pageNum) => {
          const primaryUrl = QuranApiService.getMushafPageImageUrl(pageNum, 'desktop');
          const fallbackUrl = QuranApiService.getMushafPageImageFallbackUrl(pageNum);
          const srcSet = QuranApiService.getMushafPageSrcSet(pageNum);
          const isNearby = Math.abs(pageNum - currentPage) <= 2;

          return (
            <div
              key={pageNum}
              id={`mushaf-page-${pageNum}`}
              data-page={pageNum}
              className="mushaf-page-item w-full max-w-[620px] mx-auto relative flex flex-col items-center"
            >
              {/* Mushaf Page Image Container */}
              <div className="mushaf-image-container relative w-full flex justify-center items-center rounded-xl">
                <img
                  src={primaryUrl}
                  srcSet={srcSet}
                  sizes="(max-width: 640px) 100vw, 620px"
                  alt={`Pakistani Hafiz Quran Mushaf Page ${pageNum}`}
                  loading={isNearby ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== fallbackUrl) {
                      img.srcset = '';
                      img.src = fallbackUrl;
                    }
                  }}
                  className="mushaf-img-responsive"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const QuranApiPageViewer = memo(MushafPageViewerComponent);
