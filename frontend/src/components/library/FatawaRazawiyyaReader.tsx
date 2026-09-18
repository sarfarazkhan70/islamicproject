// ============================================================================
// FATAWA-E-RAZVIYA READER: Authentic 31-Volume High-Performance Reading Experience
// تصنيف: إمام أهل السنة المجدد أحمد رضا خان القادري البريلوی قدس سره (۱۲۷۲ - ۱۳۴۰ هـ)
// ============================================================================

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
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import {
  getFatawaVolume,
  getFatawaPrintedPage,
  getFatawaPdfPage,
  FATAWA_RAZAWIYYA_VOLUMES,
} from '../../data/fatawaRazawiyyaData';
import { FatawaRazawiyyaPdfService } from '../../services/fatawaRazawiyyaPdfService';
import { ReadingProgressService } from '../../services/readingProgressService';
import { useBookReadingProgress } from '../../hooks/useBookReadingProgress';

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

// Module-level session state to preserve explicitly chosen zoom across page changes
let sessionFatawaZoomLevel: number | null = null;
let sessionFatawaFitWidth: boolean | null = null;

export const FatawaRazawiyyaReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const volParam = searchParams.get('vol') || '1.1';
  const fatawaVolume = getFatawaVolume(volParam);
  const volKey = fatawaVolume.volumeKey;
  const totalPages = fatawaVolume.totalPages;
  const totalPrintedPages = fatawaVolume.totalPrintedPages;

  const pageParam = searchParams.get('page');
  const initialPrintedPage = pageParam
    ? Math.max(1, Math.min(totalPrintedPages, parseInt(pageParam, 10) || 1))
    : ReadingProgressService.getInitialPage('fatawa-razawiyya', volKey, null, 1);
  const initialPdfPage = getFatawaPdfPage(volKey, initialPrintedPage);

  const [currentPdfPage, setCurrentPdfPage] = useState<number>(initialPdfPage);
  const [currentPrintedPage, setCurrentPrintedPage] = useState<number>(initialPrintedPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPrintedPage.toString());
  const [zoomLevel, setZoomLevel] = useState<number>(() => sessionFatawaZoomLevel ?? 1.0);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(() => sessionFatawaFitWidth ?? true);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState<boolean>(false);
  const [isVolMenuOpen, setIsVolMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [globalRotation, setGlobalRotation] = useState<number>(0);
  const [pageCustomRotations, setPageCustomRotations] = useState<Record<number, number>>({});

  // Auto-save reading progress for Fatawa Jild X
  useBookReadingProgress({
    bookId: 'fatawa-razawiyya',
    volumeKey: volKey,
    currentPage: currentPrintedPage,
    totalPages: totalPrintedPages,
  });

  const activePdfPageRef = useRef<number>(initialPdfPage);
  const activePrintedPageRef = useRef<number>(initialPrintedPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomMenuRef = useRef<HTMLDivElement | null>(null);
  const volMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync direct input box with current printed page
  useEffect(() => {
    setDirectPageInput(currentPrintedPage.toString());
  }, [currentPrintedPage]);

  // Maintain currently visible page position after zoom adjustment
  const maintainCurrentPagePosition = useCallback(
    (targetPdfPageNum: number) => {
      requestAnimationFrame(() => {
        const el = document.getElementById(`fatawa-page-${targetPdfPageNum}`);
        if (el) {
          const headerOffset = isFullscreen ? 55 : 130;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'instant' as ScrollBehavior });
        }
      });
    },
    [isFullscreen]
  );

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(event.target as Node)) {
        setIsZoomMenuOpen(false);
      }
      if (volMenuRef.current && !volMenuRef.current.contains(event.target as Node)) {
        setIsVolMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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

  // Update URL search params when page or volume changes
  const updateUrlParams = useCallback(
    (newPrintedPage: number, newVolKey: string = volKey) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set('vol', newVolKey);
          params.set('page', newPrintedPage.toString());
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams, volKey]
  );

  // Direct page navigation with accurate printed book to PDF scan mapping
  const handlePageJump = useCallback(
    (targetPrintedPage: number) => {
      const validPrinted = Math.max(1, Math.min(totalPrintedPages, targetPrintedPage));
      const targetPdf = getFatawaPdfPage(volKey, validPrinted);

      isProgrammaticScrollRef.current = true;
      activePdfPageRef.current = targetPdf;
      activePrintedPageRef.current = validPrinted;
      setCurrentPdfPage(targetPdf);
      setCurrentPrintedPage(validPrinted);
      updateUrlParams(validPrinted);

      const targetEl = document.getElementById(`fatawa-page-${targetPdf}`);
      if (targetEl) {
        const headerOffset = isFullscreen ? 55 : 130;
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 700);
    },
    [totalPrintedPages, volKey, isFullscreen, updateUrlParams]
  );

  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(directPageInput.trim(), 10);
    if (!isNaN(parsed)) {
      handlePageJump(parsed);
    } else {
      setDirectPageInput(currentPrintedPage.toString());
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setIsFitWidth(false);
    sessionFatawaFitWidth = false;
    const nextScale = ZOOM_PERCENTAGES.find((p) => p > zoomLevel + 0.02) ?? 2.5;
    setZoomLevel(nextScale);
    sessionFatawaZoomLevel = nextScale;
    maintainCurrentPagePosition(currentPdfPage);
  };

  const handleZoomOut = () => {
    setIsFitWidth(false);
    sessionFatawaFitWidth = false;
    const prevScale = [...ZOOM_PERCENTAGES].reverse().find((p) => p < zoomLevel - 0.02) ?? 0.5;
    setZoomLevel(prevScale);
    sessionFatawaZoomLevel = prevScale;
    maintainCurrentPagePosition(currentPdfPage);
  };

  const handleSelectZoomOption = (option: ZoomOption) => {
    setIsZoomMenuOpen(false);
    if (option.isSpecial === 'fit-width') {
      setIsFitWidth(true);
      sessionFatawaFitWidth = true;
      setZoomLevel(1.0);
      sessionFatawaZoomLevel = 1.0;
    } else if (option.isSpecial === 'reset-default') {
      setIsFitWidth(true);
      sessionFatawaFitWidth = true;
      setZoomLevel(1.0);
      sessionFatawaZoomLevel = 1.0;
      setGlobalRotation(0);
      setPageCustomRotations({});
    } else if (option.scale) {
      setIsFitWidth(false);
      sessionFatawaFitWidth = false;
      setZoomLevel(option.scale);
      sessionFatawaZoomLevel = option.scale;
    }
    maintainCurrentPagePosition(currentPdfPage);
  };

  // Rotation controls
  const handleRotateGlobalCw = () => {
    setGlobalRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateGlobalCcw = () => {
    setGlobalRotation((prev) => (prev + 270) % 360);
  };

  const handleTogglePageRotation = useCallback((pdfNum: number) => {
    setPageCustomRotations((prev) => ({
      ...prev,
      [pdfNum]: ((prev[pdfNum] || 0) + 90) % 360,
    }));
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Switch volume
  const handleSelectVolume = (newVolKey: string) => {
    setIsVolMenuOpen(false);
    if (newVolKey === volKey) return;
    setSearchParams({ vol: newVolKey, page: '1' });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  // IntersectionObserver to track visible page without jumping scroll
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isProgrammaticScrollRef.current) return;

      let bestEntry: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        }
      }

      if (bestEntry && bestEntry.target) {
        const pageId = bestEntry.target.getAttribute('data-pdf-page');
        if (pageId) {
          const pdfNum = parseInt(pageId, 10);
          if (!isNaN(pdfNum) && pdfNum !== activePdfPageRef.current) {
            activePdfPageRef.current = pdfNum;
            const printedNum = getFatawaPrintedPage(volKey, pdfNum);
            activePrintedPageRef.current = printedNum;
            setCurrentPdfPage(pdfNum);
            setCurrentPrintedPage(printedNum);
            updateUrlParams(printedNum);
          }
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-10% 0px -40% 0px',
      threshold: [0.1, 0.3, 0.6, 0.9],
    });

    const pageElements = document.querySelectorAll('.fatawa-page-card');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [volKey, totalPages, updateUrlParams]);

  // Generate array of page indices 1..N for rendering
  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div className={`fatawa-reader-page ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <style>{`
        .fatawa-reader-page {
          min-height: 100vh;
          background-color: #0b0f19;
          color: #f1f5f9;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .fatawa-reader-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(15, 23, 42, 0.96);
          border-bottom: 1.5px solid rgba(245, 158, 11, 0.35);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          padding: 8px 14px;
        }
        .fatawa-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .fatawa-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fatawa-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .fatawa-vol-badge-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: var(--radius-md, 8px);
          color: #f59e0b;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .fatawa-vol-badge-btn:hover {
          background: rgba(245, 158, 11, 0.25);
        }
        .fatawa-vol-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 6px;
          background: #0f172a;
          border: 1.5px solid rgba(245, 158, 11, 0.4);
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
          max-height: 420px;
          overflow-y: auto;
          z-index: 100;
          min-width: 280px;
          padding: 6px;
        }
        .fatawa-vol-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: var(--radius-md, 6px);
          color: #e2e8f0;
          cursor: pointer;
          font-size: 0.84rem;
          transition: background 0.15s;
        }
        .fatawa-vol-option:hover {
          background: rgba(245, 158, 11, 0.18);
          color: #f59e0b;
        }
        .fatawa-vol-option.active {
          background: rgba(245, 158, 11, 0.25);
          color: #f59e0b;
          font-weight: 700;
        }
        .fatawa-page-input-form {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-md, 8px);
          padding: 2px 6px;
        }
        .fatawa-page-input {
          width: 48px;
          height: 28px;
          background: transparent;
          border: none;
          color: #f59e0b;
          font-weight: 700;
          font-size: 0.88rem;
          text-align: center;
          outline: none;
        }
        .fatawa-reader-body {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 20px 10px 60px;
        }
        .fatawa-pages-feed {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        .fatawa-page-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          background-color: #ffffff;
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .fatawa-page-card.is-active {
          border: 2px solid #f59e0b !important;
          box-shadow: 0 10px 30px rgba(245, 158, 11, 0.25), 0 0 1px rgba(0,0,0,0.5);
        }
        .fatawa-page-banner {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px;
          background: #1e293b;
          border-bottom: 1px solid rgba(245, 158, 11, 0.25);
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 600;
          box-sizing: border-box;
        }
        .fatawa-page-banner.is-active {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
      `}</style>

      {/* Reader Sticky Header */}
      <header className="fatawa-reader-header">
        <div className="fatawa-header-inner">
          {/* Left: Back button to 31-volume selection page & Volume Selector */}
          <div className="fatawa-header-left">
            <button
              type="button"
              className="btn-icon"
              onClick={() => navigate('/library/fatawa-razawiyya')}
              title="Back to Fatawa-e-Razviya Volumes"
              aria-label="Back to Fatawa-e-Razviya Volumes"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                borderRadius: 'var(--radius-md, 8px)',
              }}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Active Volume Dropdown */}
            <div style={{ position: 'relative' }} ref={volMenuRef}>
              <button
                type="button"
                className="fatawa-vol-badge-btn"
                onClick={() => setIsVolMenuOpen(!isVolMenuOpen)}
                title="Select Fatawa-e-Razviya Volume"
              >
                <BookOpen size={15} />
                <span>Fatawa-e-Razviya – {fatawaVolume.displayTitle}</span>
                <ChevronDown size={14} />
              </button>

              {isVolMenuOpen && (
                <div className="fatawa-vol-dropdown">
                  {FATAWA_RAZAWIYYA_VOLUMES.map((v) => (
                    <div
                      key={v.volumeKey}
                      className={`fatawa-vol-option ${v.volumeKey === volKey ? 'active' : ''}`}
                      onClick={() => handleSelectVolume(v.volumeKey)}
                    >
                      <span>{v.title}</span>
                      <span className="font-urdu" style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                        {v.displayTitle}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Page jump, Zoom dropdown, Rotate & Fullscreen */}
          <div className="fatawa-header-right">
            {/* Page Jump input form with clearly visible "Page No." */}
            <form onSubmit={handleDirectPageSubmit} className="fatawa-page-input-form">
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', paddingLeft: 4, fontWeight: 600, whiteSpace: 'nowrap' }}>
                Page No.
              </span>
              <input
                type="text"
                className="fatawa-page-input"
                value={directPageInput}
                onChange={(e) => setDirectPageInput(e.target.value)}
                title="Enter printed page number"
                aria-label="Enter printed page number"
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b', paddingRight: 4, whiteSpace: 'nowrap' }}>
                / {totalPrintedPages}
              </span>
              <button
                type="submit"
                className="btn-icon btn-icon-sm"
                style={{ color: '#f59e0b', background: 'transparent' }}
                title="Jump to page"
                aria-label="Jump to page"
              >
                <Search size={14} />
              </button>
            </form>

            {/* Zoom Out Button */}
            <button
              type="button"
              className="btn-icon"
              onClick={handleZoomOut}
              title="Zoom out"
              style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              <ZoomOut size={16} />
            </button>

            {/* Zoom Selector Dropdown */}
            <div style={{ position: 'relative' }} ref={zoomMenuRef}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
                style={{
                  minWidth: 54,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#f59e0b',
                  background: 'rgba(245, 158, 11, 0.12)',
                  borderRadius: 'var(--radius-md, 8px)',
                }}
                title="Zoom options"
              >
                {isFitWidth ? 'Fit' : `${Math.round(zoomLevel * 100)}%`}
              </button>

              {isZoomMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    background: '#0f172a',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md, 8px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    padding: 4,
                    zIndex: 100,
                    minWidth: 140,
                  }}
                >
                  {ZOOM_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectZoomOption(opt)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        borderRadius: 4,
                        color:
                          (opt.isSpecial === 'fit-width' && isFitWidth) ||
                          (!isFitWidth && opt.scale === zoomLevel)
                            ? '#f59e0b'
                            : '#e2e8f0',
                        fontWeight:
                          (opt.isSpecial === 'fit-width' && isFitWidth) ||
                          (!isFitWidth && opt.scale === zoomLevel)
                            ? 700
                            : 400,
                        backgroundColor:
                          (opt.isSpecial === 'fit-width' && isFitWidth) ||
                          (!isFitWidth && opt.scale === zoomLevel)
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'transparent',
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Zoom In Button */}
            <button
              type="button"
              className="btn-icon"
              onClick={handleZoomIn}
              title="Zoom in"
              style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              <ZoomIn size={16} />
            </button>

            {/* Rotation Controls */}
            <button
              type="button"
              className="btn-icon"
              onClick={handleRotateGlobalCcw}
              title="Rotate 90° Counter-Clockwise"
              style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              className="btn-icon"
              onClick={handleRotateGlobalCw}
              title="Rotate 90° Clockwise"
              style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              <RotateCw size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              className="btn-icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
              style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Pages Vertical Feed */}
      <main className="fatawa-reader-body">
        <div
          className="fatawa-pages-feed"
          style={{
            width: isFitWidth ? '100%' : `${Math.round(820 * zoomLevel)}px`,
            maxWidth: isFitWidth ? '820px' : zoomLevel <= 1.0 ? `${Math.round(820 * zoomLevel)}px` : 'none',
          }}
        >
          {pageNumbers.map((pdfPage) => {
            const printedPage = getFatawaPrintedPage(volKey, pdfPage);
            const customRot = pageCustomRotations[pdfPage] || 0;
            const effectiveRot = (globalRotation + customRot) % 360;
            const isCurrent = pdfPage === currentPdfPage;

            return (
              <FatawaPageItem
                key={`${volKey}_${pdfPage}`}
                pdfPage={pdfPage}
                printedPage={printedPage}
                totalPrintedPages={totalPrintedPages}
                volumeKey={volKey}
                rotation={effectiveRot}
                isCurrent={isCurrent}
                onTogglePageRotation={() => handleTogglePageRotation(pdfPage)}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// MEMOIZED HIGH-PERFORMANCE INDIVIDUAL PAGE ITEM
// ============================================================================
interface FatawaPageItemProps {
  pdfPage: number;
  printedPage: number;
  totalPrintedPages: number;
  volumeKey: string;
  rotation: number;
  isCurrent: boolean;
  onTogglePageRotation?: () => void;
}

const FatawaPageItem: React.FC<FatawaPageItemProps> = memo(
  ({ pdfPage, printedPage, totalPrintedPages, volumeKey, rotation, isCurrent, onTogglePageRotation }) => {
    const [imgLoaded, setImgLoaded] = useState<boolean>(false);
    const [imgError, setImgError] = useState<boolean>(false);
    const [useFallbackCanvas, setUseFallbackCanvas] = useState<boolean>(false);
    const [canvasRendered, setCanvasRendered] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const imageUrl = FatawaRazawiyyaPdfService.getPageImageUrl(pdfPage, volumeKey);

    // Direct High-DPI canvas rendering for on-demand PDF page rendering when image is not yet cached on disk
    useEffect(() => {
      if (!useFallbackCanvas) return;
      let isCancelled = false;

      const renderCanvas = async () => {
        try {
          if (canvasRef.current) {
            await FatawaRazawiyyaPdfService.renderPageToCanvas(
              pdfPage,
              canvasRef.current,
              1.5,
              undefined,
              0, // Canvas rendered at base upright orientation; CSS transform handles user rotation consistently
              volumeKey
            );
            if (!isCancelled) {
              setCanvasRendered(true);
            }
          }
        } catch (err) {
          console.error(`Canvas render failed for Fatawa Vol ${volumeKey} page ${pdfPage}:`, err);
        }
      };

      renderCanvas();
      return () => {
        isCancelled = true;
      };
    }, [useFallbackCanvas, pdfPage, volumeKey]);

    return (
      <article
        id={`fatawa-page-${pdfPage}`}
        data-pdf-page={pdfPage}
        data-printed-page={printedPage}
        className={`fatawa-page-card card ${isCurrent ? 'is-active' : ''}`}
        style={{
          border: isCurrent
            ? '2px solid #f59e0b'
            : '2px solid var(--border-default)',
        }}
      >
        {/* Subtle Page Top Banner */}
        <div className={`fatawa-page-banner ${isCurrent ? 'is-active' : ''}`}>
          <span
            className="font-urdu"
            style={{
              fontSize: '0.85rem',
              color: isCurrent ? '#f59e0b' : '#cbd5e1',
              direction: 'rtl',
            }}
          >
            فتاویٰ رضویہ — جلد {volumeKey}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: isCurrent ? '#f59e0b' : '#94a3b8',
                fontSize: '0.78rem',
              }}
            >
              صفحہ {printedPage} از {totalPrintedPages}
            </span>
            {onTogglePageRotation && (
              <button
                type="button"
                className="btn-icon btn-icon-xs"
                onClick={onTogglePageRotation}
                title={`Rotate Page ${pdfPage}`}
                aria-label={`Rotate Page ${pdfPage}`}
                style={{
                  width: 22,
                  height: 22,
                  color: rotation !== 0 ? '#f59e0b' : '#94a3b8',
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
          {!imgError ? (
            <img
              src={imageUrl}
              alt={`Fatawa-e-Razviya Page ${printedPage}`}
              loading={isCurrent ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={isCurrent ? 'high' : 'auto'}
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setUseFallbackCanvas(true);
              }}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: imgLoaded ? 1 : 0.9,
                transform: rotation ? `rotate(${rotation}deg)` : undefined,
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
                transform: rotation ? `rotate(${rotation}deg)` : undefined,
              }}
            />
          )}

          {/* Loading Skeleton */}
          {((!imgError && !imgLoaded) || (imgError && !canvasRendered)) && (
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
                  border: '3px solid rgba(245, 158, 11, 0.2)',
                  borderTopColor: '#f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span
                className="font-urdu text-xs"
                style={{ color: '#64748b', direction: 'rtl' }}
              >
                جاری لوڈنگ صفحہ {printedPage}...
              </span>
            </div>
          )}
        </div>
      </article>
    );
  }
);

FatawaPageItem.displayName = 'FatawaPageItem';
