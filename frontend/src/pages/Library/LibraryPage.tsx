import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Bookmark,
  Search,
  Trash2,
  ExternalLink,
  Star,
  Headphones,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { BookCard } from '../../components/library/BookCard';
import { CategoryFilterPills } from '../../components/library/CategoryFilterPills';
import { LibrarySearchBar } from '../../components/library/LibrarySearchBar';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'catalog' | 'featured' | 'bookmarks'>('catalog');

  const {
    getFilteredBooks,
    searchQuery,
    bookmarks,
    removeBookmark,
    clearSearch,
  } = useLibraryStore();

  const filteredBooks = getFilteredBooks();
  const featuredBooks = filteredBooks.filter((b) => b.isFeatured);

  return (
    <div className="library-page">
      {/* Kanzul Iman Spotlight Hero (VERY TOP / PRIORITY #1) */}
      <div
        className="card card-hover"
        style={{
          background:
            'linear-gradient(135deg, rgba(6, 78, 59, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '2px solid rgba(245, 158, 11, 0.45)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.4), 0 0 20px rgba(245, 158, 11, 0.15)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -25,
            bottom: -35,
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        >
          <BookOpen size={240} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              marginBottom: 'var(--space-3)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--brand-gold)',
                fontSize: '0.8rem',
                fontWeight: 'var(--weight-bold)',
                letterSpacing: 0.5,
              }}
            >
              <Star size={14} fill="currentColor" />
              <span>FEATURED #1 RESOURCE • HOLY QURAN TRANSLATION</span>
            </div>

            <div
              className="text-xs font-urdu"
              style={{
                color: 'var(--brand-gold)',
                fontSize: '0.95rem',
                direction: 'rtl',
              }}
            >
              ترجمہ قرآن مجید • امام احمد رضا خان بریلوی قدس سرہ
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 280, maxWidth: 720 }}>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  marginBottom: 6,
                }}
              >
                📖 Kanzul Iman (کنز الایمان فی ترجمۃ القرآن)
              </h2>

              <div
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--brand-gold)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                By Alahazrat Imam Ahmad Raza Khan Barelvi (1330 AH / 1911 CE)
              </div>

              <p
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 'var(--space-4)',
                }}
              >
                The gold-standard Urdu translation of the Holy Quran, celebrated worldwide for its
                unmatched linguistic mastery, preservation of prophetic veneration, and strict
                theological precision. Read all 114 Surahs with crisp Arabic text and authentic Urdu
                translation.
              </p>

              {/* Quick Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/library/kanzul-iman/read?mode=read')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 22px',
                    fontSize: '0.96rem',
                    fontWeight: 'var(--weight-bold)',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
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
                    padding: '12px 20px',
                    fontSize: '0.96rem',
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
            </div>

            {/* Emblem Right Badge */}
            <div
              style={{
                width: 130,
                height: 165,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(145deg, #064e3b 0%, #022c22 100%)',
                border: '2px solid rgba(245, 158, 11, 0.4)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                padding: 'var(--space-3)',
                textAlign: 'center',
                alignSelf: 'center',
              }}
            >
              <BookOpen size={36} style={{ color: 'var(--brand-gold)', opacity: 0.95 }} />
              <div
                className="font-arabic"
                style={{
                  fontSize: '1rem',
                  color: 'var(--brand-gold)',
                  marginTop: 6,
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                كنز الإيمان
              </div>
              <div
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: 0.5,
                  marginTop: 4,
                  opacity: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                114 Surahs • 30 Paras
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Bar */}
      <LibrarySearchBar />

      {/* Category Pills Filter */}
      <CategoryFilterPills />

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 'var(--space-4)',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className={`btn-tab ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderBottom:
                activeTab === 'catalog'
                  ? '2px solid var(--brand-primary)'
                  : '2px solid transparent',
              color: activeTab === 'catalog' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight:
                activeTab === 'catalog' ? 'var(--weight-semibold)' : 'var(--weight-normal)',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            <BookOpen size={16} />
            <span>All Books ({filteredBooks.length})</span>
          </button>

          <button
            type="button"
            className={`btn-tab ${activeTab === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveTab('featured')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderBottom:
                activeTab === 'featured'
                  ? '2px solid var(--brand-gold)'
                  : '2px solid transparent',
              color: activeTab === 'featured' ? 'var(--brand-gold)' : 'var(--text-secondary)',
              fontWeight:
                activeTab === 'featured' ? 'var(--weight-semibold)' : 'var(--weight-normal)',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            <Sparkles size={16} />
            <span>Featured Masterpieces ({featuredBooks.length})</span>
          </button>

          <button
            type="button"
            className={`btn-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookmarks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderBottom:
                activeTab === 'bookmarks'
                  ? '2px solid var(--brand-primary)'
                  : '2px solid transparent',
              color: activeTab === 'bookmarks' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight:
                activeTab === 'bookmarks' ? 'var(--weight-semibold)' : 'var(--weight-normal)',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            <Bookmark size={16} />
            <span>Saved Bookmarks ({bookmarks.length})</span>
          </button>
        </div>

        <div className="text-xs text-muted">
          Showing {activeTab === 'featured' ? featuredBooks.length : filteredBooks.length} titles
        </div>
      </div>

      {/* Bookmarks View */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <div
              className="card"
              style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Bookmark size={36} style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                No Saved Library Bookmarks Yet
              </h3>
              <p style={{ maxWidth: 420, margin: '0 auto var(--space-4)', fontSize: '0.9rem' }}>
                While reading Kanzul Iman or any Hadith/Fiqh book, click the bookmark icon on any
                Ayah or chapter to save your place here for quick access.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab('catalog')}
              >
                Browse Islamic Library
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: 4,
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: 'var(--brand-primary)',
                          fontWeight: 'var(--weight-semibold)',
                        }}
                      >
                        {bm.bookTitle}
                      </span>
                      <button
                        type="button"
                        className="btn-icon btn-icon-sm"
                        onClick={() => removeBookmark(bm.id)}
                        title="Remove bookmark"
                        aria-label="Remove bookmark"
                      >
                        <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>

                    <h4
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                      }}
                    >
                      {bm.chapterTitle}
                    </h4>

                    <div className="text-xs text-muted" style={{ marginBottom: 6 }}>
                      By {bm.author} {bm.volumeNumber && `• Vol ${bm.volumeNumber}`}
                    </div>

                    {bm.snippet && (
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4,
                          fontStyle: 'italic',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        "{bm.snippet}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      if (bm.bookId === 'kanzul-iman') {
                        const surahMatch = bm.chapterId.match(/surah-(\d+)/);
                        const surahNum = surahMatch ? surahMatch[1] : '1';
                        navigate(`/library/kanzul-iman/read?surah=${surahNum}`);
                      } else {
                        navigate(
                          `/library/${bm.bookId}/read?vol=${bm.volumeNumber || 1}&ch=${bm.chapterId}`
                        );
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <span>Continue Reading</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Catalog & Featured View */}
      {activeTab !== 'bookmarks' && (
        <div>
          {((activeTab === 'catalog' && filteredBooks.length === 0) ||
            (activeTab === 'featured' && featuredBooks.length === 0)) ? (
            <div
              className="card"
              style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Search size={36} style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                No Islamic Books Found Matching "{searchQuery}"
              </h3>
              <p style={{ maxWidth: 420, margin: '0 auto var(--space-4)', fontSize: '0.9rem' }}>
                Try searching for author names (e.g. Imam Bukhari, Ahmad Raza), title transliterations,
                or switch category filters.
              </p>
              <button type="button" className="btn btn-primary" onClick={clearSearch}>
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div
              className="library-book-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {(activeTab === 'featured' ? featuredBooks : filteredBooks).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
