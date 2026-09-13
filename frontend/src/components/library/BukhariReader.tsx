import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Search,
  Check,
} from 'lucide-react';
import { BUKHARI_VOLUMES } from '../../data/bukhariData';
import { BukhariPdfService } from '../../services/bukhariPdfService';
import { getHadithByRef } from '../../data/dailyHadithData';

interface ZoomOption {
  id: string;
  label: string;
  scale?: number;
  isSpecial?: 'fit-width' | 'reset-default';
}

const ZOOM_PERCENTAGES: number[] = [0.5, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5];

const ZOOM_OPTIONS: ZoomOption[] = [
  { id: '50', label: '50%', scale: 0.5 },
  { id: '75', label: '75%', scale: 0.75 },
  { id: '90', label: '90%', scale: 0.9 },
  { id: '100', label: '100%', scale: 1.0 },
  { id: '110', label: '110%', scale: 1.1 },
  { id: '125', label: '125%', scale: 1.25 },
  { id: '150', label: '150%', scale: 1.5 },
  { id: '175', label: '175%', scale: 1.75 },
  { id: '200', label: '200%', scale: 2.0 },
  { id: '250', label: '250%', scale: 2.5 },
  { id: 'fit-width', label: 'Fit to Width', isSpecial: 'fit-width' },
  { id: 'reset-default', label: 'Reset to Default', isSpecial: 'reset-default' },
];

// Module-level session state to preserve explicitly chosen zoom across page changes in current session
let sessionBukhariZoomLevel: number | null = null;
let sessionBukhariFitWidth: boolean | null = null;

