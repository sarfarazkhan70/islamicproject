import React, { useEffect, useRef, memo, useCallback } from 'react';
import {
  MIN_MUSHAF_PAGE,
  MAX_MUSHAF_PAGE,
} from '../../data/quranData';
import { QuranApiService } from '../../services/quranApiService';

interface QuranApiPageViewerProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  surahNumber?: number;
}

// Pre-create array of all 548 pages (Pages 2 to 549)
const ALL_MUSHAF_PAGES = Array.from(
  { length: MAX_MUSHAF_PAGE - MIN_MUSHAF_PAGE + 1 },
  (_, i) => MIN_MUSHAF_PAGE + i
);

const MushafPageViewerComponent: React.FC<QuranApiPageViewerProps> = ({
  currentPage,
  onPageChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReportedPage = useRef<number>(currentPage);

  // Preload next/prev pages for instant zero-delay display
  useEffect(() => {
    const pagesToPreload = [
      currentPage,
      currentPage + 1,
      currentPage - 1,
      currentPage + 2,
    ].filter((p) => p >= MIN_MUSHAF_PAGE && p <= MAX_MUSHAF_PAGE);

    pagesToPreload.forEach((p) => {
      const url = QuranApiService.getMushafPageImageUrl(p, 'desktop');
      const img = new Image();
      img.src = url;
    });
  }, [currentPage]);

  // Scroll into view when currentPage changes externally (from Surah/Para/Page selectors)
  useEffect(() => {
    if (lastReportedPage.current === currentPage) {
      return;
    }
    lastReportedPage.current = currentPage;

    const pageElement = document.getElementById(`mushaf-page-${currentPage}`);
    const scrollContainer = scrollContainerRef.current;

    if (pageElement && scrollContainer) {
      isProgrammaticScroll.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const containerRect = scrollContainer.getBoundingClientRect();
      const elRect = pageElement.getBoundingClientRect();
      const targetScrollTop =
        scrollContainer.scrollTop + (elRect.top - containerRect.top) - 6;

      scrollContainer.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 700);
    }
  }, [currentPage]);

  // Initial scroll to starting page on mount
  useEffect(() => {
    const pageElement = document.getElementById(`mushaf-page-${currentPage}`);
    const scrollContainer = scrollContainerRef.current;
    if (pageElement && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elRect = pageElement.getBoundingClientRect();
      const targetScrollTop =
        scrollContainer.scrollTop + (elRect.top - containerRect.top) - 6;
      scrollContainer.scrollTop = Math.max(0, targetScrollTop);
    }
  }, []);

  // Passive scroll handler to detect active page during manual wheel / touch scrolling
  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenterY = containerRect.top + containerRect.height / 2;

    const pageElements = container.querySelectorAll<HTMLElement>('.mushaf-page-item');
    let closestPage = currentPage;
    let minDistance = Infinity;

    pageElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Check if page element intersects the visible container area
      if (rect.bottom >= containerRect.top && rect.top <= containerRect.bottom) {
        const pageCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(containerCenterY - pageCenterY);
        if (distance < minDistance) {
          minDistance = distance;
          const p = parseInt(el.getAttribute('data-page') || '', 10);
          if (!isNaN(p)) {
            closestPage = p;
          }
        }
      }
    });

    if (closestPage !== currentPage && closestPage !== lastReportedPage.current) {
      lastReportedPage.current = closestPage;
      onPageChange(closestPage);
    }
  }, [currentPage, onPageChange]);

  // Keyboard navigation for turning pages (Arrow Left / Arrow Up: Prev, Arrow Right / Arrow Down: Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentPage < MAX_MUSHAF_PAGE) {
          onPageChange(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentPage > MIN_MUSHAF_PAGE) {
          onPageChange(currentPage - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, onPageChange]);

  return (
    <div
      ref={containerRef}
      className="quran-api-page-viewer select-text flex flex-col items-center w-full"
    >
      {/* Continuous Vertical Scroll Stream — Smooth Mouse Wheel & Touch Scrolling */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="mushaf-scroll-stream w-full flex flex-col items-center p-0 overflow-y-auto overflow-x-hidden"
        style={{
          maxHeight: '82vh',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="mushaf-page-frame-container w-full max-w-[620px] mx-auto flex flex-col items-center gap-6 py-2 pb-16">
          {ALL_MUSHAF_PAGES.map((pageNum) => {
            const primaryUrl = QuranApiService.getMushafPageImageUrl(pageNum, 'desktop');
            const fallbackUrl = QuranApiService.getMushafPageImageFallbackUrl(pageNum);

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
                    alt={`Quran Mushaf Page ${pageNum}`}
                    loading={Math.abs(pageNum - currentPage) <= 1 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== fallbackUrl) {
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
    </div>
  );
};

export const QuranApiPageViewer = memo(MushafPageViewerComponent);
