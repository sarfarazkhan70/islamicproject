import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  FileText,
  Headphones,
} from 'lucide-react';
import { getBookById } from '../../data/libraryData';
import { BookVolumeList } from '../../components/library/BookVolumeList';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { HadaiqPdfService } from '../../services/hadaiqPdfService';
import { HadaiqHindiPdfService } from '../../services/hadaiqHindiPdfService';
import { HadaiqEnglishPdfService } from '../../services/hadaiqEnglishPdfService';

// ============================================================================
// HADAIQ AUTHENTIC COVER THUMBNAIL (RENDERS ORIGINAL FIRST PAGE OF THE PDF)
// ============================================================================
interface HadaiqSelectionCoverProps {
  edition: 'urdu' | 'hindi' | 'english';
  width?: number;
  height?: number;
}

const HadaiqSelectionCoverCanvas: React.FC<HadaiqSelectionCoverProps> = ({
  edition,
  width = 115,
  height = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const renderCover = async () => {
      try {
        if (!canvasRef.current) return;
        if (edition === 'urdu') {
          await HadaiqPdfService.renderPageToCanvas(1, canvasRef.current, 0.45);
        } else if (edition === 'hindi') {
          await HadaiqHindiPdfService.renderPageToCanvas(1, canvasRef.current, 0.45);
        } else {
          await HadaiqEnglishPdfService.renderPageToCanvas(1, canvasRef.current, 0.45);
        }
        if (!isCancelled) {
          setIsRendered(true);
        }
      } catch (err) {
        console.error(`Error rendering ${edition} cover page:`, err);
      }
    };
    renderCover();
    return () => {
      isCancelled = true;
    };
  }, [edition]);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#ffffff',
        border: `1.5px solid ${
          edition === 'urdu'
            ? 'rgba(16, 185, 129, 0.5)'
            : edition === 'hindi'
            ? 'rgba(245, 158, 11, 0.55)'
            : 'rgba(59, 130, 246, 0.55)'
        }`,
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        marginBottom: '14px',
        flexShrink: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: isRendered ? 'block' : 'none',
        }}
      />
      {!isRendered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              edition === 'urdu'
                ? 'rgba(6, 78, 59, 0.9)'
                : edition === 'hindi'
                ? 'rgba(120, 53, 15, 0.9)'
                : 'rgba(30, 58, 138, 0.9)',
          }}
        >
          <BookOpen
            size={32}
            style={{
              color:
                edition === 'urdu'
                  ? '#10b981'
                  : edition === 'hindi'
                  ? 'var(--brand-gold)'
                  : '#60a5fa',
              opacity: 0.8,
            }}
          />
        </div>
      )}
    </div>
  );
};

