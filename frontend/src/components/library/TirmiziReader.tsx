import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  getTirmiziVolume,
  getTirmiziPrintedPage,
  getTirmiziPdfPage,
} from '../../data/tirmiziData';
import { TirmiziPdfService } from '../../services/tirmiziPdfService';

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
let sessionTirmiziZoomLevel: number | null = null;
let sessionTirmiziFitWidth: boolean | null = null;

export const TirmiziReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const volParam = searchParams.get('vol');
  const volNum = volParam ? parseInt(volParam, 10) || 1 : 1;
  const tirmiziBook = getTirmiziVolume(volNum);
  const totalPages = tirmiziBook.totalPages; // 340 PDF pages for Vol 1 Part 1
  const totalPrintedPages = tirmiziBook.totalPrintedPages || totalPages; // 335 Printed pages

  const pageParam = searchParams.get('page');
  const initialPrintedPage = pageParam
    ? Math.max(1, Math.min(totalPrintedPages, parseInt(pageParam, 10) || 1))
    : 1;
  const initialPdfPage = getTirmiziPdfPage(volNum, initialPrintedPage);

  const [currentPdfPage, setCurrentPdfPage] = useState<number>(initialPdfPage);
  const [currentPrintedPage, setCurrentPrintedPage] = useState<number>(initialPrintedPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPrintedPage.toString());
  const [zoomLevel, setZoomLevel] = useState<number>(() => sessionTirmiziZoomLevel ?? 1.0);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(() => sessionTirmiziFitWidth ?? true); // Default: Fit to Width
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [globalRotation, setGlobalRotation] = useState<number>(0);
  const [pageCustomRotations, setPageCustomRotations] = useState<Record<number, number>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    horizontalAlign: 'left' | 'right' | 'center';
    verticalAlign: 'bottom' | 'top';
  }>({ horizontalAlign: 'right', verticalAlign: 'bottom' });

  const activePdfPageRef = useRef<number>(initialPdfPage);
  const activePrintedPageRef = useRef<number>(initialPrintedPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync direct input box with current printed page
  useEffect(() => {
    setDirectPageInput(currentPrintedPage.toString());
  }, [currentPrintedPage]);

  // Maintain currently visible page position after zoom adjustment
  const maintainCurrentPagePosition = useCallback(
    (targetPage: number) => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`tirmizi-page-${targetPage}`);
        if (el) {
          const headerOffset = isFullscreen ? 55 : 130;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'instant' as ScrollBehavior });
        }
      });
    },
    [isFullscreen]
  );

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

  // Dynamically calculate collision-aware outward positioning for zoom dropdown
  useEffect(() => {
    if (!isZoomMenuOpen || !zoomMenuRef.current) return;

    const updatePosition = () => {
      if (!zoomMenuRef.current) return;
      const rect = zoomMenuRef.current.getBoundingClientRect();
      const menuWidth = 250;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check horizontal available space
      let hAlign: 'left' | 'right' | 'center' = 'right';
      if (viewportWidth < 540) {
        if (rect.right >= menuWidth + 12) {
          hAlign = 'right';
        } else if (viewportWidth - rect.left >= menuWidth + 12) {
          hAlign = 'left';
        } else {
          hAlign = 'center';
        }
      } else {
        const spaceOnRight = viewportWidth - rect.left;
        const spaceOnLeft = rect.right;

        if (spaceOnLeft < menuWidth && spaceOnRight >= menuWidth) {
          hAlign = 'left';
        } else if (spaceOnRight < menuWidth && spaceOnLeft >= menuWidth) {
          hAlign = 'right';
        } else {
          hAlign = 'right';
        }
      }

      // Check vertical available space
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 300;
      const vAlign: 'bottom' | 'top' =
        spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

      setDropdownPosition({ horizontalAlign: hAlign, verticalAlign: vAlign });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isZoomMenuOpen]);

  // Cancel programmatic scroll lock immediately upon any manual user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Scroll to a specific Tirmizi PDF page (clamped [1, totalPages])
  const scrollToPdfPage = useCallback(
    (pdfPageNum: number, behavior: ScrollBehavior = 'auto', explicitPrintedNum?: number) => {
      const clampedPdf = Math.max(1, Math.min(totalPages, pdfPageNum));
      const printedNum =
        explicitPrintedNum !== undefined
          ? Math.max(1, Math.min(totalPrintedPages, explicitPrintedNum))
          : getTirmiziPrintedPage(volNum, clampedPdf);

      setCurrentPdfPage(clampedPdf);
      setCurrentPrintedPage(printedNum);
      activePdfPageRef.current = clampedPdf;
      activePrintedPageRef.current = printedNum;
      isProgrammaticScrollRef.current = true;

      setSearchParams((prev) => {
        if (prev.get('page') === printedNum.toString()) return prev;
        const next = new URLSearchParams(prev);
        next.set('page', printedNum.toString());
        return next;
      });

      const performScroll = () => {
        const el = document.getElementById(`tirmizi-page-${clampedPdf}`);
        if (el) {
          const headerOffset = isFullscreen ? 55 : 130;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, y), behavior });
        }
      };

      performScroll();
      requestAnimationFrame(performScroll);

      const lockDuration = behavior === 'smooth' ? 1000 : 300;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, lockDuration);
    },
    [totalPages, totalPrintedPages, volNum, isFullscreen, setSearchParams]
  );

  // Initial scroll when mounting
  useEffect(() => {
    const targetPdfPage = initialPdfPage;
    const targetPrinted = initialPrintedPage;
    const timer = setTimeout(() => {
      scrollToPdfPage(targetPdfPage, 'auto', targetPrinted);
    }, 120);
    return () => clearTimeout(timer);
  }, [initialPdfPage, initialPrintedPage, scrollToPdfPage]);

  // Handle URL param changes (e.g. browser back/forward)
  useEffect(() => {
    if (pageParam && !isProgrammaticScrollRef.current) {
      const printedP = parseInt(pageParam, 10);
      if (
        !isNaN(printedP) &&
        printedP >= 1 &&
        printedP <= totalPrintedPages &&
        printedP !== activePrintedPageRef.current
      ) {
        const targetPdf = getTirmiziPdfPage(volNum, printedP);
        scrollToPdfPage(targetPdf, 'auto', printedP);
      }
    }
  }, [pageParam, totalPrintedPages, volNum, scrollToPdfPage]);

  // Track currently visible page during vertical scrolling
  useEffect(() => {
    const headerOffset = isFullscreen ? 55 : 130;
    const focusY = headerOffset + 30;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        let activePdf: number | null = null;
        let maxVisibleHeight = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const rect = entry.boundingClientRect;

          // Check if this page card covers the active reading focus line right below sticky header
          if (rect.top <= focusY && rect.bottom > focusY) {
            const pageAttr = entry.target.getAttribute('data-page');
            const p = parseInt(pageAttr || '', 10);
            if (!isNaN(p)) {
              activePdf = p;
              break;
            }
          }

          // Fallback: calculate visible height in reading viewport
          const visibleTop = Math.max(rect.top, headerOffset);
          const visibleBottom = Math.min(rect.bottom, window.innerHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          if (visibleHeight > maxVisibleHeight) {
            maxVisibleHeight = visibleHeight;
            const pageAttr = entry.target.getAttribute('data-page');
            const p = parseInt(pageAttr || '', 10);
            if (!isNaN(p)) {
              activePdf = p;
            }
          }
        }

        if (activePdf !== null && activePdf !== activePdfPageRef.current) {
          activePdfPageRef.current = activePdf;
          const printed = getTirmiziPrintedPage(volNum, activePdf);
          activePrintedPageRef.current = printed;
          setCurrentPdfPage(activePdf);
          setCurrentPrintedPage(printed);

          // Silently sync URL query parameter without triggering React Router route re-renders
          try {
            const url = new URL(window.location.href);
            if (url.searchParams.get('page') !== printed.toString()) {
              url.searchParams.set('page', printed.toString());
              window.history.replaceState(window.history.state, '', url.toString());
            }
          } catch {
            // ignore
          }
        }
      },
      {
        root: null,
        rootMargin: isFullscreen ? '-55px 0px -40% 0px' : '-130px 0px -40% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    const pageElements = document.querySelectorAll('.tirmizi-page-card');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isFullscreen, volNum]);

  // Handle direct page jump form submission (searching by printed book page number)
  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pNum = parseInt(directPageInput, 10);
    if (isNaN(pNum) || pNum < 1 || pNum > totalPrintedPages) {
      setValidationError(
        `براہ کرم 1 سے ${totalPrintedPages} کے درمیان درست صفحہ نمبر درج کریں (Please enter a valid page number between 1 and ${totalPrintedPages})`
      );
      setTimeout(() => {
        setValidationError(null);
      }, 4000);
      return;
    }
    setValidationError(null);
    const targetPdf = getTirmiziPdfPage(volNum, pNum);
    scrollToPdfPage(targetPdf, 'auto', pNum);
  };

  // Navigate to previous page in sequential printed reading stream
  const handlePrevPage = () => {
    if (currentPdfPage > 1) {
      const targetPdf = currentPdfPage - 1;
      const targetPrinted = getTirmiziPrintedPage(volNum, targetPdf);
      scrollToPdfPage(targetPdf, 'smooth', targetPrinted);
    }
  };

  // Navigate to next page in sequential printed reading stream
  const handleNextPage = () => {
    if (currentPdfPage < totalPages) {
      const targetPdf = currentPdfPage + 1;
      const targetPrinted = getTirmiziPrintedPage(volNum, targetPdf);
      scrollToPdfPage(targetPdf, 'smooth', targetPrinted);
    }
  };

  const handleSelectZoomOption = (opt: ZoomOption) => {
    const currentP = activePdfPageRef.current;
    if (opt.isSpecial === 'fit-width' || opt.isSpecial === 'reset-default') {
      setIsFitWidth(true);
      setZoomLevel(1.0);
      sessionTirmiziFitWidth = true;
      sessionTirmiziZoomLevel = 1.0;
    } else if (opt.scale !== undefined) {
      setIsFitWidth(false);
      setZoomLevel(opt.scale);
      sessionTirmiziFitWidth = false;
      sessionTirmiziZoomLevel = opt.scale;
    }
    setIsZoomMenuOpen(false);
    maintainCurrentPagePosition(currentP);
  };

  const handleZoomIn = () => {
    const currentP = activePdfPageRef.current;
    setIsFitWidth(false);
    setZoomLevel((prev) => {
      const next = ZOOM_PERCENTAGES.find((p) => p > prev + 0.02);
      const newScale = next ? next : Math.min(2.5, +(prev + 0.15).toFixed(2));
      sessionTirmiziFitWidth = false;
      sessionTirmiziZoomLevel = newScale;
      return newScale;
    });
    maintainCurrentPagePosition(currentP);
  };

  const handleZoomOut = () => {
    const currentP = activePdfPageRef.current;
    setIsFitWidth(false);
    setZoomLevel((prev) => {
      const prevArr = [...ZOOM_PERCENTAGES].reverse();
      const prevMatch = prevArr.find((p) => p < prev - 0.02);
      const newScale = prevMatch ? prevMatch : Math.max(0.5, +(prev - 0.15).toFixed(2));
      sessionTirmiziFitWidth = false;
      sessionTirmiziZoomLevel = newScale;
      return newScale;
    });
    maintainCurrentPagePosition(currentP);
  };

  const handleResetZoom = () => {
    const currentP = activePdfPageRef.current;
    setIsFitWidth(true);
    setZoomLevel(1.0);
    sessionTirmiziFitWidth = true;
    sessionTirmiziZoomLevel = 1.0;
    setIsZoomMenuOpen(false);
    maintainCurrentPagePosition(currentP);
  };

  // Toggle rotation by 180 degrees for active page or global view
  const handleToggleRotation = (targetPageNum?: number) => {
    if (targetPageNum !== undefined) {
      setPageCustomRotations((prev) => {
        const curr = prev[targetPageNum] ?? 0;
        return { ...prev, [targetPageNum]: (curr + 180) % 360 };
      });
    } else {
      setGlobalRotation((prev) => (prev + 180) % 360);
    }
  };

  // Generate all pages array
  const allPageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  const pageContainerMaxWidth = isFitWidth
    ? '880px'
    : `${Math.min(1600, Math.max(340, Math.round(820 * zoomLevel) + 60))}px`;

  return (
    <div
      className={`tirmizi-reader-page-root ${isFullscreen ? 'fullscreen-mode' : ''}`}
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
        className="card tirmizi-top-toolbar"
        style={{
          position: 'sticky',
          top: isFullscreen ? '0px' : 'var(--header-height, 68px)',
          zIndex: 100,
          padding: '8px 14px',
          marginBottom: 'var(--space-4)',
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(192, 38, 211, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px 12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.55)',
          boxSizing: 'border-box',
          overflow: 'visible',
        }}
      >
        {/* Section 1: Back to Library */}
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
            onClick={() => navigate('/library/jami-at-tirmidhi')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              fontSize: '0.82rem',
            }}
            title="Back to Jami' at-Tirmidhi"
          >
            <ArrowLeft size={16} />
            <span>Jami’ at-Tirmidhi</span>
          </button>
        </div>

        {/* Section 2: Single Clean Zoom Button with Dropdown Menu */}
        <div
          ref={zoomMenuRef}
          style={{
            position: 'relative',
            overflow: 'visible',
            zIndex: isZoomMenuOpen ? 1000 : 1,
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
                ? '1px solid #c026d3'
                : '1px solid var(--border-default)',
              backgroundColor: isZoomMenuOpen
                ? 'rgba(192, 38, 211, 0.15)'
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
                color: isFitWidth || zoomLevel !== 1.0 ? '#e879f9' : 'var(--text-secondary)',
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
              className={`zoom-dropdown-menu align-${dropdownPosition.horizontalAlign} ${
                dropdownPosition.verticalAlign === 'top' ? 'align-top' : ''
              }`}
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
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(192, 38, 211, 0.35)',
                }}
              >
                <button
                  type="button"
                  className="btn-icon btn-icon-sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5 && !isFitWidth}
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                  style={{ width: 28, height: 28, color: '#f0abfc' }}
                >
                  <ZoomOut size={14} />
                </button>

                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 'bold',
                    color: '#e879f9',
                    fontFamily: 'var(--font-mono)',
                    minWidth: 68,
                    textAlign: 'center',
                    userSelect: 'none',
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
                  style={{ width: 28, height: 28, color: '#f0abfc' }}
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
                        backgroundColor: isSelected ? '#a21caf' : 'rgba(30, 41, 59, 0.6)',
                        color: isSelected ? '#ffffff' : '#e2e8f0',
                        border: isSelected
                          ? '1px solid #c026d3'
                          : '1px solid rgba(192, 38, 211, 0.2)',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                      }}
                      title={`Zoom ${opt.label}`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  height: '1px',
                  backgroundColor: 'rgba(192, 38, 211, 0.25)',
                  margin: '2px 0',
                }}
              />

              {/* Special Actions: Fit to Width & Reset to Default */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button
                  type="button"
                  className={`btn btn-xs ${isFitWidth ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleSelectZoomOption(ZOOM_OPTIONS.find((o) => o.id === 'fit-width')!)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: isFitWidth
                      ? '1px solid #c026d3'
                      : '1px solid rgba(192, 38, 211, 0.3)',
                    backgroundColor: isFitWidth ? '#a21caf' : 'rgba(30, 41, 59, 0.6)',
                    color: isFitWidth ? '#ffffff' : '#e2e8f0',
                    cursor: 'pointer',
                  }}
                  title="Fit page to full width"
                >
                  <span>Fit to Width</span>
                  {isFitWidth && <Check size={13} />}
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
                    padding: '6px 10px',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(192, 38, 211, 0.3)',
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    color: '#e2e8f0',
                    cursor: 'pointer',
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

        {/* Section 3: Page Navigation & Search */}
        <div
          className="tirmizi-page-search-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {/* Previous Page Button */}
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={handlePrevPage}
            disabled={currentPdfPage <= 1}
            title="Previous Page"
            aria-label="Previous Page"
            style={{
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: currentPdfPage <= 1 ? 'var(--text-muted)' : '#e879f9',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              cursor: currentPdfPage <= 1 ? 'not-allowed' : 'pointer',
              opacity: currentPdfPage <= 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={13} />
            <span style={{ fontSize: '0.76rem', fontWeight: 600 }}>Prev</span>
          </button>

          {/* Page Number Search Form */}
          <form
            onSubmit={handleDirectPageSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              padding: '2px 6px',
            }}
          >
            <span
              style={{
                fontSize: '0.80rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              Page No.
            </span>

            <input
              type="number"
              min={1}
              max={totalPrintedPages}
              value={directPageInput}
              onChange={(e) => setDirectPageInput(e.target.value)}
              aria-label="Page No."
              style={{
                width: '52px',
                textAlign: 'center',
                padding: '3px 2px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: '#e879f9',
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
              / {totalPrintedPages}
            </span>

            <button
              type="submit"
              className="btn btn-xs btn-primary"
              style={{
                padding: '3px 7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#a21caf',
                borderColor: '#c026d3',
              }}
              title="Page No."
              aria-label="Page No."
            >
              <Search size={12} />
            </button>
          </form>

          {/* Next Page Button */}
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={handleNextPage}
            disabled={currentPdfPage >= totalPages}
            title="Next Page"
            aria-label="Next Page"
            style={{
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: currentPdfPage >= totalPages ? 'var(--text-muted)' : '#e879f9',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              cursor: currentPdfPage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPdfPage >= totalPages ? 0.5 : 1,
            }}
          >
            <span style={{ fontSize: '0.76rem', fontWeight: 600 }}>Next</span>
            <ChevronRight size={13} />
          </button>

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

      {/* Validation Toast Message */}
      {validationError && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            maxWidth: '440px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            backgroundColor: 'rgba(153, 27, 27, 0.96)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            backdropFilter: 'blur(12px)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, color: '#fca5a5' }} />
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '0 4px',
              lineHeight: 1,
            }}
            title="Dismiss error"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERTICAL CONTINUOUS SCROLL STREAM (ALL PAGES)                             */}
      {/* ========================================================================= */}
      <main
        className="tirmizi-vertical-reading-stream"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-5)',
          width: '100%',
          minWidth: !isFitWidth && zoomLevel > 1.0 ? `${Math.round(820 * zoomLevel)}px` : '100%',
          scrollSnapType: 'none',
          paddingBottom: 'var(--space-16)',
          boxSizing: 'border-box',
        }}
      >
        {allPageNumbers.map((pageNum: number) => (
          <TirmiziPageCard
            key={pageNum}
            pageNumber={pageNum}
            volumeNumber={volNum}
            totalPages={totalPages}
            totalPrintedPages={totalPrintedPages}
            zoomLevel={zoomLevel}
            isFitWidth={isFitWidth}
            isCurrent={pageNum === currentPdfPage}
            rotationOverride={(globalRotation + (pageCustomRotations[pageNum] ?? 0)) % 360}
            onTogglePageRotation={() => handleToggleRotation(pageNum)}
          />
        ))}
      </main>
    </div>
  );
};

// ============================================================================
// SINGLE JAMI' AT-TIRMIZI PAGE CARD COMPONENT (HIGH-DPI AUTHENTIC BOOK RENDERING)
// ============================================================================
interface TirmiziPageCardProps {
  pageNumber: number;
  volumeNumber?: number;
  totalPages: number;
  totalPrintedPages?: number;
  zoomLevel: number;
  isFitWidth: boolean;
  isCurrent: boolean;
  rotationOverride?: number;
  onTogglePageRotation?: () => void;
}

const TirmiziPageCard: React.FC<TirmiziPageCardProps> = memo(
  ({
    pageNumber,
    volumeNumber = 1,
    totalPages,
    totalPrintedPages,
    zoomLevel,
    isFitWidth,
    isCurrent,
    rotationOverride = 0,
    onTogglePageRotation,
  }) => {
    const [imgLoaded, setImgLoaded] = useState<boolean>(false);
    const [useFallbackCanvas, setUseFallbackCanvas] = useState<boolean>(false);
    const [canvasRendered, setCanvasRendered] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const imageUrl = TirmiziPdfService.getPageImageUrl(pageNumber, volumeNumber);
    const fallbackUrl = TirmiziPdfService.getFallbackPageImageUrl(pageNumber, volumeNumber);
    const printedPageNumber = getTirmiziPrintedPage(volumeNumber, pageNumber);
    const printedTotal = totalPrintedPages || totalPages;

    // Fallback live canvas rendering via TirmiziPdfService if WebP image fails
    useEffect(() => {
      if (!useFallbackCanvas || canvasRendered) return;

      let isCancelled = false;
      const render = async () => {
        try {
          if (canvasRef.current) {
            await TirmiziPdfService.renderPageToCanvas(
              pageNumber,
              canvasRef.current,
              Math.max(1.5, zoomLevel * 1.5),
              undefined,
              rotationOverride,
              volumeNumber
            );
            if (!isCancelled) {
              setCanvasRendered(true);
            }
          }
        } catch (err) {
          console.error(
            `Fallback canvas render failed for Tirmizi Vol ${volumeNumber} page ${pageNumber}:`,
            err
          );
        }
      };

      render();
      return () => {
        isCancelled = true;
      };
    }, [useFallbackCanvas, canvasRendered, pageNumber, zoomLevel, rotationOverride, volumeNumber]);

    return (
      <article
        id={`tirmizi-page-${pageNumber}`}
        data-page={pageNumber}
        className="tirmizi-page-card card"
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
            ? '0 10px 30px rgba(192, 38, 211, 0.25), 0 0 1px rgba(0,0,0,0.5)'
            : '0 4px 18px rgba(0, 0, 0, 0.25)',
          border: isCurrent
            ? '2px solid #c026d3'
            : '2px solid var(--border-default)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          scrollSnapAlign: 'none',
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
              ? 'rgba(192, 38, 211, 0.12)'
              : 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: isCurrent ? '#e879f9' : 'var(--text-secondary)',
            fontWeight: 600,
            boxSizing: 'border-box',
          }}
        >
          <span
            className="font-arabic"
            style={{
              fontSize: '0.85rem',
              color: isCurrent ? '#e879f9' : 'var(--text-primary)',
            }}
          >
            {getTirmiziVolume(volumeNumber).urduTitle}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: isCurrent ? '#e879f9' : 'var(--text-muted)',
              }}
            >
              الصفحة {printedPageNumber} من {printedTotal}
            </span>
            {onTogglePageRotation && (
              <button
                type="button"
                className="btn-icon btn-icon-xs"
                onClick={onTogglePageRotation}
                title={`Rotate Page ${pageNumber}`}
                aria-label={`Rotate Page ${pageNumber}`}
                style={{
                  width: 22,
                  height: 22,
                  color: rotationOverride !== 0 ? '#c026d3' : 'var(--text-muted)',
                  backgroundColor: 'transparent',
                }}
              >
                <RotateCw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Complete Book Page Container (Natural Aspect Ratio: 700 / 1020) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            position: 'relative',
            minHeight: '260px',
            aspectRatio: '700 / 1020',
            boxSizing: 'border-box',
          }}
        >
          {!useFallbackCanvas ? (
            <img
              src={imageUrl}
              alt={`جامع الترمذي - الصفحة ${pageNumber}`}
              loading={isCurrent ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={isCurrent ? 'high' : 'auto'}
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
                transform: rotationOverride ? `rotate(${rotationOverride}deg)` : undefined,
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
                  border: '3px solid rgba(192, 38, 211, 0.2)',
                  borderTopColor: '#c026d3',
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
TirmiziPageCard.displayName = 'TirmiziPageCard';
