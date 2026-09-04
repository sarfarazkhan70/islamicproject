import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Maximize2,
  Minimize2,
  BookOpen,
  Loader2,
  Compass,
  ArrowUp,
  ArrowDown,
  Hash,
} from 'lucide-react';
import {
  TOTAL_MUSHAF_PDF_PAGES,
  QURAN_PDF_PATH,
  getPrintedPageLabel,
  getSurahByPage,
  getSurahByNumber,
  getJuzByPage,
  isCoverPage,
} from '../../data/quranData';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface QuranPdfCanvasViewerProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  surahNumber?: number;
  className?: string;
}

interface MushafPageItemProps {
  pageNumber: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  shouldRender: boolean;
  pageWidth: number;
  pageHeight: number;
  zoomLevel: number;
  isCover: boolean;
  isCurrentPage: boolean;
}

const MushafPageItem: React.FC<MushafPageItemProps> = React.memo(({
  pageNumber,
  pdfDoc,
  shouldRender,
  pageWidth,
  pageHeight,
  zoomLevel,
  isCover,
  isCurrentPage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    if (!shouldRender || !pdfDoc) {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }
      setIsRendered(false);
      setIsRendering(false);
      return;
    }

    const renderCanvas = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !pdfDoc) return;

      setIsRendering(true);

      // Cancel previous render task if any
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }

      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = (pageWidth / unscaledViewport.width);
        const viewport = page.getViewport({ scale });

        // High-DPI Retina scale factor
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx || isCancelled) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;

        await task.promise;
        if (!isCancelled) {
          setIsRendered(true);
          setIsRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`Render error on Mushaf page ${pageNumber}:`, err);
        }
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderCanvas();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }
    };
  }, [pageNumber, pdfDoc, shouldRender, pageWidth, pageHeight, zoomLevel]);

  return (
    <div
      id={`mushaf-page-slot-${pageNumber}`}
      className={`mushaf-page-slot ${isCurrentPage ? 'is-active-page' : ''} ${isCover ? 'is-cover-page' : ''}`}
      style={{
        width: `${pageWidth}px`,
        minHeight: `${pageHeight}px`,
        height: `${pageHeight}px`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isCurrentPage
          ? '0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 0 0 2px rgba(16, 185, 129, 0.4)'
          : '0 4px 16px -2px rgba(0, 0, 0, 0.08)',
        border: isCover ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Page Header Indicator */}
      <div
        className="mushaf-page-pill-badge"
        style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          zIndex: 5,
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-surface)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          pointerEvents: 'none',
          opacity: 0.85,
        }}
      >
        Page {pageNumber}
      </div>

      {shouldRender ? (
        <>
          <canvas
            ref={canvasRef}
            className="mushaf-canvas-element"
            style={{
              opacity: isRendered ? 1 : 0.4,
              transition: 'opacity 0.2s ease',
              display: 'block',
            }}
          />
          {isRendering && !isRendered && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--brand-primary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
              }}
            >
              <Loader2 size={16} className="animate-spin text-emerald-500" />
              <span>Rendering Page {pageNumber}...</span>
            </div>
          )}
        </>
      ) : (
        /* Lightweight Skeleton Placeholder for Distant Virtualized Pages */
        <div
          className="mushaf-page-skeleton"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={20} className="text-emerald-500 opacity-60" />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
            Page {pageNumber} / {TOTAL_MUSHAF_PDF_PAGES}
          </span>
        </div>
      )}
    </div>
  );
});

MushafPageItem.displayName = 'MushafPageItem';