export const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'volumes' | 'about' | 'source'>('volumes');

  const book = bookId ? getBookById(bookId) : undefined;
  const { readingProgress } = useLibraryStore();

  if (!book) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <BookOpen size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }} />
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Islamic Book Not Found</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          The requested book entry could not be found in the library catalog.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/library')}
        >
          Return to Islamic Library
        </button>
      </div>
    );
  }

  const progress = readingProgress[book.id];
  const isAlahazrat =
    book.category === 'alahazrat' ||
    book.tradition.toLowerCase().includes('alahazrat') ||
    book.author.toLowerCase().includes('ahmad raza');

  const handleStartReading = () => {
    if (progress?.chapterId) {
      navigate(
        `/library/${book.id}/read?vol=${progress.volumeNumber || 1}&ch=${progress.chapterId}`
      );
    } else {
      navigate(`/library/${book.id}/read`);
    }
  };

  // Dedicated Hadaiq-e-Bakhshish Selection Screen (Urdu, Hindi & English Editions)
  if (
    book.id === 'hadaiq-e-bakhshish' ||
    book.id === 'hadaiq-e-bakhshish-hindi' ||
    book.id === 'hadaiq-e-bakhshish-english'
  ) {
    return (
      <div
        className="book-detail-page hadaiq-selection-page"
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0',
          padding: '0 var(--space-4) var(--space-10)',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Back & Breadcrumb Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => navigate('/library')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Library</span>
          </button>

          <div
            className="text-xs text-muted"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Link to="/library" style={{ color: 'var(--text-muted)' }}>
              Library
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--brand-gold)', fontWeight: 'var(--weight-semibold)' }}>
              Hadaiq-e-Bakhshish
            </span>
          </div>
        </div>

        {/* Side-by-Side Horizontal Cards Container (Starting Left) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            gap: 'var(--space-5)',
            width: '100%',
          }}
        >
          {/* Card 1: Hadaiq-e-Bakhshish (Urdu Edition) */}
          <div
            className="card card-hover hadaiq-book-card"
            onClick={() => navigate('/library/hadaiq-e-bakhshish/read')}
            role="button"
            tabIndex={0}
            aria-label="Hadaiq-e-Bakhshish Urdu Edition"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/library/hadaiq-e-bakhshish/read');
              }
            }}
            style={{
              width: 210,
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '16px 14px',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              backgroundColor: 'var(--bg-surface)',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.28)',
              boxSizing: 'border-box',
              transition: 'all var(--transition-fast)',
            }}
          >
            {/* Authentic Urdu Edition First Page / Cover */}
            <HadaiqSelectionCoverCanvas edition="urdu" width={115} height={160} />

            {/* Writer Name */}
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 'var(--weight-medium, 500)',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              Writer: Imam Ahmad Raza Khan Barelvi (Ala Hazrat)
            </div>

            {/* Language Label */}
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 'var(--weight-medium, 500)',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginTop: '3px',
                lineHeight: 1.3,
              }}
            >
              (Urdu)
            </div>
          </div>

          {/* Card 2: Hadaiq-e-Bakhshish (Hindi Edition) */}
          <div
            className="card card-hover hadaiq-book-card"
            onClick={() => navigate('/library/hadaiq-e-bakhshish-hindi/read')}
            role="button"
            tabIndex={0}
            aria-label="Hadaiq-e-Bakhshish Hindi Edition"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/library/hadaiq-e-bakhshish-hindi/read');
              }
            }}
            style={{
              width: 210,
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '16px 14px',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid rgba(245, 158, 11, 0.45)',
              backgroundColor: 'var(--bg-surface)',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.28)',
              boxSizing: 'border-box',
              transition: 'all var(--transition-fast)',
            }}
          >
            {/* Authentic Hindi Edition First Page / Cover */}
            <HadaiqSelectionCoverCanvas edition="hindi" width={115} height={160} />

            {/* Writer Name */}
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 'var(--weight-medium, 500)',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              Writer: Imam Ahmad Raza Khan Barelvi (Ala Hazrat)
            </div>

            {/* Language Label */}
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 'var(--weight-medium, 500)',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginTop: '3px',
                lineHeight: 1.3,
              }}
            >
              (Hindi)
            </div>
          </div>

          {/* Card 3: Hadaiq-e-Bakhshish (English Edition) */}
          <div
            className="card card-hover hadaiq-book-card"
            onClick={() => navigate('/library/hadaiq-e-bakhshish-english/read')}
            role="button"
            tabIndex={0}
            aria-label="English — Hadaiq-e-Bakhshish"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/library/hadaiq-e-bakhshish-english/read');
              }
            }}
            style={{
              width: 210,
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '16px 14px',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid rgba(59, 130, 246, 0.45)',
              backgroundColor: 'var(--bg-surface)',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.28)',
              boxSizing: 'border-box',
              transition: 'all var(--transition-fast)',
            }}
          >
            {/* Authentic English Edition First Page / Cover */}
            <HadaiqSelectionCoverCanvas edition="english" width={115} height={160} />

            {/* Writer Name */}
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 'var(--weight-medium, 500)',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              Writer: Imam Ahmad Raza Khan Barelvi (Ala Hazrat)
            </div>

            {/* Language Label */}
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 'var(--weight-medium, 500)',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginTop: '3px',
                lineHeight: 1.3,
              }}
            >
              (Roman Urdu)
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      {/* Top Back & Breadcrumb Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
          gap: 'var(--space-2)',
        }}
      >
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => navigate('/library')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Library</span>
        </button>

        <div
          className="text-xs text-muted"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Link to="/library" style={{ color: 'var(--text-muted)' }}>
            Library
          </Link>
          <span>/</span>
          <span style={{ textTransform: 'capitalize' }}>{book.category}</span>
          <span>/</span>
          <span style={{ color: 'var(--brand-primary)', fontWeight: 'var(--weight-semibold)' }}>
            {book.title}
          </span>
        </div>
      </div>

      {/* Book Hero Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          background: `linear-gradient(135deg, ${
            isAlahazrat ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)'
          } 0%, var(--bg-surface) 100%)`,
          border: isAlahazrat
            ? '1px solid rgba(245, 158, 11, 0.3)'
            : '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 'var(--space-6)',
            flexWrap: 'wrap',
          }}
        >
          {/* Cover Emblem */}
          <div
            style={{
              width: 120,
              height: 165,
              borderRadius: 'var(--radius-md)',
              background: `linear-gradient(145deg, ${book.coverColor || '#064e3b'} 0%, #0f172a 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              flexShrink: 0,
              margin: '0 auto',
            }}
          >
            <BookOpen size={36} style={{ opacity: 0.9 }} />
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: 1,
                marginTop: 8,
                textAlign: 'center',
                padding: '0 8px',
                opacity: 0.9,
              }}
            >
              {book.volumeCount} {book.volumeCount === 1 ? 'VOL' : 'VOLUMES'}
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                opacity: 0.65,
                marginTop: 2,
              }}
            >
              ISLAMIC LIBRARY
            </div>
          </div>

          {/* Book Metadata Overview */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
                marginBottom: 'var(--space-2)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 'var(--weight-semibold)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isAlahazrat
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
                  color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isAlahazrat && <Sparkles size={12} />}
                <span>{book.tradition}</span>
              </span>

              {book.subcategory && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {book.subcategory}
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.3rem, 2.5vw, 1.85rem)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                marginBottom: 6,
              }}
            >
              {book.title}
            </h1>

            {book.arabicTitle && (
              <div
                className="font-arabic"
                style={{
                  fontSize: '1.25rem',
                  color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                  direction: 'rtl',
                  textAlign: 'left',
                  lineHeight: 1.5,
                  marginBottom: 6,
                }}
              >
                {book.arabicTitle}
              </div>
            )}

            {book.urduTitle && (
              <div
                className="font-urdu"
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  direction: 'rtl',
                  textAlign: 'left',
                  marginBottom: 'var(--space-3)',
                }}
              >
                {book.urduTitle}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span className="text-muted">
                  {book.compiler ? 'Compiler:' : 'Author / Scholar:'}
                </span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {book.compiler || book.author}
                </strong>
              </div>

              {book.authorTitle && (
                <div>
                  <span className="text-muted">Honorific:</span>{' '}
                  <span style={{ color: 'var(--brand-gold)', fontWeight: 500 }}>
                    {book.authorTitle}
                  </span>
                </div>
              )}

              <div>
                <span className="text-muted">Era / Timeline:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{book.era}</span>
              </div>

              <div>
                <span className="text-muted">Volumes:</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {book.volumeCount} {book.volumeCount === 1 ? 'Volume' : 'Volumes'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {book.isAvailable ? (
                book.id === 'kanzul-iman' ? (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => navigate('/library/kanzul-iman/read?mode=read')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        fontSize: '0.95rem',
                        fontWeight: 'var(--weight-bold)',
                      }}
                    >
                      <BookOpen size={18} />
                      <span>📖 Kanzul Iman Reading</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/library/kanzul-iman/read?mode=listen')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        fontSize: '0.95rem',
                        fontWeight: 'var(--weight-bold)',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: 'rgba(16, 185, 129, 0.5)',
                        color: '#10b981',
                      }}
                    >
                      <Headphones size={18} />
                      <span>🎧 Kanzul Iman Audio</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleStartReading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 22px',
                      fontSize: '0.95rem',
                    }}
                  >
                    <BookOpen size={18} />
                    <span>
                      {progress?.chapterId ? 'Continue Reading' : 'Start Reading'}
                    </span>
                  </button>
                )
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                  }}
                >
                  <Clock size={16} />
                  <span>Digital Edition In Preparation</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                {book.languagesAvailable.map((lang) => (
                  <span
                    key={lang}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('volumes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            borderBottom:
              activeTab === 'volumes'
                ? '2px solid var(--brand-primary)'
                : '2px solid transparent',
            color: activeTab === 'volumes' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight:
              activeTab === 'volumes' ? 'var(--weight-semibold)' : 'var(--weight-normal)',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            fontSize: '0.92rem',
          }}
        >
          <Layers size={16} />
          <span>Volumes & Chapters ({book.volumeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            borderBottom:
              activeTab === 'about'
                ? '2px solid var(--brand-primary)'
                : '2px solid transparent',
            color: activeTab === 'about' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight:
              activeTab === 'about' ? 'var(--weight-semibold)' : 'var(--weight-normal)',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            fontSize: '0.92rem',
          }}
        >
          <FileText size={16} />
          <span>About & Scholarly Significance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('source')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            borderBottom:
              activeTab === 'source'
                ? '2px solid var(--brand-primary)'
                : '2px solid transparent',
            color: activeTab === 'source' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight:
              activeTab === 'source' ? 'var(--weight-semibold)' : 'var(--weight-normal)',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            fontSize: '0.92rem',
          }}
        >
          <ShieldCheck size={16} />
          <span>Source & Verification</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'volumes' && <BookVolumeList book={book} />}

      {activeTab === 'about' && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 'var(--weight-bold)',
              marginBottom: 'var(--space-3)',
              color: 'var(--text-primary)',
            }}
          >
            Overview & Description
          </h3>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-5)',
            }}
          >
            {book.description}
          </p>

          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 'var(--weight-bold)',
              marginBottom: 'var(--space-3)',
              color: 'var(--text-primary)',
            }}
          >
            Scholarly Significance in the Sunni / Ahl-e-Sunnat Tradition
          </h3>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-5)',
            }}
          >
            {book.significance}
          </p>

          {book.authorArabic && (
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="text-xs text-muted" style={{ marginBottom: 4 }}>
                Author in Classical Arabic:
              </div>
              <div
                className="font-arabic"
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--brand-primary)',
                  direction: 'rtl',
                  textAlign: 'right',
                }}
              >
                {book.authorArabic}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'source' && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <ShieldCheck size={28} style={{ color: 'var(--brand-primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'var(--weight-bold)', margin: 0 }}>
                Verified Manuscript & Public Domain Source
              </h3>
              <span className="text-xs text-muted">
                Adheres to verified Sunni / Ahl-e-Sunnat wa Jama'at standards
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Source Reference:</strong>{' '}
              {book.source}
            </div>

            {book.sourceNotes && (
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Authenticity Notes:</strong>{' '}
                {book.sourceNotes}
              </div>
            )}

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Language Editions:</strong>{' '}
              {book.languagesAvailable.join(', ')} (Primary: {book.primaryLanguage})
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Tradition / School:</strong>{' '}
              {book.tradition}
            </div>

            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              Notice: All Hadith, Fatawa, and Masail texts are strictly cross-verified against
              authoritative classical editions and the authentic Alahazrat / Ahl-e-Sunnat scholarly
              tradition.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
