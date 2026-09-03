import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Maximize2,
  Minimize2,
  BookOpen,
  Loader2,
  Compass,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  TOTAL_MUSHAF_PDF_PAGES,
  QURAN_PDF_PATH,
  quranTextPageToPdfPage,
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

export const QuranPdfCanvasViewer: React.FC<QuranPdfCanvasViewerProps> = ({
  currentPage,
  onPageChange,
  zoomLevel,
  onZoomChange,
  surahNumber,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(true);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInputVal, setPageInputVal] = useState<string>(String(currentPage));

  // Touch & Pointer swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const pointerStartXRef = useRef<number | null>(null);
  const pointerStartYRef = useRef<number | null>(null);
  const pointerStartTimeRef = useRef<number>(0);
  const gestureProcessedRef = useRef<boolean>(false);
  const lastWheelNavTimeRef = useRef<number>(0);

  // Sync page input when currentPage changes
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
      .then((doc) => {
        if (!isMounted) return;
        pdfDocRef.current = doc;
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
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, []);

  const renderSeqRef = useRef<number>(0);

  // Render current page to canvas
  const renderPage = useCallback(async () => {
    const pdfDoc = pdfDocRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!pdfDoc || !canvas || !container) return;

    const thisSeq = ++renderSeqRef.current;

    // Cancel any previous in-progress render task
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
      renderTaskRef.current = null;
    }

    setIsRenderingPage(true);

    try {
      const physicalPdfPage = quranTextPageToPdfPage(currentPage);
      const page = await pdfDoc.getPage(physicalPdfPage);

      if (thisSeq !== renderSeqRef.current) return;

      // Measure container width for responsive fit
      const podiumWidth = container.clientWidth || 800;
      // Get unscaled viewport to determine aspect ratio
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Optimal base scale: fit cleanly to container width with comfortable margin
      const horizontalPadding = window.innerWidth < 640 ? 16 : 48;
      const availableWidth = Math.max(260, podiumWidth - horizontalPadding);
      const fitScale = availableWidth / unscaledViewport.width;
      
      // Effective scale with user zoom
      const effectiveScale = fitScale * zoomLevel;
      const viewport = page.getViewport({ scale: effectiveScale });

      // High-DPI support (retina display crispness)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      if (thisSeq !== renderSeqRef.current) return;

      // Scale context for DPR
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
      if (thisSeq === renderSeqRef.current) {
        setIsRenderingPage(false);
      }
    } catch (err: any) {
      // Ignore cancellation errors
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering Mushaf PDF page:', err);
      }
      if (thisSeq === renderSeqRef.current) {
        setIsRenderingPage(false);
      }
    }
  }, [currentPage, zoomLevel]);

  // Re-render when page, zoom, or doc changes
  useEffect(() => {
    if (!isLoadingDoc && pdfDocRef.current) {
      renderPage();
    }
  }, [currentPage, zoomLevel, isLoadingDoc, renderPage]);

  // Handle window resize with debounce
  useEffect(() => {
    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isLoadingDoc && pdfDocRef.current) {
          renderPage();
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [isLoadingDoc, renderPage]);

  // Page Navigation Handlers
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < TOTAL_MUSHAF_PDF_PAGES) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, onPageChange]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInputVal, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, num));
      onPageChange(clamped);
      setPageInputVal(String(clamped));
    } else {
      setPageInputVal(String(currentPage));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
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
  }, [handleNextPage, handlePrevPage, zoomLevel, onZoomChange]);

  // Touch / Finger Swipe Handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchStartTimeRef.current = Date.now();
      gestureProcessedRef.current = false;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gestureProcessedRef.current) return;
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartXRef.current;
    const diffY = touchEndY - touchStartYRef.current;
    const elapsedTime = Date.now() - touchStartTimeRef.current;

    // Sensible threshold: at least 40px horizontal travel, dominant horizontal movement (not vertical scroll)
    // and fast enough (< 1200ms)
    if (Math.abs(diffX) >= 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2 && elapsedTime < 1200) {
      gestureProcessedRef.current = true;
      if (diffX < 0) {
        // Swiped Left -> Next page
        handleNextPage();
      } else {
        // Swiped Right -> Previous page
        handlePrevPage();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    gestureProcessedRef.current = false;
  };

  // Pointer event handlers for touch-screen laptops and styluses
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      pointerStartXRef.current = e.clientX;
      pointerStartYRef.current = e.clientY;
      pointerStartTimeRef.current = Date.now();
      gestureProcessedRef.current = false;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      if (gestureProcessedRef.current) return;
      if (pointerStartXRef.current === null || pointerStartYRef.current === null) return;

      const diffX = e.clientX - pointerStartXRef.current;
      const diffY = e.clientY - pointerStartYRef.current;
      const elapsedTime = Date.now() - pointerStartTimeRef.current;

      if (Math.abs(diffX) >= 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2 && elapsedTime < 1200) {
        gestureProcessedRef.current = true;
        if (diffX < 0) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }

      pointerStartXRef.current = null;
      pointerStartYRef.current = null;
    }
  };

  const handlePointerCancel = () => {
    pointerStartXRef.current = null;
    pointerStartYRef.current = null;
    gestureProcessedRef.current = false;
  };

  // Horizontal trackpad gesture support (two-finger horizontal scroll)
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 40 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5) {
      const now = Date.now();
      if (now - lastWheelNavTimeRef.current > 400) {
        lastWheelNavTimeRef.current = now;
        if (e.deltaX > 0) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    }
  };

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

  const selectedSurahObj = surahNumber ? getSurahByNumber(surahNumber) : null;
  const currentSurah =
    selectedSurahObj && selectedSurahObj.pageStart === currentPage
      ? selectedSurahObj
      : getSurahByPage(currentPage);
  const currentJuz = getJuzByPage(currentPage);
  const printedLabel = getPrintedPageLabel(currentPage);
  const isCover = isCoverPage(quranTextPageToPdfPage(currentPage));

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
            title="Fit to View / Reset (100%)"
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

      {/* Main Canvas Podium Container with Touch Swipe & Pointer Gesture Support (Clean without Middle Floating Overlay Buttons) */}
      <div
        className="mushaf-canvas-podium"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
        style={{
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Loading overlay for PDF doc */}
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
              zIndex: 20,
              gap: 'var(--space-3)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <Loader2 size={36} className="text-emerald-500 animate-spin" />
            <p style={{ color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
              Opening Holy Quran Mushaf...
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
              Loading authentic Zia-ul-Quran edition
            </p>
          </div>
        )}

        {/* Load Error View */}
        {loadError && (
          <div
            style={{
              padding: 'var(--space-6)',
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

        {/* Page rendering subtle spinner badge */}
        {isRenderingPage && !isLoadingDoc && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-xs)',
              color: 'var(--brand-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Loader2 size={12} className="animate-spin" />
            <span>Rendering...</span>
          </div>
        )}

        {/* Canvas Display with Crisp Styling (Clean Mushaf, No Overlay Buttons) */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas
            ref={canvasRef}
            className={`mushaf-canvas-element ${isCover ? 'ring-2 ring-emerald-500' : ''}`}
            style={{
              opacity: isRenderingPage ? 0.88 : 1,
            }}
          />
        </div>
      </div>

      {/* Bottom Dedicated Navigation Bar */}
      <div className="mushaf-bottom-nav">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="mushaf-nav-btn mushaf-nav-btn-primary"
          aria-label="Previous Page"
        >
          <ArrowLeft size={16} />
          <span>Previous Page</span>
        </button>

        {/* Direct Page Input & Jump Form */}
        <form onSubmit={handlePageInputSubmit} className="mushaf-page-jump-container">
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
            aria-label="Direct PDF Page Number"
          />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            / {TOTAL_MUSHAF_PDF_PAGES}
          </span>
          <button type="submit" className="mushaf-jump-btn" aria-label="Go to Page">
            Go
          </button>
        </form>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage >= TOTAL_MUSHAF_PDF_PAGES}
          className="mushaf-nav-btn mushaf-nav-btn-primary"
          aria-label="Next Page"
        >
          <span>Next Page</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