export const QuranPdfCanvasViewer: React.FC<QuranPdfCanvasViewerProps> = ({
  currentPage,
  onPageChange,
  zoomLevel,
  onZoomChange,
  surahNumber,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInputVal, setPageInputVal] = useState<string>(String(currentPage));

  // Virtualization state
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [baseAspectRatio, setBaseAspectRatio] = useState<number>(1.48); // Standard Subcontinent / Madani Quran page aspect ratio
  const [renderedRange, setRenderedRange] = useState<[number, number]>([1, 6]);

  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticTimeoutRef = useRef<any>(null);
  const lastReportedPageRef = useRef<number>(currentPage);

  // Sync internal page input when currentPage changes
  useEffect(() => {
    setPageInputVal(String(currentPage));
  }, [currentPage]);

  // Load PDF Document once
  useEffect(() => {
    let isMounted = true;
    setIsLoadingDoc(true);
    setLoadError(null);

    const loadingTask = pdfjsLib.getDocument({
      url: QURAN_PDF_PATH,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
      rangeChunkSize: 65536,
      disableAutoFetch: true,
      disableStream: false,
    });

    loadingTask.promise
      .then(async (doc) => {
        if (!isMounted) return;
        pdfDocRef.current = doc;

        // Measure Page 1 unscaled dimensions to get exact aspect ratio
        try {
          const firstPage = await doc.getPage(1);
          const viewport = firstPage.getViewport({ scale: 1.0 });
          if (viewport.width > 0 && viewport.height > 0) {
            setBaseAspectRatio(viewport.height / viewport.width);
          }
        } catch {
          // Fallback default aspect ratio
        }

        setIsLoadingDoc(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load Quran PDF:', err);
        setLoadError(
          'Failed to load Quran PDF. Please ensure frontend/public/quran/quran.pdf exists.'
        );
        setIsLoadingDoc(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Responsive container width measuring
  useEffect(() => {
    const measureWidth = () => {
      if (scrollContainerRef.current) {
        const w = scrollContainerRef.current.clientWidth;
        if (w > 0) {
          setContainerWidth(w);
        }
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, []);

  // Compute calculated dimensions for each page
  const horizontalPadding = containerWidth < 640 ? 16 : 48;
  const maxNormalWidth = Math.min(840, Math.max(280, containerWidth - horizontalPadding));
  const pageWidth = Math.floor(maxNormalWidth * zoomLevel);
  const pageHeight = Math.floor(pageWidth * baseAspectRatio);
  const pageGap = 20;
  const slotHeight = pageHeight + pageGap;

  // Jump / Scroll to a specific page
  const scrollToPage = useCallback((pageNum: number, smooth: boolean = true) => {
    const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, pageNum));
    const container = scrollContainerRef.current;
    if (!container) return;

    isProgrammaticScrollRef.current = true;
    if (programmaticTimeoutRef.current) {
      clearTimeout(programmaticTimeoutRef.current);
    }

    const targetOffset = (clamped - 1) * slotHeight;
    container.scrollTo({
      top: targetOffset,
      behavior: smooth ? 'smooth' : 'auto',
    });

    // Update active render window immediately around target page
    const buffer = 3;
    setRenderedRange([
      Math.max(1, clamped - buffer),
      Math.min(TOTAL_MUSHAF_PDF_PAGES, clamped + buffer + 2),
    ]);

    // Release programmatic lock after animation finishes
    programmaticTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, smooth ? 600 : 50);
  }, [slotHeight]);

  // Handle external currentPage changes (e.g. from Surah/Juz selector)
  useEffect(() => {
    if (isLoadingDoc || !pdfDocRef.current) return;
    if (Math.abs(lastReportedPageRef.current - currentPage) > 0 && !isProgrammaticScrollRef.current) {
      // Check if current scroll position matches currentPage
      const container = scrollContainerRef.current;
      if (container) {
        const currentEstimatedPage = Math.floor((container.scrollTop + container.clientHeight / 2) / slotHeight) + 1;
        if (currentEstimatedPage !== currentPage) {
          scrollToPage(currentPage, true);
        }
      }
    }
  }, [currentPage, isLoadingDoc, slotHeight, scrollToPage]);

  // Initial scroll to starting page on load
  useEffect(() => {
    if (!isLoadingDoc && pdfDocRef.current) {
      scrollToPage(currentPage, false);
    }
  }, [isLoadingDoc]);

  // Scroll Listener for Active Page Detection & Virtual Windowing
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    // 1. Calculate active center page
    const centerOffset = scrollTop + clientHeight / 2;
    const activePage = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, Math.floor(centerOffset / slotHeight) + 1));

    if (!isProgrammaticScrollRef.current && activePage !== lastReportedPageRef.current) {
      lastReportedPageRef.current = activePage;
      onPageChange(activePage);
    }

    // 2. Calculate virtualized rendering range
    const firstVisibleIndex = Math.max(1, Math.floor(scrollTop / slotHeight) + 1);
    const visibleCount = Math.ceil(clientHeight / slotHeight) + 1;
    const buffer = 2; // Buffer 2 pages above and 2 pages below

    const start = Math.max(1, firstVisibleIndex - buffer);
    const end = Math.min(TOTAL_MUSHAF_PDF_PAGES, firstVisibleIndex + visibleCount + buffer);

    setRenderedRange((prev) => {
      if (prev[0] !== start || prev[1] !== end) {
        return [start, end];
      }
      return prev;
    });
  }, [slotHeight, onPageChange]);

  // Direct Page Form Submit Handler
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInputVal, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, num));
      onPageChange(clamped);
      setPageInputVal(String(clamped));
      scrollToPage(clamped, true);
    } else {
      setPageInputVal(String(currentPage));
    }
  };

  // Keyboard navigation for scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const container = scrollContainerRef.current;
      if (!container) return;

      if (e.key === 'ArrowDown') {
        container.scrollBy({ top: 120, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        container.scrollBy({ top: -120, behavior: 'smooth' });
      } else if (e.key === 'PageDown' || e.key === 'Space') {
        e.preventDefault();
        container.scrollBy({ top: container.clientHeight * 0.8, behavior: 'smooth' });
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        container.scrollBy({ top: -container.clientHeight * 0.8, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToPage(1, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToPage(TOTAL_MUSHAF_PDF_PAGES, true);
      } else if (e.key === '+' || e.key === '=') {
        onZoomChange(Math.min(2.5, +(zoomLevel + 0.15).toFixed(2)));
      } else if (e.key === '-') {
        onZoomChange(Math.max(0.6, +(zoomLevel - 0.15).toFixed(2)));
      } else if (e.key === '0') {
        onZoomChange(1.0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToPage, zoomLevel, onZoomChange]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Metadata headers
  const selectedSurahObj = surahNumber ? getSurahByNumber(surahNumber) : null;
  const currentSurah =
    selectedSurahObj && selectedSurahObj.pageStart === currentPage
      ? selectedSurahObj
      : getSurahByPage(currentPage);
  const currentJuz = getJuzByPage(currentPage);
  const printedLabel = getPrintedPageLabel(currentPage);

  // Generate array of 1 to 1124 page numbers
  const allPageNumbers = useMemo(() => {
    return Array.from({ length: TOTAL_MUSHAF_PDF_PAGES }, (_, i) => i + 1);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`mushaf-sanctuary ${isFullscreen ? 'is-fullscreen' : ''} ${className}`}
    >
      {/* Top Header Controls Bar */}
      <div className="mushaf-top-toolbar">
        {/* Surah & Juz Meta Badges */}
        <div className="mushaf-meta-pills">
          <div className="mushaf-pill mushaf-pill-emerald">
            <BookOpen size={14} />
            <span>
              {currentSurah.number}. {currentSurah.name}
            </span>
            <span style={{ opacity: 0.8, marginRight: '2px' }}>({currentSurah.arabicName})</span>
          </div>

          <div className="mushaf-pill mushaf-pill-gold">
            <Compass size={14} />
            <span>{currentJuz.name}</span>
          </div>

          <div className="mushaf-pill mushaf-pill-neutral">
            <span>{printedLabel}</span>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="mushaf-zoom-bar">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.6, +(zoomLevel - 0.15).toFixed(2)))}
            disabled={zoomLevel <= 0.6}
            className="mushaf-tool-btn"
            title="Zoom Out (−)"
            aria-label="Zoom Out"
          >
            −
          </button>

          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 'bold',
              padding: '0 6px',
              minWidth: '42px',
              textAlign: 'center',
              color: 'var(--text-primary)',
            }}
          >
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            type="button"
            onClick={() => onZoomChange(Math.min(2.5, +(zoomLevel + 0.15).toFixed(2)))}
            disabled={zoomLevel >= 2.5}
            className="mushaf-tool-btn"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => onZoomChange(1.0)}
            className="mushaf-tool-btn"
            title="Fit to View (100%)"
            aria-label="Fit to View"
            style={{ padding: '0 8px' }}
          >
            Fit
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`mushaf-tool-btn ${isFullscreen ? 'active' : ''}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Continuous Vertical Scrolling Mushaf Container */}
      <div
        ref={scrollContainerRef}
        className="mushaf-canvas-podium mushaf-continuous-scroll-viewport"
        onScroll={handleScroll}
        style={{
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '76vh',
          height: isFullscreen ? 'calc(100vh - 120px)' : '720px',
          padding: '16px 8px',
          position: 'relative',
        }}
      >
        {/* Loading overlay for initial PDF document parsing */}
        {isLoadingDoc && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-card)',
              zIndex: 30,
              gap: 'var(--space-3)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <Loader2 size={36} className="text-emerald-500 animate-spin" />
            <p style={{ color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
              Opening Holy Quran Mushaf...
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
              Loading continuous 1124-page reader
            </p>
          </div>
        )}

        {/* Load Error View */}
        {loadError && (
          <div
            style={{
              padding: 'var(--space-6)',
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--danger)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '420px',
            }}
          >
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error Loading Mushaf</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{loadError}</p>
          </div>
        )}

        {/* Continuous Virtualized Pages List (1 to 1124) */}
        {!isLoadingDoc && !loadError && (
          <div
            className="mushaf-pages-vertical-stack"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              minHeight: `${TOTAL_MUSHAF_PDF_PAGES * slotHeight}px`,
            }}
          >
            {allPageNumbers.map((pageNum) => {
              const shouldRender = pageNum >= renderedRange[0] && pageNum <= renderedRange[1];
              return (
                <MushafPageItem
                  key={`page-slot-${pageNum}`}
                  pageNumber={pageNum}
                  pdfDoc={pdfDocRef.current}
                  shouldRender={shouldRender}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                  zoomLevel={zoomLevel}
                  isCover={isCoverPage(pageNum)}
                  isCurrentPage={pageNum === currentPage}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Bar — Continuous Reader Controls with Direct Page Jump (No Next/Prev Buttons) */}
      <div className="mushaf-bottom-nav">
        {/* Quick Jump to Beginning (Page 1) */}
        <button
          type="button"
          onClick={() => {
            onPageChange(1);
            scrollToPage(1, true);
          }}
          disabled={currentPage <= 1}
          className="mushaf-nav-btn mushaf-nav-btn-subtle"
          title="Scroll to Beginning (Page 1)"
          aria-label="Scroll to First Page"
        >
          <ArrowUp size={15} />
          <span>Top (Page 1)</span>
        </button>

        {/* Center Direct Page Input & Jump Form */}
        <form onSubmit={handlePageInputSubmit} className="mushaf-page-jump-container">
          <Hash size={14} className="text-emerald-500" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
            Page
          </span>
          <input
            type="number"
            min={1}
            max={TOTAL_MUSHAF_PDF_PAGES}
            value={pageInputVal}
            onChange={(e) => setPageInputVal(e.target.value)}
            onBlur={handlePageInputSubmit}
            className="mushaf-page-input"
            aria-label={`Enter Quran PDF Page Number (1 to ${TOTAL_MUSHAF_PDF_PAGES})`}
          />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            / {TOTAL_MUSHAF_PDF_PAGES}
          </span>
          <button type="submit" className="mushaf-jump-btn" aria-label="Go to Page">
            Go
          </button>
        </form>

        {/* Quick Jump to End (Page 1124) */}
        <button
          type="button"
          onClick={() => {
            onPageChange(TOTAL_MUSHAF_PDF_PAGES);
            scrollToPage(TOTAL_MUSHAF_PDF_PAGES, true);
          }}
          disabled={currentPage >= TOTAL_MUSHAF_PDF_PAGES}
          className="mushaf-nav-btn mushaf-nav-btn-subtle"
          title="Scroll to End (Page 1124)"
          aria-label="Scroll to Last Page"
        >
          <span>End (Page 1124)</span>
          <ArrowDown size={15} />
        </button>
      </div>
    </div>
  );
};