export const BukhariReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const bukhariBook = BUKHARI_VOLUMES[0];
  const totalPages = bukhariBook.totalPages; // 699 pages

  const pageParam = searchParams.get('page');
  const hadithParam = searchParams.get('hadith') || searchParams.get('hadithId') || searchParams.get('ref');

  // Resolve target Hadith page if hadith/hadithId/ref is provided in URL
  const targetHadith = hadithParam ? getHadithByRef(hadithParam) : undefined;

  const initialPage = pageParam
    ? Math.max(1, Math.min(totalPages, parseInt(pageParam, 10) || 1))
    : targetHadith?.pageNumber || 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPage.toString());
  const [zoomLevel, setZoomLevel] = useState<number>(() => sessionBukhariZoomLevel ?? 1.0);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(() => sessionBukhariFitWidth ?? true); // Default: Fit to Width
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activePageRef = useRef<number>(currentPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync direct input box with current page
  useEffect(() => {
    setDirectPageInput(currentPage.toString());
  }, [currentPage]);

  // Maintain currently visible page position after zoom adjustment
  const maintainCurrentPagePosition = useCallback((targetPage: number) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`bukhari-page-${targetPage}`);
      if (el) {
        const headerOffset = isFullscreen ? 55 : 130;
        const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'instant' as ScrollBehavior });
      }
    });
  }, [isFullscreen]);

  // Close zoom dropdown when clicking outside
  useEffect(() => {
    if (!isZoomMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(event.target as Node)) {
        setIsZoomMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isZoomMenuOpen]);

  // Scroll to a specific Bukhari page
  const scrollToPage = useCallback(
    (pageNum: number, behavior: ScrollBehavior = 'auto') => {
      const clamped = Math.max(1, Math.min(totalPages, pageNum));
      setCurrentPage(clamped);
      activePageRef.current = clamped;
      isProgrammaticScrollRef.current = true;

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', clamped.toString());
        return next;
      });

      const performScroll = () => {
        const el = document.getElementById(`bukhari-page-${clamped}`);
        if (el) {
          const headerOffset = isFullscreen ? 60 : 135;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, y), behavior });
        }
      };

      performScroll();
      requestAnimationFrame(performScroll);
      setTimeout(performScroll, 80);
      setTimeout(performScroll, 250);

      const lockDuration = behavior === 'smooth' ? 1200 : 350;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, lockDuration);
    },
    [totalPages, isFullscreen, setSearchParams]
  );

  // Initial scroll when mounting or when navigating from Dashboard
  useEffect(() => {
    const targetPage = initialPage;
    const timer = setTimeout(() => {
      scrollToPage(targetPage, 'auto');
    }, 120);
    return () => clearTimeout(timer);
  }, [initialPage, scrollToPage]);

  // Handle URL param changes (e.g. browser back/forward)
  useEffect(() => {
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages && p !== activePageRef.current) {
        scrollToPage(p, 'auto');
      }
    }
  }, [pageParam, totalPages, scrollToPage]);

  // Track currently visible page during vertical scrolling
  useEffect(() => {
    const headerOffset = isFullscreen ? 55 : 130;
    const focusY = headerOffset + 30;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        let activeEntry: IntersectionObserverEntry | null = null;
        let maxVisibleHeight = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const rect = entry.boundingClientRect;

          // Check if this page card covers the active reading focus line right below sticky header
          if (rect.top <= focusY && rect.bottom > focusY) {
            activeEntry = entry;
            break;
          }

          // Fallback: calculate visible height in reading viewport
          const visibleTop = Math.max(rect.top, headerOffset);
          const visibleBottom = Math.min(rect.bottom, window.innerHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          if (visibleHeight > maxVisibleHeight) {
            maxVisibleHeight = visibleHeight;
            activeEntry = entry;
          }
        }

        if (activeEntry) {
          const pageAttr = activeEntry.target.getAttribute('data-page');
          const p = parseInt(pageAttr || '', 10);
          if (!isNaN(p) && p !== activePageRef.current) {
            activePageRef.current = p;
            setCurrentPage(p);
          }
        }
      },
      {
        root: null,
        rootMargin: isFullscreen ? '-55px 0px -40% 0px' : '-130px 0px -40% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    const pageElements = document.querySelectorAll('.bukhari-page-card');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isFullscreen, totalPages]);

  // Handle direct page jump form submission
  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pNum = parseInt(directPageInput, 10);
    if (!isNaN(pNum) && pNum >= 1 && pNum <= totalPages) {
      scrollToPage(pNum, 'auto');
    }
  };

  const handleSelectZoomOption = (opt: ZoomOption) => {
    const currentP = activePageRef.current;
    if (opt.isSpecial === 'fit-width') {
      setIsFitWidth(true);
      setZoomLevel(1.0);
      sessionBukhariFitWidth = true;
      sessionBukhariZoomLevel = 1.0;
    } else if (opt.isSpecial === 'reset-default') {
      setIsFitWidth(true);
      setZoomLevel(1.0);
      sessionBukhariFitWidth = true;
      sessionBukhariZoomLevel = 1.0;
    } else if (opt.scale !== undefined) {
      setIsFitWidth(false);
      setZoomLevel(opt.scale);
      sessionBukhariFitWidth = false;
      sessionBukhariZoomLevel = opt.scale;
    }
    setIsZoomMenuOpen(false);
    maintainCurrentPagePosition(currentP);
  };

  const handleZoomIn = () => {
    const currentP = activePageRef.current;
    setIsFitWidth(false);
    setZoomLevel((prev) => {
      const next = ZOOM_PERCENTAGES.find((p) => p > prev + 0.02);
      const newScale = next ? next : Math.min(2.5, +(prev + 0.15).toFixed(2));
      sessionBukhariFitWidth = false;
      sessionBukhariZoomLevel = newScale;
      return newScale;
    });
    maintainCurrentPagePosition(currentP);
  };

  const handleZoomOut = () => {
    const currentP = activePageRef.current;
    setIsFitWidth(false);
    setZoomLevel((prev) => {
      const prevArr = [...ZOOM_PERCENTAGES].reverse();
      const prevMatch = prevArr.find((p) => p < prev - 0.02);
      const newScale = prevMatch ? prevMatch : Math.max(0.5, +(prev - 0.15).toFixed(2));
      sessionBukhariFitWidth = false;
      sessionBukhariZoomLevel = newScale;
      return newScale;
    });
    maintainCurrentPagePosition(currentP);
  };

  const handleResetZoom = () => {
    const currentP = activePageRef.current;
    setIsFitWidth(true);
    setZoomLevel(1.0);
    sessionBukhariFitWidth = true;
    sessionBukhariZoomLevel = 1.0;
    setIsZoomMenuOpen(false);
    maintainCurrentPagePosition(currentP);
  };

  // Generate all 699 pages array
  const allPageNumbers = useRef<number[]>(
    Array.from({ length: totalPages }, (_, i) => i + 1)
  ).current;

  const pageContainerMaxWidth = isFitWidth
    ? '880px'
    : `${Math.min(1600, Math.max(340, Math.round(820 * zoomLevel) + 60))}px`;

  return (
    <div
      className={`bukhari-reader-page-root ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        width: '100%',
        maxWidth: isFullscreen ? '100%' : pageContainerMaxWidth,
        margin: '0 auto',
        padding: isFullscreen
          ? 'var(--space-1) var(--space-2)'
          : 'var(--space-1) var(--space-2) var(--space-12)',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}
    >
      {/* ========================================================================= */}
      {/* CLEAN RESPONSIVE PERMANENTLY STICKY TOOLBAR & PAGE SEARCH BOX            */}
      {/* ========================================================================= */}
      <header
        className="card bukhari-top-toolbar"
        style={{
          position: 'sticky',
          top: isFullscreen ? '0px' : 'var(--header-height, 68px)',
          zIndex: 35,
          padding: '8px 14px',
          marginBottom: 'var(--space-4)',
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px 12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.55)',
          boxSizing: 'border-box',
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

        {/* Section 2: Single Clean Zoom Button with Dropdown Menu */}
        <div
          ref={zoomMenuRef}
          style={{
            position: 'relative',
            overflow: 'visible',
            zIndex: isZoomMenuOpen ? 60 : 1,
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${isZoomMenuOpen ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setIsZoomMenuOpen((prev) => !prev)}
            title="Zoom Options"
            aria-label="Zoom Options"
            aria-expanded={isZoomMenuOpen}
            aria-haspopup="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-md)',
              border: isZoomMenuOpen
                ? '1px solid var(--brand-primary)'
                : '1px solid var(--border-default)',
              backgroundColor: isZoomMenuOpen
                ? 'rgba(16, 185, 129, 0.15)'
                : 'var(--bg-surface)',
            }}
          >
            <ZoomIn size={15} />
            <span style={{ fontWeight: 600 }}>Zoom</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-mono)',
                color: isFitWidth || zoomLevel !== 1.0 ? 'var(--brand-primary)' : 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {isFitWidth ? 'Fit Width' : `${Math.round(zoomLevel * 100)}%`}
            </span>
          </button>

          {/* Clean Responsive PDF-Reader Zoom Dropdown Menu */}
          {isZoomMenuOpen && (
            <div
              className="zoom-dropdown-menu"
              style={{
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxSizing: 'border-box',
              }}
            >
              {/* Top Row: Manual Zoom Out / In Controls & Status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  className="btn-icon btn-icon-sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5 && !isFitWidth}
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                  style={{ width: 28, height: 28 }}
                >
                  <ZoomOut size={14} />
                </button>

                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 'bold',
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--font-mono)',
                    minWidth: 60,
                    textAlign: 'center',
                  }}
                >
                  {isFitWidth ? 'Fit Width' : `${Math.round(zoomLevel * 100)}%`}
                </span>

                <button
                  type="button"
                  className="btn-icon btn-icon-sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2.5 && !isFitWidth}
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                  style={{ width: 28, height: 28 }}
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Grid of Common PDF Zoom Percentages */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '4px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  paddingRight: '2px',
                }}
              >
                {ZOOM_OPTIONS.filter((opt) => opt.scale !== undefined).map((opt) => {
                  const isSelected = !isFitWidth && Math.abs(zoomLevel - (opt.scale ?? 1)) < 0.01;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleSelectZoomOption(opt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      title={`Zoom ${opt.label}`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

              {/* Special Actions: Fit to Width & Reset to Default */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  className={`btn btn-xs ${isFitWidth ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleSelectZoomOption(ZOOM_OPTIONS.find((o) => o.id === 'fit-width')!)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-default)',
                  }}
                  title="Fit page to full width"
                >
                  <span>Fit to Width</span>
                  {isFitWidth && <Check size={12} />}
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={handleResetZoom}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '5px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-default)',
                  }}
                  title="Reset to Default (100%)"
                >
                  <RotateCcw size={13} />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Page Search & Jump (No Prev/Next buttons) */}
        <div
          className="bukhari-page-search-container"
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
          minWidth: !isFitWidth && zoomLevel > 1.0 ? `${Math.round(820 * zoomLevel)}px` : '100%',
          scrollSnapType: 'y proximity',
          paddingBottom: 'var(--space-16)',
          boxSizing: 'border-box',
        }}
      >
        {allPageNumbers.map((pageNum) => (
          <BukhariPageCard
            key={pageNum}
            pageNumber={pageNum}
            totalPages={totalPages}
            zoomLevel={zoomLevel}
            isFitWidth={isFitWidth}
            isCurrent={pageNum === currentPage}
            initialPage={initialPage}
          />
        ))}
      </main>
    </div>
  );
};

