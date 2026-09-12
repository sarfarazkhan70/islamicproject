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
  List,
  X,
  BookOpen,
  Check,
} from 'lucide-react';
import {
  HADAIQ_HINDI_PRINTED_TOTAL_PAGES,
  HADAIQ_HINDI_PRINTED_PAGES,
  HADAIQ_HINDI_KALAMS_INDEX,
  HadaiqHindiKalamItem,
} from '../../data/hadaiqHindiData';
import { HadaiqHindiPdfService } from '../../services/hadaiqHindiPdfService';

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

export const HadaiqHindiReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPrintedPages = HADAIQ_HINDI_PRINTED_TOTAL_PAGES; // 490 physical printed pages

  const pageParam = searchParams.get('page');
  const initialPage = pageParam
    ? Math.max(1, Math.min(totalPrintedPages, parseInt(pageParam, 10) || 1))
    : 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPage.toString());
  const [zoomLevel, setZoomLevel] = useState<number>(1.25); // Default: 125% clear reading
  const [isFitWidth, setIsFitWidth] = useState<boolean>(false);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [indexSearch, setIndexSearch] = useState<string>('');

  const activePageRef = useRef<number>(currentPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync direct input box with current printed page
  useEffect(() => {
    setDirectPageInput(currentPage.toString());
  }, [currentPage]);

  // Maintain currently visible page position after zoom adjustment
  const maintainCurrentPagePosition = useCallback((targetPage: number) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`hadaiq-hindi-page-${targetPage}`);
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

  // Scroll to a specific Hadaiq Hindi physical printed page
  const scrollToPage = useCallback(
    (printedPageNum: number, behavior: ScrollBehavior = 'auto') => {
      const clamped = Math.max(1, Math.min(totalPrintedPages, printedPageNum));
      setCurrentPage(clamped);
      activePageRef.current = clamped;
      isProgrammaticScrollRef.current = true;
      setSearchParams({ page: clamped.toString() });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const performScroll = () => {
        const el = document.getElementById(`hadaiq-hindi-page-${clamped}`);
        if (el) {
          const headerOffset = isFullscreen ? 55 : 130;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top: Math.max(0, y), behavior });
        }
      };

      performScroll();
      requestAnimationFrame(performScroll);

      const lockDuration = behavior === 'smooth' ? 1200 : 350;
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, lockDuration);
    },
    [totalPrintedPages, isFullscreen, setSearchParams]
  );

  // Initial scroll if URL specified a page > 1
  useEffect(() => {
    if (initialPage > 1) {
      const timer = setTimeout(() => {
        scrollToPage(initialPage, 'auto');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialPage, scrollToPage]);

  // Handle URL param changes (e.g. browser back/forward)
  useEffect(() => {
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPrintedPages && p !== activePageRef.current) {
        scrollToPage(p, 'auto');
      }
    }
  }, [pageParam, totalPrintedPages, scrollToPage]);

  // Track currently visible printed page during vertical scrolling
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
          const pageAttr = activeEntry.target.getAttribute('data-printed-page');
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

    const pageElements = document.querySelectorAll('.hadaiq-hindi-page-card');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isFullscreen, totalPrintedPages]);

  // Handle direct printed page jump form submission
  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = directPageInput.trim();
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setDirectPageInput(currentPage.toString());
      return;
    }
    const clamped = Math.max(1, Math.min(totalPrintedPages, parsed));
    setDirectPageInput(clamped.toString());
    scrollToPage(clamped, 'auto');
  };

  const handleDirectPageBlur = () => {
    const raw = directPageInput.trim();
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setDirectPageInput(currentPage.toString());
    } else {
      const clamped = Math.max(1, Math.min(totalPrintedPages, parsed));
      setDirectPageInput(clamped.toString());
    }
  };

  const handleSelectZoomOption = (opt: ZoomOption) => {
    const currentP = activePageRef.current;
    if (opt.isSpecial === 'fit-width') {
      setIsFitWidth(true);
      setZoomLevel(1.0);
    } else if (opt.isSpecial === 'reset-default') {
      setIsFitWidth(false);
      setZoomLevel(1.25);
    } else if (opt.scale !== undefined) {
      setIsFitWidth(false);
      setZoomLevel(opt.scale);
    }
    setIsZoomMenuOpen(false);
    maintainCurrentPagePosition(currentP);
  };

  const handleZoomIn = () => {
    const currentP = activePageRef.current;
    setIsFitWidth(false);
    setZoomLevel((prev) => {
      const next = ZOOM_PERCENTAGES.find((p) => p > prev + 0.02);
      return next ? next : Math.min(2.5, +(prev + 0.15).toFixed(2));
    });
    maintainCurrentPagePosition(currentP);
  };

  const handleZoomOut = () => {
    const currentP = activePageRef.current;
    setIsFitWidth(false);
    setZoomLevel((prev) => {
      const prevArr = [...ZOOM_PERCENTAGES].reverse();
      const prevMatch = prevArr.find((p) => p < prev - 0.02);
      return prevMatch ? prevMatch : Math.max(0.5, +(prev - 0.15).toFixed(2));
    });
    maintainCurrentPagePosition(currentP);
  };

  const handleResetZoom = () => {
    const currentP = activePageRef.current;
    setIsFitWidth(false);
    setZoomLevel(1.25);
    setIsZoomMenuOpen(false);
    maintainCurrentPagePosition(currentP);
  };

  // Filtered Kalams for Index Drawer
  const filteredKalams = HADAIQ_HINDI_KALAMS_INDEX.filter(
    (k) =>
      k.titleHindi.toLowerCase().includes(indexSearch.toLowerCase()) ||
      k.titleUrdu.toLowerCase().includes(indexSearch.toLowerCase()) ||
      k.categoryHindi.toLowerCase().includes(indexSearch.toLowerCase()) ||
      k.categoryUrdu.toLowerCase().includes(indexSearch.toLowerCase()) ||
      k.printedPage.toString().includes(indexSearch.trim())
  );

  // Responsive page container max-width based on desktop zoom scale
  const pageContainerMaxWidth = isFitWidth
    ? '100%'
    : `${Math.min(1400, Math.max(340, Math.round(820 * zoomLevel)))}px`;

  return (
    <div
      className={`hadaiq-reader-page-root ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        maxWidth: isFullscreen ? '100%' : pageContainerMaxWidth,
      }}
    >
      <style>{`
        .hadaiq-reader-page-root {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
          padding: 0 0 var(--space-12) 0;
          position: relative;
        }

        .hadaiq-reader-page-root.fullscreen-mode {
          padding: var(--space-2);
          max-width: 100%;
        }

        .hadaiq-top-toolbar {
          position: sticky;
          top: 64px;
          z-index: 40;
          width: 100%;
          box-sizing: border-box;
          padding: 8px 14px;
          margin-bottom: var(--space-4);
          background-color: rgba(15, 23, 42, 0.98);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px 12px;
          flex-wrap: wrap;
          overflow: visible !important;
        }

        .hadaiq-reader-page-root.fullscreen-mode .hadaiq-top-toolbar {
          top: 0px;
          border-radius: 0;
        }

        .hadaiq-toolbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          min-width: 0;
        }

        .hadaiq-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          height: 36px;
          font-size: 0.82rem;
          border-radius: var(--radius-md);
          box-sizing: border-box;
        }

        .hadaiq-toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          overflow: visible !important;
        }

        .hadaiq-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 36px;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: var(--radius-md);
          border: 1px solid rgba(245, 158, 11, 0.4);
          background-color: rgba(245, 158, 11, 0.12);
          color: var(--brand-gold);
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .hadaiq-action-btn:hover {
          background-color: rgba(245, 158, 11, 0.22);
        }

        .hadaiq-page-search-form {
          display: flex;
          align-items: center;
          height: 36px;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 2px 4px 2px 10px;
          gap: 6px;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .hadaiq-page-search-form:focus-within {
          border-color: rgba(245, 158, 11, 0.6);
          box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.25);
        }

        .hadaiq-page-search-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .hadaiq-page-input {
          width: 52px;
          height: 28px;
          padding: 0 4px;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: var(--font-mono);
          text-align: center;
          background-color: rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: 4px;
          color: #ffffff;
          outline: none;
          box-sizing: border-box;
        }

        .hadaiq-page-input:focus {
          border-color: var(--brand-gold);
        }

        .hadaiq-page-total {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-weight: 500;
          flex-shrink: 0;
        }

        .hadaiq-search-go-btn {
          width: 28px;
          height: 28px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: var(--brand-gold);
          color: #000000;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .hadaiq-search-go-btn:hover {
          background-color: #fbbf24;
          transform: translateY(-0.5px);
        }

        .hadaiq-icon-btn {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .hadaiq-icon-btn:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.1);
          border-color: var(--border-default);
        }

        @media (max-width: 780px) {
          .hadaiq-top-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 10px 12px;
          }
          .hadaiq-toolbar-left {
            justify-content: space-between;
            width: 100%;
          }
          .hadaiq-toolbar-right {
            justify-content: space-between;
            width: 100%;
            gap: 6px;
          }
        }

        @media (max-width: 540px) {
          .hadaiq-toolbar-right {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .hadaiq-page-search-form {
            flex: 1;
            min-width: 150px;
            justify-content: space-between;
          }
          .hadaiq-page-input {
            width: 44px;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* CLEAN RESPONSIVE STICKY TOOLBAR (MATCHED WITH CONTAINER WIDTH)            */}
      {/* ========================================================================= */}
      <header className="card hadaiq-top-toolbar">
        {/* Section 1: Back to Library & Fehrist */}
        <div className="hadaiq-toolbar-left">
          <button
            type="button"
            className="btn btn-sm btn-ghost hadaiq-back-btn"
            onClick={() => navigate('/library')}
            title="Back to Islamic Library"
          >
            <ArrowLeft size={16} />
            <span>Library</span>
          </button>

          {/* Index / Fehrist Button */}
          <button
            type="button"
            className="hadaiq-action-btn"
            onClick={() => setIsIndexOpen(!isIndexOpen)}
            title="Fehrist (Kalam Index)"
            aria-label="Fehrist"
          >
            <List size={15} />
            <span>Fehrist</span>
          </button>
        </div>

        {/* Section 2: Zoom Controls & Printed Page Selector */}
        <div className="hadaiq-toolbar-right">
          {/* Single Clean Zoom Button with Dropdown Menu */}
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
                  ? '1px solid var(--brand-gold)'
                  : '1px solid var(--border-default)',
                backgroundColor: isZoomMenuOpen
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'var(--bg-surface)',
                color: isZoomMenuOpen ? 'var(--brand-gold)' : 'var(--text-primary)',
              }}
            >
              <ZoomIn size={15} />
              <span style={{ fontWeight: 600 }}>Zoom</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  color: isFitWidth || zoomLevel !== 1.0 ? 'var(--brand-gold)' : 'var(--text-secondary)',
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
                      color: 'var(--brand-gold)',
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
                          borderColor: isSelected ? 'var(--brand-gold)' : undefined,
                          color: isSelected ? '#000' : undefined,
                          backgroundColor: isSelected ? 'var(--brand-gold)' : undefined,
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
                      borderColor: isFitWidth ? 'var(--brand-gold)' : undefined,
                      color: isFitWidth ? '#000' : undefined,
                      backgroundColor: isFitWidth ? 'var(--brand-gold)' : undefined,
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
                      color: 'var(--text-secondary)',
                    }}
                    title="Reset to default 125% zoom"
                  >
                    <RotateCcw size={12} />
                    <span>Reset to Default</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Exact Printed Page Jump & Search Form */}
          <form onSubmit={handleDirectPageSubmit} className="hadaiq-page-search-form">
            <span className="hadaiq-page-search-label">Page No.</span>
            <input
              type="number"
              min={1}
              max={totalPrintedPages}
              value={directPageInput}
              onChange={(e) => setDirectPageInput(e.target.value)}
              onBlur={handleDirectPageBlur}
              className="hadaiq-page-input"
              aria-label={`Enter Hadaiq Hindi printed page number (1 to ${totalPrintedPages})`}
            />

            <span className="hadaiq-page-total">
              / {totalPrintedPages}
            </span>

            <button
              type="submit"
              className="hadaiq-search-go-btn"
              title="Go to Page"
              aria-label="Go to Page"
            >
              <Search size={13} />
            </button>
          </form>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="hadaiq-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen / Theater Reading'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* NAAT & KALAM FEHRIST DRAWER (MODAL OVERLAY)                               */}
      {/* ========================================================================= */}
      {isIndexOpen && (
        <div
          className="hadaiq-fehrist-overlay"
          onClick={() => setIsIndexOpen(false)}
        >
          <div
            className="hadaiq-fehrist-modal card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen size={18} style={{ color: 'var(--brand-gold)' }} />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    color: 'var(--brand-gold)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>Fehrist</span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans), 'Noto Sans Devanagari', sans-serif",
                      fontSize: '1.05rem',
                      fontWeight: 'normal',
                      opacity: 0.9,
                    }}
                  >
                    (फ़ेहरिस्ते कलाम)
                  </span>
                </h3>
              </div>
              <button
                type="button"
                className="btn-icon btn-icon-sm"
                onClick={() => setIsIndexOpen(false)}
                title="Close Fehrist"
                aria-label="Close Fehrist"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Filter Input */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: 'var(--bg-surface-elevated, rgba(0, 0, 0, 0.3))',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Name search"
                  value={indexSearch}
                  onChange={(e) => setIndexSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.5,
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* List of Indexed Kalams */}
            <div className="hadaiq-fehrist-list">
              {filteredKalams.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                  }}
                >
                  कोई कलाम नहीं मिला — कृपया दूसरा शब्द खोजें।
                </div>
              ) : (
                filteredKalams.map((kalam: HadaiqHindiKalamItem) => {
                  return (
                    <button
                      key={kalam.id}
                      type="button"
                      onClick={() => {
                        scrollToPage(kalam.printedPage, 'smooth');
                        setIsIndexOpen(false);
                      }}
                      className="hadaiq-fehrist-item card-hover"
                    >
                      {/* Hindi Content */}
                      <div className="hadaiq-fehrist-content">
                        <span
                          className="hadaiq-fehrist-tag"
                          style={{
                            backgroundColor:
                              kalam.category === 'salam'
                                ? 'rgba(245, 158, 11, 0.22)'
                                : 'rgba(16, 185, 129, 0.18)',
                            color:
                              kalam.category === 'salam'
                                ? 'var(--brand-gold)'
                                : 'var(--brand-primary)',
                            border:
                              kalam.category === 'salam'
                                ? '1px solid rgba(245, 158, 11, 0.35)'
                                : '1px solid rgba(16, 185, 129, 0.35)',
                          }}
                        >
                          {kalam.categoryHindi}
                        </span>

                        <span
                          className="hadaiq-fehrist-title"
                          style={{
                            direction: 'ltr',
                            textAlign: 'left',
                            fontFamily: "var(--font-sans), 'Noto Sans Devanagari', sans-serif",
                          }}
                        >
                          {kalam.titleHindi}
                        </span>
                      </div>

                      {/* Printed Page Number badge on opposite side */}
                      <div className="hadaiq-fehrist-page-badge">
                        Page {kalam.printedPage}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERTICAL CONTINUOUS SCROLL STREAM (ALL 490 PRINTED PAGES VIA HIGH-DPI)     */}
      {/* ========================================================================= */}
      <main
        className="hadaiq-vertical-reading-stream"
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
        {HADAIQ_HINDI_PRINTED_PAGES.map(({ printedPage, pdfPage }) => (
          <HadaiqHindiPageCard
            key={printedPage}
            printedPageNumber={printedPage}
            pdfPageNumber={pdfPage}
            totalPrintedPages={totalPrintedPages}
            maxWidth={pageContainerMaxWidth}
            isCurrent={printedPage === currentPage}
            initialPage={initialPage}
            scale={zoomLevel}
          />
        ))}
      </main>
    </div>
  );
};

// ============================================================================
// SINGLE HADAIQ HINDI PAGE CARD COMPONENT (HIGH-DPI AUTHENTIC BOOK RENDERING)
// ============================================================================
interface HadaiqHindiPageCardProps {
  printedPageNumber: number;
  pdfPageNumber: number;
  totalPrintedPages: number;
  maxWidth: string;
  isCurrent: boolean;
  initialPage: number;
  scale: number;
}

const HadaiqHindiPageCard: React.FC<HadaiqHindiPageCardProps> = memo(
  ({
    printedPageNumber,
    pdfPageNumber,
    totalPrintedPages,
    maxWidth,
    isCurrent,
    initialPage,
    scale,
  }) => {
    const isNearbyInitial = Math.abs(printedPageNumber - initialPage) <= 2;
    const [shouldRender, setShouldRender] = useState<boolean>(isNearbyInitial);
    const [canvasRendered, setCanvasRendered] = useState<boolean>(false);
    const [renderError, setRenderError] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Intersection observer to trigger rendering when page is in or near viewport
    useEffect(() => {
      if (shouldRender) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setShouldRender(true);
              observer.disconnect();
              break;
            }
          }
        },
        {
          root: null,
          rootMargin: '600px 0px', // Proactively render 600px ahead
          threshold: 0.01,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [shouldRender]);

    // Live canvas rendering via PDF.js with concurrency queue
    useEffect(() => {
      if (!shouldRender || !canvasRef.current) return;

      let isCancelled = false;
      const render = async () => {
        try {
          if (canvasRef.current) {
            await HadaiqHindiPdfService.renderPageToCanvas(
              pdfPageNumber,
              canvasRef.current,
              scale
            );
            if (!isCancelled) {
              setCanvasRendered(true);
              setRenderError(false);
            }
          }
        } catch (err) {
          if (!isCancelled) {
            console.error(
              `Canvas render failed for Hadaiq Hindi printed page ${printedPageNumber} (PDF ${pdfPageNumber}):`,
              err
            );
            setRenderError(true);
          }
        }
      };

      render();
      return () => {
        isCancelled = true;
      };
    }, [shouldRender, pdfPageNumber, printedPageNumber, scale]);

    return (
      <article
        ref={containerRef}
        id={`hadaiq-hindi-page-${printedPageNumber}`}
        data-printed-page={printedPageNumber}
        className="hadaiq-hindi-page-card card"
        style={{
          width: '100%',
          maxWidth,
          margin: '0 auto',
          padding: 0,
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: isCurrent
            ? '0 10px 30px rgba(245, 158, 11, 0.3), 0 0 1px rgba(0,0,0,0.5)'
            : '0 4px 18px rgba(0, 0, 0, 0.25)',
          border: isCurrent
            ? '2px solid var(--brand-gold)'
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
        {/* Subtle Page Top Banner with Accurate Printed Page Number */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            backgroundColor: isCurrent
              ? 'rgba(245, 158, 11, 0.15)'
              : 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: isCurrent ? 'var(--brand-gold)' : 'var(--text-secondary)',
            fontWeight: 600,
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              color: isCurrent ? 'var(--brand-gold)' : 'var(--text-primary)',
              fontWeight: 'bold',
            }}
          >
            हदाइक़े बख़्शिश (हिन्दी) — इमाम अहमद रज़ा ख़ान
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              color: isCurrent ? 'var(--brand-gold)' : 'var(--text-muted)',
            }}
          >
            पृष्ठ {printedPageNumber} / {totalPrintedPages}
          </span>
        </div>

        {/* Complete Book Page Container (Preserving Natural Aspect Ratio: 288 / 396) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            position: 'relative',
            minHeight: '360px',
            aspectRatio: '288 / 396',
            boxSizing: 'border-box',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: canvasRendered ? 'block' : 'none',
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              margin: '0 auto',
            }}
          />

          {/* Loading Skeleton */}
          {!canvasRendered && !renderError && (
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
                  borderTopColor: 'var(--brand-gold)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                पृष्ठ {printedPageNumber} लोड हो रहा है...
              </span>
            </div>
          )}

          {/* Error fallback state */}
          {renderError && (
            <div
              style={{
                padding: 'var(--space-6)',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <p>पृष्ठ {printedPageNumber} लोड नहीं हो सका</p>
              <button
                type="button"
                className="btn btn-xs btn-primary"
                onClick={() => {
                  setRenderError(false);
                  setCanvasRendered(false);
                  if (canvasRef.current) {
                    HadaiqHindiPdfService.renderPageToCanvas(
                      pdfPageNumber,
                      canvasRef.current,
                      scale
                    ).then(() => {
                      setCanvasRendered(true);
                    });
                  }
                }}
              >
                पुनः प्रयास करें (Retry)
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }
);
HadaiqHindiPageCard.displayName = 'HadaiqHindiPageCard';
