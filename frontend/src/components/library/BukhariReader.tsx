import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BUKHARI_VOLUMES,
  GOOGLE_DRIVE_BUKHARI_FILE_ID,
} from '../../data/bukhariData';
import { BukhariPdfService } from '../../services/bukhariPdfService';
import type { RenderTask } from 'pdfjs-dist';

type ViewMode = 'hd-canvas' | 'continuous' | 'gdrive-preview';

const ZOOM_PRESETS = [
  { label: '125%', scale: 1.25 },
  { label: '150% (Recommended)', scale: 1.5 },
  { label: '175% (Large)', scale: 1.75 },
  { label: '200% (Extra Large)', scale: 2.0 },
];

export const BukhariReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const bukhariBook = BUKHARI_VOLUMES[0];
  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? Math.max(1, Math.min(bukhariBook.totalPages, parseInt(pageParam, 10))) : 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [directPageInput, setDirectPageInput] = useState<string>(initialPage.toString());
  const [scale, setScale] = useState<number>(1.5); // Default to 150% large clear scale
  const [fitWidth, setFitWidth] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('hd-canvas');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRenderTaskRef = useRef<RenderTask | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Continuous stream state
  const [visibleContinuousPages, setVisibleContinuousPages] = useState<number[]>([initialPage]);

  // Sync direct input box with current page
  useEffect(() => {
    setDirectPageInput(currentPage.toString());
  }, [currentPage]);

  // Handle URL param changes
  useEffect(() => {
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p >= 1 && p <= bukhariBook.totalPages && p !== currentPage) {
        setCurrentPage(p);
      }
    }
  }, [pageParam, bukhariBook.totalPages, currentPage]);

  const changePage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= bukhariBook.totalPages) {
        setCurrentPage(newPage);
        setSearchParams({ page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [bukhariBook.totalPages, setSearchParams]
  );

  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pNum = parseInt(directPageInput, 10);
    if (!isNaN(pNum) && pNum >= 1 && pNum <= bukhariBook.totalPages) {
      changePage(pNum);
    }
  };

  // Render current page to canvas with High-DPI and large scale
  const renderCurrentPage = useCallback(async () => {
    if (!canvasRef.current || viewMode !== 'hd-canvas') return;

    try {
      setIsLoading(true);
      setRenderError(null);

      // Cancel ongoing render task if page changed rapidly
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {
          // Ignored
        }
        currentRenderTaskRef.current = null;
      }

      // Calculate effective scale
      let effectiveScale = scale;
      if (fitWidth && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        // Standard base width of page ~693px
        effectiveScale = Math.max(1.0, Math.min(2.5, containerWidth / 693));
      }

      await BukhariPdfService.renderPageToCanvas(
        currentPage,
        canvasRef.current,
        effectiveScale,
        (task) => {
          currentRenderTaskRef.current = task;
        }
      );

      setIsLoading(false);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error?.name === 'RenderingCancelledException') {
        // Normal cancellation when user rapidly skips pages
        return;
      }
      console.error('Error rendering Bukhari PDF page:', err);
      setRenderError('Failed to render page canvas. Switching to fallback viewer.');
      setIsLoading(false);
    }
  }, [currentPage, scale, fitWidth, viewMode]);

  // Trigger render on page, scale, or viewMode change
  useEffect(() => {
    if (viewMode === 'hd-canvas') {
      renderCurrentPage();
    }
  }, [viewMode, currentPage, scale, fitWidth, renderCurrentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        changePage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        changePage(currentPage - 1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
        setFitWidth(false);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScale((prev) => Math.max(1.0, +(prev - 0.15).toFixed(2)));
        setFitWidth(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, changePage]);

  // Continuous stream: load more pages as user scrolls
  const handleLoadMoreContinuous = () => {
    const last = visibleContinuousPages[visibleContinuousPages.length - 1];
    if (last < bukhariBook.totalPages) {
      const nextBatch = Array.from(
        { length: Math.min(3, bukhariBook.totalPages - last) },
        (_, i) => last + 1 + i
      );
      setVisibleContinuousPages((prev) => [...prev, ...nextBatch]);
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

  const gdrivePreviewUrlWithPage = `https://drive.google.com/file/d/${GOOGLE_DRIVE_BUKHARI_FILE_ID}/preview#page=${currentPage}`;

  return (
    <div
      ref={containerRef}
      className={`bukhari-reader-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        width: '100%',
        maxWidth: isFullscreen ? '100%' : '1400px',
        margin: '0 auto',
        padding: isFullscreen ? 'var(--space-2)' : 'var(--space-2) var(--space-4) var(--space-12)',
        transition: 'max-width var(--transition-normal)',
      }}
    >
      {/* Sticky Top Control Toolbar */}
      <div
        className="card"
        style={{
          position: 'sticky',
          top: isFullscreen ? '0px' : '64px',
          zIndex: 40,
          padding: '10px 16px',
          marginBottom: 'var(--space-4)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Left: Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => navigate('/library')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}
          >
            <ArrowLeft size={16} />
            <span>Library</span>
          </button>

          <div>
            <h1
              className="font-arabic"
              style={{
                fontSize: '1.05rem',
                fontWeight: 'bold',
                color: 'var(--brand-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              صحيح البخاري — النسخة الأصلية
            </h1>
            <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{bukhariBook.totalPages} Pages</span>
              <span>•</span>
              <span>Imam al-Bukhari رحمه الله</span>
              <span>•</span>
              <span style={{ color: 'var(--brand-gold)', fontWeight: 600 }}>Large Clear Reading</span>
            </div>
          </div>
        </div>

        {/* Center: Scale & Zoom Controls (Clarity Enhancers) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            flexWrap: 'wrap',
          }}
        >
          <span className="text-xs text-muted" style={{ fontWeight: 600, paddingRight: 4 }}>
            Size:
          </span>

          <button
            type="button"
            className="btn-icon btn-icon-sm"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            aria-label="Zoom Out"
            style={{ width: 28, height: 28 }}
          >
            <ZoomOut size={14} />
          </button>

          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 'bold',
              minWidth: 44,
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
            style={{ width: 28, height: 28 }}
          >
            <ZoomIn size={14} />
          </button>

          {/* Quick Size Presets */}
          <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`btn btn-xs ${scale === preset.scale && !fitWidth ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handlePresetZoom(preset.scale)}
                style={{ padding: '3px 7px', fontSize: '0.72rem' }}
                title={`Set scale to ${preset.label}`}
              >
                {preset.label.split(' ')[0]}
              </button>
            ))}

            <button
              type="button"
              className={`btn btn-xs ${fitWidth ? 'btn-primary' : 'btn-ghost'}`}
              onClick={toggleFitWidth}
              style={{ padding: '3px 7px', fontSize: '0.72rem' }}
              title="Fit to screen width"
            >
              Fit Width
            </button>
          </div>
        </div>

        {/* Right: Page Jump, Navigation & View Modes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick Page Prev/Next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              disabled={currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
              title="Previous Page (الصفحة السابقة)"
              style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <ChevronLeft size={14} />
              <span className="font-arabic text-xs">السابقة</span>
            </button>

            {/* Direct Page Jump Form */}
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
              <span className="font-arabic" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                الصفحة
              </span>

              <input
                type="number"
                min={1}
                max={bukhariBook.totalPages}
                value={directPageInput}
                onChange={(e) => setDirectPageInput(e.target.value)}
                aria-label="رقم الصفحة"
                style={{
                  width: '52px',
                  textAlign: 'center',
                  padding: '3px 2px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--brand-primary)',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />

              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                / {bukhariBook.totalPages}
              </span>

              <button
                type="submit"
                className="btn btn-xs btn-primary font-arabic"
                style={{ padding: '3px 7px', fontSize: '0.72rem', fontWeight: 'bold' }}
              >
                انتقال
              </button>
            </form>

            <button
              type="button"
              className="btn btn-xs btn-outline"
              disabled={currentPage >= bukhariBook.totalPages}
              onClick={() => changePage(currentPage + 1)}
              title="Next Page (الصفحة التالية)"
              style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <span className="font-arabic text-xs">التالية</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              className={`btn btn-xs ${viewMode === 'hd-canvas' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('hd-canvas')}
              title="High Definition Large Canvas Mode"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', fontSize: '0.75rem' }}
            >
              <Sparkles size={13} />
              <span>HD Large</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${viewMode === 'continuous' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setViewMode('continuous');
                setVisibleContinuousPages([currentPage]);
              }}
              title="Continuous Vertical Scroll Stream"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', fontSize: '0.75rem' }}
            >
              <Layers size={13} />
              <span>Stream</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${viewMode === 'gdrive-preview' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('gdrive-preview')}
              title="Google Drive Live Preview"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', fontSize: '0.75rem' }}
            >
              <ExternalLink size={13} />
              <span>Drive</span>
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: HIGH-DEFINITION LARGE CANVAS READER (DEFAULT)              */}
      {/* ========================================================================= */}
      {viewMode === 'hd-canvas' && (
        <div
          className="bukhari-hd-canvas-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '700px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            padding: 'var(--space-6) var(--space-2)',
            position: 'relative',
            overflowX: 'auto',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: 'var(--radius-lg)',
                gap: 12,
              }}
            >
              <div
                className="spinner"
                style={{
                  width: 42,
                  height: 42,
                  border: '3px solid rgba(16, 185, 129, 0.2)',
                  borderTopColor: 'var(--brand-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <div
                className="font-arabic"
                style={{ fontSize: '1.1rem', color: 'var(--brand-primary)', fontWeight: 'bold' }}
              >
                جاري تحميل الصفحة {currentPage}...
              </div>
              <span className="text-xs text-muted">Rendering High-Clarity Arabic Scan...</span>
            </div>
          )}

          {/* Render Error Fallback */}
          {renderError && (
            <div
              className="card"
              style={{
                padding: 'var(--space-6)',
                textAlign: 'center',
                maxWidth: 500,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <p style={{ color: '#ef4444', marginBottom: 'var(--space-3)' }}>{renderError}</p>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => setViewMode('gdrive-preview')}
              >
                Open in Drive Viewer
              </button>
            </div>
          )}

          {/* The High-Resolution Book Sheet Canvas (Original Proportions Preserved) */}
          <div
            className="book-page-paper-frame"
            style={{
              display: 'inline-block',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.45), 0 0 1px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              margin: '0 auto',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                margin: '0 auto',
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>

          {/* Bottom Floating Navigation Bar */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            }}
          >
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={currentPage <= 10}
              onClick={() => changePage(Math.max(1, currentPage - 10))}
              title="Jump back 10 pages"
              style={{ fontSize: '0.78rem' }}
            >
              -10
            </button>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
            >
              <ChevronLeft size={16} />
              <span>Previous Page (السابقة)</span>
            </button>

            <span
              className="font-arabic"
              style={{
                fontSize: '0.95rem',
                fontWeight: 'bold',
                color: 'var(--brand-gold)',
                padding: '0 8px',
              }}
            >
              الصفحة {currentPage} من {bukhariBook.totalPages}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={currentPage >= bukhariBook.totalPages}
              onClick={() => changePage(currentPage + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
            >
              <span>Next Page (التالية)</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={currentPage >= bukhariBook.totalPages - 10}
              onClick={() => changePage(Math.min(bukhariBook.totalPages, currentPage + 10))}
              title="Jump forward 10 pages"
              style={{ fontSize: '0.78rem' }}
            >
              +10
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CONTINUOUS VERTICAL SCROLL STREAM                          */}
      {/* ========================================================================= */}
      {viewMode === 'continuous' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            alignItems: 'center',
          }}
        >
          {visibleContinuousPages.map((pageNum) => (
            <ContinuousPageCanvas
              key={pageNum}
              pageNumber={pageNum}
              scale={scale}
              fitWidth={fitWidth}
              containerWidth={containerRef.current?.clientWidth || 1000}
            />
          ))}

          {/* Load Next Pages Button */}
          {visibleContinuousPages[visibleContinuousPages.length - 1] < bukhariBook.totalPages && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLoadMoreContinuous}
              style={{
                padding: '12px 30px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Layers size={18} />
              <span>Load More Pages (المزيد من الصفحات)</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: GOOGLE DRIVE LIVE VIEWER                                   */}
      {/* ========================================================================= */}
      {viewMode === 'gdrive-preview' && (
        <div
          className="bukhari-gdrive-container card"
          style={{
            width: '100%',
            height: 'calc(100vh - 150px)',
            minHeight: '750px',
            backgroundColor: '#0f172a',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <iframe
            id="bukhari-gdrive-frame"
            src={gdrivePreviewUrlWithPage}
            title="صحيح البخاري — Google Drive Live Preview"
            allow="autoplay"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#0f172a',
            }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONTINUOUS STREAM SINGLE PAGE COMPONENT
// ============================================================================
interface ContinuousPageProps {
  pageNumber: number;
  scale: number;
  fitWidth: boolean;
  containerWidth: number;
}

const ContinuousPageCanvas: React.FC<ContinuousPageProps> = ({
  pageNumber,
  scale,
  fitWidth,
  containerWidth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let task: RenderTask | null = null;

    const render = async () => {
      if (!canvasRef.current) return;
      try {
        let effectiveScale = scale;
        if (fitWidth) {
          effectiveScale = Math.max(1.0, Math.min(2.5, (containerWidth - 32) / 693));
        }

        await BukhariPdfService.renderPageToCanvas(
          pageNumber,
          canvasRef.current,
          effectiveScale,
          (t) => {
            task = t;
          }
        );
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering continuous page ${pageNumber}:`, err);
        }
      }
    };

    render();

    return () => {
      if (task) {
        try {
          task.cancel();
        } catch {
          // Ignored
        }
      }
    };
  }, [pageNumber, scale, fitWidth, containerWidth]);

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        position: 'relative',
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 900,
          marginBottom: 'var(--space-2)',
          paddingBottom: 'var(--space-1)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span
          className="font-arabic"
          style={{
            fontSize: '0.88rem',
            fontWeight: 'bold',
            color: 'var(--brand-primary)',
          }}
        >
          الصفحة {pageNumber}
        </span>
        <span className="text-xs text-muted">صحيح البخاري</span>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 4,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'inline-block',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
};