// ============================================================================
// SINGLE BUKHARI PAGE CARD COMPONENT (HIGH-DPI AUTHENTIC BOOK RENDERING)
// ============================================================================
interface BukhariPageCardProps {
  pageNumber: number;
  totalPages: number;
  zoomLevel: number;
  isFitWidth: boolean;
  isCurrent: boolean;
  initialPage: number;
}

const BukhariPageCard: React.FC<BukhariPageCardProps> = memo(
  ({
    pageNumber,
    totalPages,
    zoomLevel,
    isFitWidth,
    isCurrent,
    initialPage,
  }) => {
    const isNearby = Math.abs(pageNumber - initialPage) <= 3 || isCurrent;
    const [imgLoaded, setImgLoaded] = useState<boolean>(false);
    const [useFallbackCanvas, setUseFallbackCanvas] = useState<boolean>(false);
    const [canvasRendered, setCanvasRendered] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const imageUrl = BukhariPdfService.getPageImageUrl(pageNumber);
    const fallbackUrl = BukhariPdfService.getPageFallbackUrl(pageNumber);

    // Live canvas fallback rendering if image fails to load
    useEffect(() => {
      if (!useFallbackCanvas || canvasRendered || !canvasRef.current) return;

      let isCancelled = false;
      const render = async () => {
        try {
          if (canvasRef.current) {
            await BukhariPdfService.renderPageToCanvas(
              pageNumber,
              canvasRef.current,
              Math.max(1.5, zoomLevel * 1.5)
            );
            if (!isCancelled) {
              setCanvasRendered(true);
            }
          }
        } catch (err) {
          console.error(`Fallback canvas render failed for page ${pageNumber}:`, err);
        }
      };

      render();
      return () => {
        isCancelled = true;
      };
    }, [useFallbackCanvas, canvasRendered, pageNumber, zoomLevel]);

    return (
      <article
        id={`bukhari-page-${pageNumber}`}
        data-page={pageNumber}
        className="bukhari-page-card card"
        style={{
          width: isFitWidth ? '100%' : `${Math.round(820 * zoomLevel)}px`,
          maxWidth: isFitWidth ? '820px' : zoomLevel <= 1.0 ? `${Math.round(820 * zoomLevel)}px` : 'none',
          minWidth: isFitWidth ? 'auto' : zoomLevel > 1.0 ? `${Math.round(820 * zoomLevel)}px` : 'auto',
          flexShrink: 0,
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


        {/* Complete Book Page Container (Preserving Natural Aspect Ratio: 693 / 1002) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            position: 'relative',
            minHeight: '260px',
            aspectRatio: '693 / 1002',
            boxSizing: 'border-box',
          }}
        >
          {!useFallbackCanvas ? (
            <img
              src={imageUrl}
              alt={`صحيح البخاري - الصفحة ${pageNumber}`}
              loading={isNearby ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={isCurrent ? 'high' : isNearby ? 'auto' : 'low'}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== fallbackUrl && !img.src.endsWith(fallbackUrl)) {
                  img.src = fallbackUrl;
                } else {
                  setUseFallbackCanvas(true);
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: imgLoaded ? 1 : 0.9,
                transition: 'opacity 0.2s ease',
              }}
            />
          ) : (
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                margin: '0 auto',
              }}
            />
          )}

          {/* Loading Skeleton */}
          {!imgLoaded && !canvasRendered && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
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
        </div>
      </article>
    );
  }
);
BukhariPageCard.displayName = 'BukhariPageCard';


