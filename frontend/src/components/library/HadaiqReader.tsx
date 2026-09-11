import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Search,
  List,
  X,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  HADAIQ_VISIBLE_TOTAL_PAGES,
  HADAIQ_VISIBLE_PAGES,
  HADAIQ_KALAMS_INDEX,
  HadaiqKalamItem,
  getVisiblePageFromPdfPage,
} from '../../data/hadaiqData';
import { HadaiqPdfService } from '../../services/hadaiqPdfService';

const ZOOM_PRESETS = [
  { label: '125%', scale: 1.25 },
  { label: '150%', scale: 1.5 },
  { label: '175%', scale: 1.75 },
  { label: '200%', scale: 2.0 },
];

export const HadaiqReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const totalVisiblePages = HADAIQ_VISIBLE_TOTAL_PAGES; // 444 visible pages (PDF pages 2..11 hidden)

  const pageParam = searchParams.get('page');
  const initialPage = pageParam
    ? Math.max(1, Math.min(totalVisiblePages, parseInt(pageParam, 10) || 1))
    : 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPage.toString());
  const [scale, setScale] = useState<number>(1.5); // Default: 150% clear reading
  const [fitWidth, setFitWidth] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [indexSearch, setIndexSearch] = useState<string>('');

  const activePageRef = useRef<number>(currentPage);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync direct input box with current page
  useEffect(() => {
    setDirectPageInput(currentPage.toString());
  }, [currentPage]);

  // Scroll to a specific Hadaiq visible page
  const scrollToPage = useCallback(
    (visiblePageNum: number, behavior: ScrollBehavior = 'smooth') => {
      const clamped = Math.max(1, Math.min(totalVisiblePages, visiblePageNum));
      setCurrentPage(clamped);
      activePageRef.current = clamped;
      isProgrammaticScrollRef.current = true;
      setSearchParams({ page: clamped.toString() });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const performScroll = () => {
        const el = document.getElementById(`hadaiq-page-${clamped}`);
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
      }, 600);
    },
    [totalVisiblePages, isFullscreen, setSearchParams]
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
      if (!isNaN(p) && p >= 1 && p <= totalVisiblePages && p !== activePageRef.current) {
        scrollToPage(p, 'smooth');
      }
    }
  }, [pageParam, totalVisiblePages, scrollToPage]);

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

        if (bestEntry && maxRatio >= 0.15) {
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
        rootMargin: '-10% 0px -25% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    const pageElements = document.querySelectorAll('.hadaiq-page-card');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Handle direct page jump form submission
  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = directPageInput.trim();
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setDirectPageInput(currentPage.toString());
      return;
    }
    const clamped = Math.max(1, Math.min(totalVisiblePages, parsed));
    setDirectPageInput(clamped.toString());
    scrollToPage(clamped, 'smooth');
  };

  const handleDirectPageBlur = () => {
    const raw = directPageInput.trim();
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      setDirectPageInput(currentPage.toString());
    } else {
      const clamped = Math.max(1, Math.min(totalVisiblePages, parsed));
      setDirectPageInput(clamped.toString());
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

  // Filtered Kalams for Index Drawer (excluding any that pointed to hidden frontmatter pages 2..11)
  const filteredKalams = HADAIQ_KALAMS_INDEX.filter((k) =>
    !(k.pdfPage >= 2 && k.pdfPage <= 11) &&
    (k.title.toLowerCase().includes(indexSearch.toLowerCase()) ||
     k.categoryUrdu.toLowerCase().includes(indexSearch.toLowerCase()))
  );

  // Responsive page container max-width based on desktop zoom scale
  const pageContainerMaxWidth = fitWidth
    ? '100%'
    : `${Math.min(1280, Math.max(340, Math.round(860 * (scale / 1.5))))}px`;

  return (
    <div className={`hadaiq-reader-page-root ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Scoped Styling for Clean, Responsive & Width-Matched Controls */}
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
          padding: 10px 16px;
          margin-bottom: var(--space-5);
          background-color: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
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
          padding: 6px 12px;
          height: 36px;
          font-size: 0.82rem;
          border-radius: var(--radius-md);
          box-sizing: border-box;
        }

        .hadaiq-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .hadaiq-title-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--brand-gold);
          margin: 0;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hadaiq-subtitle-text {
          font-size: 0.74rem;
          color: var(--text-secondary);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hadaiq-toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
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

        .hadaiq-zoom-cluster {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hadaiq-zoom-controls {
          display: flex;
          align-items: center;
          height: 36px;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 2px 4px;
          box-sizing: border-box;
        }

        .hadaiq-zoom-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .hadaiq-zoom-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--brand-gold);
        }

        .hadaiq-zoom-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .hadaiq-zoom-label {
          font-size: 0.78rem;
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--text-primary);
          padding: 0 6px;
          min-width: 42px;
          text-align: center;
        }

        .hadaiq-zoom-presets {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .hadaiq-preset-btn {
          height: 36px;
          padding: 0 8px;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          font-weight: 500;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background-color: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .hadaiq-preset-btn:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .hadaiq-preset-btn.active {
          background-color: var(--brand-gold);
          color: #000000;
          font-weight: 700;
          border-color: var(--brand-gold);
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
          font-size: 0.76rem;
          color: var(--text-secondary);
          font-weight: 500;
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
          height: 28px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.76rem;
          font-weight: 700;
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

        @media (max-width: 1080px) {
          .hadaiq-zoom-presets {
            display: none;
          }
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
          .hadaiq-title-text {
            font-size: 0.95rem;
          }
          .hadaiq-subtitle-text {
            font-size: 0.7rem;
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
        {/* Section 1: Back to Library & Clean Book Title */}
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

          <div className="hadaiq-title-group">
            <h1 className="font-arabic hadaiq-title-text">
              حدائقِ بخشش (Hadaiq-e-Bakhshish)
            </h1>
            <div className="hadaiq-subtitle-text">
              Imam Ahmad Raza Khan (Ala Hazrat) • ۴۴۴ صفحات
            </div>
          </div>
        </div>

        {/* Section 2: Index Navigator, Zoom Controls & Page Selector */}
        <div className="hadaiq-toolbar-right">
          {/* Index / Table of Contents Button */}
          <button
            type="button"
            className="hadaiq-action-btn"
            onClick={() => setIsIndexOpen(!isIndexOpen)}
            title="Open Naat & Kalam Index (فہرستِ کلام)"
          >
            <List size={15} />
            <span>فہرستِ کلام</span>
          </button>

          {/* Zoom Controls & Presets */}
          <div className="hadaiq-zoom-cluster">
            <div className="hadaiq-zoom-controls">
              <button
                type="button"
                className="hadaiq-zoom-btn"
                onClick={handleZoomOut}
                title="Zoom Out (-15%)"
                aria-label="Zoom Out"
                disabled={scale <= 1.0}
              >
                <ZoomOut size={14} />
              </button>

              <span className="hadaiq-zoom-label">
                {fitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
              </span>

              <button
                type="button"
                className="hadaiq-zoom-btn"
                onClick={handleZoomIn}
                title="Zoom In (+15%)"
                aria-label="Zoom In"
                disabled={scale >= 2.5}
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Zoom Presets (Desktop) */}
            <div className="hadaiq-zoom-presets">
              {ZOOM_PRESETS.map((p) => (
                <button
                  key={p.scale}
                  type="button"
                  className={`hadaiq-preset-btn ${
                    scale === p.scale && !fitWidth ? 'active' : ''
                  }`}
                  onClick={() => handlePresetZoom(p.scale)}
                >
                  {p.label}
                </button>
              ))}

              <button
                type="button"
                className={`hadaiq-preset-btn ${fitWidth ? 'active' : ''}`}
                onClick={toggleFitWidth}
                title="Fit Full Width"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Section 3: Exact Page Jump & Search Form */}
          <form onSubmit={handleDirectPageSubmit} className="hadaiq-page-search-form">
            <span className="hadaiq-page-search-label">صفحة:</span>
            <input
              type="number"
              min={1}
              max={totalVisiblePages}
              value={directPageInput}
              onChange={(e) => setDirectPageInput(e.target.value)}
              onBlur={handleDirectPageBlur}
              className="hadaiq-page-input"
              aria-label="Enter Hadaiq page number (1 to 444)"
            />

            <span className="hadaiq-page-total">
              / {totalVisiblePages}
            </span>

            <button
              type="submit"
              className="hadaiq-search-go-btn"
              title="انتقال إلى الصفحة (Go to Page)"
            >
              <Search size={12} />
              <span>انتقال</span>
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
      {/* NAAT & KALAM INDEX SEARCH DRAWER (MODAL OVERLAY)                          */}
      {/* ========================================================================= */}
      {isIndexOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
          onClick={() => setIsIndexOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '2px solid rgba(245, 158, 11, 0.5)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: 'var(--brand-gold)' }} />
                <h3
                  className="font-arabic"
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    color: 'var(--brand-gold)',
                    fontWeight: 'bold',
                  }}
                >
                  فہرستِ کلام — حدائقِ بخشش (Naat Index)
                </h3>
              </div>
              <button
                type="button"
                className="btn-icon btn-icon-sm"
                onClick={() => setIsIndexOpen(false)}
                title="Close Index"
                aria-label="Close Index"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Filter Input */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--bg-surface)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="تلاش کریں (مثلاً: مصطفیٰ جان، چمک تجھ سے، قصیدہ معراجیہ، اولیٰ و اعلیٰ)..."
                  value={indexSearch}
                  onChange={(e) => setIndexSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '0.9rem',
                    direction: 'rtl',
                    fontFamily: 'var(--font-urdu), var(--font-arabic)',
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* List of Indexed Kalams */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {filteredKalams.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  کوئی کلام نہیں ملا — براہِ کرم دوسرا لفظ تلاش کریں۔
                </div>
              ) : (
                filteredKalams.map((kalam: HadaiqKalamItem) => {
                  const targetVisiblePage = getVisiblePageFromPdfPage(kalam.pdfPage);
                  return (
                    <button
                      key={kalam.id}
                      type="button"
                      onClick={() => {
                        scrollToPage(targetVisiblePage, 'smooth');
                        setIsIndexOpen(false);
                      }}
                      className="card card-hover"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'right',
                        direction: 'rtl',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              kalam.category === 'salam'
                                ? 'rgba(245, 158, 11, 0.25)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              kalam.category === 'salam'
                                ? 'var(--brand-gold)'
                                : 'var(--brand-primary)',
                            fontWeight: 'bold',
                            flexShrink: 0,
                          }}
                        >
                          {kalam.categoryUrdu}
                        </span>
                        <span
                          className="font-urdu"
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 'var(--weight-semibold)',
                            color: 'var(--text-primary)',
                            lineHeight: 1.4,
                          }}
                        >
                          {kalam.title}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0,
                          direction: 'ltr',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--brand-gold)',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 6px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: 4,
                          }}
                        >
                          Page {targetVisiblePage}
                        </span>
                        <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
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
      {/* VERTICAL CONTINUOUS SCROLL STREAM (ALL 444 VISIBLE PAGES VIA HIGH-DPI)   */}
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
        {HADAIQ_VISIBLE_PAGES.map(({ visiblePage, pdfPage }) => (
          <HadaiqPageCard
            key={visiblePage}
            visiblePageNumber={visiblePage}
            pdfPageNumber={pdfPage}
            totalVisiblePages={totalVisiblePages}
            maxWidth={pageContainerMaxWidth}
            isCurrent={visiblePage === currentPage}
            initialPage={initialPage}
            scale={scale}
          />
        ))}
      </main>
    </div>
  );
};

// ============================================================================
// SINGLE HADAIQ PAGE CARD COMPONENT (HIGH-DPI AUTHENTIC BOOK RENDERING)
// ============================================================================
interface HadaiqPageCardProps {
  visiblePageNumber: number;
  pdfPageNumber: number;
  totalVisiblePages: number;
  maxWidth: string;
  isCurrent: boolean;
  initialPage: number;
  scale: number;
}

const HadaiqPageCard: React.FC<HadaiqPageCardProps> = memo(
  ({
    visiblePageNumber,
    pdfPageNumber,
    totalVisiblePages,
    maxWidth,
    isCurrent,
    initialPage,
    scale,
  }) => {
    const isNearbyInitial = Math.abs(visiblePageNumber - initialPage) <= 2;
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
          rootMargin: '600px 0px', // Proactively load 600px ahead of scroll
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
            await HadaiqPdfService.renderPageToCanvas(pdfPageNumber, canvasRef.current, scale);
            if (!isCancelled) {
              setCanvasRendered(true);
              setRenderError(false);
            }
          }
        } catch (err) {
          if (!isCancelled) {
            console.error(
              `Canvas render failed for Hadaiq page ${visiblePageNumber} (PDF ${pdfPageNumber}):`,
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
    }, [shouldRender, pdfPageNumber, visiblePageNumber, scale]);

    return (
      <article
        ref={containerRef}
        id={`hadaiq-page-${visiblePageNumber}`}
        data-page={visiblePageNumber}
        className="hadaiq-page-card card"
        style={{
          width: '100%',
          maxWidth: maxWidth,
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
        {/* Subtle Page Top Banner */}
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
            className="font-arabic"
            style={{
              fontSize: '0.85rem',
              color: isCurrent ? 'var(--brand-gold)' : 'var(--text-primary)',
            }}
          >
            حدائقِ بخشش — إمام أحمد رضا خان قدس سرہ
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              color: isCurrent ? 'var(--brand-gold)' : 'var(--text-muted)',
            }}
          >
            الصفحة {visiblePageNumber} من {totalVisiblePages}
          </span>
        </div>

        {/* Complete Book Page Container (Preserving Natural Aspect Ratio: 289 / 401) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            position: 'relative',
            minHeight: '360px',
            aspectRatio: '289 / 401',
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
                className="font-arabic text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                جاري تحميل الصفحة {visiblePageNumber}...
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
              <p>تعذر تحميل الصفحة {visiblePageNumber}</p>
              <button
                type="button"
                className="btn btn-xs btn-primary"
                onClick={() => {
                  setRenderError(false);
                  setCanvasRendered(false);
                  if (canvasRef.current) {
                    HadaiqPdfService.renderPageToCanvas(
                      pdfPageNumber,
                      canvasRef.current,
                      scale
                    ).then(() => {
                      setCanvasRendered(true);
                    });
                  }
                }}
              >
                إعادة المحاولة (Retry)
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }
);
HadaiqPageCard.displayName = 'HadaiqPageCard';
