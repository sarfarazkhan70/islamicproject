import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Search,
} from 'lucide-react';
import { BUKHARI_VOLUMES } from '../../data/bukhariData';
import { BukhariPdfService } from '../../services/bukhariPdfService';
import type { RenderTask } from 'pdfjs-dist';

const ZOOM_PRESETS = [
  { label: '125%', scale: 1.25 },
  { label: '150%', scale: 1.5 },
  { label: '175%', scale: 1.75 },
  { label: '200%', scale: 2.0 },
];

export const BukhariReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const bukhariBook = BUKHARI_VOLUMES[0];
  const totalPages = bukhariBook.totalPages; // 699 pages

  const pageParam = searchParams.get('page');
  const initialPage = pageParam
    ? Math.max(1, Math.min(totalPages, parseInt(pageParam, 10) || 1))
    : 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPage.toString());
  const [scale, setScale] = useState<number>(1.5); // Default: 150% clear reading
  const [fitWidth, setFitWidth] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activePageRef = useRef<number>(currentPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync direct input box with current page
  useEffect(() => {
    setDirectPageInput(currentPage.toString());
  }, [currentPage]);

  // Scroll to a specific Bukhari page
  const scrollToPage = useCallback(
    (pageNum: number, behavior: ScrollBehavior = 'smooth') => {
      const clamped = Math.max(1, Math.min(totalPages, pageNum));
      setCurrentPage(clamped);
      activePageRef.current = clamped;
      isProgrammaticScrollRef.current = true;
      setSearchParams({ page: clamped.toString() });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const performScroll = () => {
        const el = document.getElementById(`bukhari-page-${clamped}`);
        if (el) {
          const headerOffset = isFullscreen ? 55 : 120;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, y), behavior });
        }
      };

      performScroll();
      requestAnimationFrame(performScroll);

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    },
    [totalPages, isFullscreen, setSearchParams]
  );

  // Initial scroll if URL specified a page > 1
  useEffect(() => {
    if (initialPage > 1) {
      // Small timeout to allow page elements to mount in the DOM
      const timer = setTimeout(() => {
        scrollToPage(initialPage, 'auto');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialPage, scrollToPage]);

  // Handle URL param changes (e.g. browser back/forward)
  useEffect(() => {
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages && p !== activePageRef.current) {
        scrollToPage(p, 'smooth');
      }
    }
  }, [pageParam, totalPages, scrollToPage]);

  // Track currently visible page during vertical scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        let bestEntry: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        }

        if (bestEntry && maxRatio >= 0.2) {
          const pageAttr = (bestEntry as IntersectionObserverEntry).target.getAttribute('data-page');
          const p = parseInt(pageAttr || '', 10);
          if (!isNaN(p) && p !== activePageRef.current) {
            activePageRef.current = p;
            setCurrentPage(p);
          }
        }
      },
      {
        root: null,
        rootMargin: '-10% 0px -30% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    const pageElements = document.querySelectorAll('.bukhari-page-card');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Handle direct page jump form submission
  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pNum = parseInt(directPageInput, 10);
    if (!isNaN(pNum) && pNum >= 1 && pNum <= totalPages) {
      scrollToPage(pNum, 'smooth');
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
    setFitWidth(false);
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(1.0, +(prev - 0.15).toFixed(2)));
    setFitWidth(false);
  };

  const handlePresetZoom = (presetScale: number) => {
    setScale(presetScale);
    setFitWidth(false);
  };

  const toggleFitWidth = () => {
    setFitWidth((prev) => !prev);
  };

  // Generate all 699 pages array
  const allPageNumbers = useRef<number[]>(
    Array.from({ length: totalPages }, (_, i) => i + 1)
  ).current;

  // Responsive page container max-width based on desktop zoom scale
  const pageContainerMaxWidth = fitWidth
    ? '100%'
    : `${Math.min(1280, Math.max(340, Math.round(860 * (scale / 1.5))))}px`;

  return (
    <div
      className={`bukhari-reader-page-root ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        width: '100%',
        maxWidth: isFullscreen ? '100%' : '1400px',
        margin: '0 auto',
        padding: isFullscreen
          ? 'var(--space-1) var(--space-2)'
          : 'var(--space-1) var(--space-2) var(--space-12)',
        boxSizing: 'border-box',
      }}
    >
      {/* ========================================================================= */}
      {/* CLEAN RESPONSIVE STICKY TOOLBAR                                          */}
      {/* ========================================================================= */}
      <header
        className="card bukhari-top-toolbar"
        style={{
          position: 'sticky',
          top: isFullscreen ? '0px' : '64px',
          zIndex: 40,
          padding: '8px 14px',
          marginBottom: 'var(--space-4)',
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px 12px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Section 1: Back to Library & Clean Book Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => navigate('/library')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              fontSize: '0.82rem',
            }}
            title="Back to Islamic Library"
          >
            <ArrowLeft size={16} />
            <span>Library</span>
          </button>

          <div>
            <h1
              className="font-arabic"
              style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'var(--brand-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              صحيح البخاري
            </h1>
            <div
              className="text-xs text-muted"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>{totalPages} Pages</span>
              <span>•</span>
              <span className="font-arabic">النسخة الأصلية</span>
            </div>
          </div>
        </div>

        {/* Section 2: Compact Responsive Size / Zoom Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--bg-surface)',
            padding: '3px 6px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            flexWrap: 'wrap',
          }}
        >
          <span
            className="text-xs text-muted"
            style={{ fontWeight: 600, paddingRight: 2 }}
          >
            Size:
          </span>

          <button
            type="button"
            className="btn-icon btn-icon-sm"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            aria-label="Zoom Out"
            style={{ width: 26, height: 26 }}
          >
            <ZoomOut size={13} />
          </button>

          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 'bold',
              minWidth: 40,
              textAlign: 'center',
              color: 'var(--brand-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {fitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
          </span>

          <button
            type="button"
            className="btn-icon btn-icon-sm"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom In"
            style={{ width: 26, height: 26 }}
          >
            <ZoomIn size={13} />
          </button>

          {/* Zoom Presets (Clean responsive buttons) */}
          <div
            style={{
              display: 'flex',
              gap: 2,
              marginLeft: 2,
              flexWrap: 'wrap',
            }}
          >
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`btn btn-xs ${
                  scale === preset.scale && !fitWidth ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => handlePresetZoom(preset.scale)}
                style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                title={`Set size to ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}

            <button
              type="button"
              className={`btn btn-xs ${fitWidth ? 'btn-primary' : 'btn-ghost'}`}
              onClick={toggleFitWidth}
              style={{ padding: '2px 6px', fontSize: '0.72rem' }}
              title="Fit page to full screen width"
            >
              Fit Width
            </button>
          </div>
        </div>

        {/* Section 3: Page Search & Jump (No Prev/Next buttons) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
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
            <span
              className="font-arabic text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              الصفحة
            </span>

            <input
              type="number"
              min={1}
              max={totalPages}
              value={directPageInput}
              onChange={(e) => setDirectPageInput(e.target.value)}
              aria-label="رقم الصفحة"
              style={{
                width: '50px',
                textAlign: 'center',
                padding: '3px 2px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--brand-primary)',
                fontWeight: 'bold',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-mono)',
              }}
            />

            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              / {totalPages}
            </span>

            <button
              type="submit"
              className="btn btn-xs btn-primary font-arabic"
              style={{
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
              title="انتقال إلى الصفحة"
            >
              <Search size={11} />
              <span>انتقال</span>
            </button>
          </form>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="btn-icon btn-icon-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen / Theater Reading'}
            aria-label="Toggle Fullscreen"
            style={{ width: 28, height: 28 }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VERTICAL CONTINUOUS SCROLL STREAM (ALL 699 PAGES WITH SNAPPING)          */}
      {/* ========================================================================= */}
      <main
        className="bukhari-vertical-reading-stream"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-5)',
          width: '100%',
          scrollSnapType: 'y proximity',
          paddingBottom: 'var(--space-16)',
        }}
      >
        {allPageNumbers.map((pageNum) => (
          <BukhariPageCard
            key={pageNum}
            pageNumber={pageNum}
            totalPages={totalPages}
            scale={scale}
            fitWidth={fitWidth}
            maxWidth={pageContainerMaxWidth}
            isCurrent={pageNum === currentPage}
          />
        ))}
      </main>
    </div>
  );
};

// ============================================================================
// SINGLE BUKHARI PAGE CARD COMPONENT (HIGH-DPI LAZY CANVAS RENDERING)
// ============================================================================
interface BukhariPageCardProps {
  pageNumber: number;
  totalPages: number;
  scale: number;
  fitWidth: boolean;
  maxWidth: string;
  isCurrent: boolean;
}

const BukhariPageCard: React.FC<BukhariPageCardProps> = memo(
  ({ pageNumber, totalPages, scale, fitWidth, maxWidth, isCurrent }) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);

    const [isNearViewport, setIsNearViewport] = useState<boolean>(false);
    const [isRendered, setIsRendered] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [renderError, setRenderError] = useState<boolean>(false);

    // Observe proximity to viewport for lazy canvas rendering
    useEffect(() => {
      const el = cardRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsNearViewport(true);
            } else {
              // Only unload if far away (> 2500px)
              if (entry.boundingClientRect.top > 2500 || entry.boundingClientRect.bottom < -2500) {
                setIsNearViewport(false);
                setIsRendered(false);
              }
            }
          });
        },
        {
          rootMargin: '1000px 0px 1000px 0px',
          threshold: 0.01,
        }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // Render page canvas when near viewport or when scale/fitWidth changes
    useEffect(() => {
      if (!isNearViewport || !canvasRef.current) return;

      let isCancelled = false;

      const render = async () => {
        try {
          setIsLoading(true);
          setRenderError(false);

          if (renderTaskRef.current) {
            try {
              renderTaskRef.current.cancel();
            } catch {
              // Ignore cancellation error
            }
            renderTaskRef.current = null;
          }

          let effectiveScale = scale;
          if (fitWidth && cardRef.current) {
            const containerWidth = cardRef.current.clientWidth || 700;
            // Standard scan width ~693px
            effectiveScale = Math.max(1.0, Math.min(2.5, containerWidth / 693));
          }

          if (canvasRef.current) {
            await BukhariPdfService.renderPageToCanvas(
              pageNumber,
              canvasRef.current,
              effectiveScale,
              (task) => {
                renderTaskRef.current = task;
              }
            );

            if (!isCancelled) {
              setIsRendered(true);
              setIsLoading(false);
            }
          }
        } catch (err: unknown) {
          const error = err as { name?: string };
          if (error?.name === 'RenderingCancelledException') {
            return;
          }
          if (!isCancelled) {
            console.error(`Error rendering page ${pageNumber}:`, err);
            setRenderError(true);
            setIsLoading(false);
          }
        }
      };

      render();

      return () => {
        isCancelled = true;
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Ignore cancellation
          }
        }
      };
    }, [pageNumber, isNearViewport, scale, fitWidth]);

    return (
      <article
        ref={cardRef}
        id={`bukhari-page-${pageNumber}`}
        data-page={pageNumber}
        className="bukhari-page-card card"
        style={{
          width: '100%',
          maxWidth: maxWidth,
          margin: '0 auto',
          padding: 0,
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: isCurrent
            ? '0 10px 30px rgba(16, 185, 129, 0.25), 0 0 1px rgba(0,0,0,0.5)'
            : '0 4px 18px rgba(0, 0, 0, 0.25)',
          border: isCurrent
            ? '2px solid var(--brand-primary)'
            : '1px solid var(--border-default)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          scrollSnapAlign: 'start',
          scrollMarginTop: '80px',
          boxSizing: 'border-box',
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
            padding: '6px 14px',
            backgroundColor: isCurrent
              ? 'rgba(16, 185, 129, 0.12)'
              : 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: isCurrent ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            boxSizing: 'border-box',
          }}
        >
          <span
            className="font-arabic"
            style={{
              fontSize: '0.85rem',
              color: isCurrent ? 'var(--brand-primary)' : 'var(--text-primary)',
            }}
          >
            صحيح البخاري
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              color: isCurrent ? 'var(--brand-primary)' : 'var(--text-muted)',
            }}
          >
            الصفحة {pageNumber} من {totalPages}
          </span>
        </div>

        {/* Complete Book Page Canvas Container (Preserving Natural Aspect Ratio) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            position: 'relative',
            minHeight: isRendered ? 'auto' : '360px',
            aspectRatio: isRendered ? undefined : '1 / 1.414',
            boxSizing: 'border-box',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: isRendered ? 'block' : 'none',
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              margin: '0 auto',
            }}
          />

          {/* Loading or Placeholder Skeleton */}
          {(!isRendered || isLoading) && (
            <div
              style={{
                position: isRendered ? 'absolute' : 'relative',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                minHeight: '360px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                gap: 8,
                zIndex: 2,
              }}
            >
              <div
                className="spinner"
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid rgba(16, 185, 129, 0.2)',
                  borderTopColor: 'var(--brand-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span
                className="font-arabic text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                جاري تحميل الصفحة {pageNumber}...
              </span>
            </div>
          )}

          {/* Render Error Fallback */}
          {renderError && (
            <div
              style={{
                padding: 'var(--space-4)',
                textAlign: 'center',
                color: '#ef4444',
                fontSize: '0.82rem',
              }}
            >
              تعذر تحميل الصفحة {pageNumber}. الرجاء إعادة المحاولة.
            </div>
          )}
        </div>
      </article>
    );
  }
);
BukhariPageCard.displayName = 'BukhariPageCard';
