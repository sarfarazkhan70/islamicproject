import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  Search,
} from 'lucide-react';
import { IslamicBook } from '../../types/library.types';
import { SURAHS_LIST } from '../../data/quranData';

interface BookVolumeListProps {
  book: IslamicBook;
}

export const BookVolumeList: React.FC<BookVolumeListProps> = ({ book }) => {
  const navigate = useNavigate();
  const [expandedVolume, setExpandedVolume] = useState<number | null>(1);
  const [surahSearch, setSurahSearch] = useState<string>('');

  const toggleVolume = (volNum: number) => {
    setExpandedVolume((prev) => (prev === volNum ? null : volNum));
  };

  const handleReadChapter = (volNum: number, chapterId: string) => {
    navigate(`/library/${book.id}/read?vol=${volNum}&ch=${chapterId}`);
  };

  const handleReadSurah = (surahNum: number) => {
    navigate(`/library/kanzul-iman/read?surah=${surahNum}`);
  };

  // Dedicated Surah Directory View for Kanzul Iman
  if (book.id === 'kanzul-iman') {
    const filteredSurahs = SURAHS_LIST.filter((s) => {
      if (!surahSearch.trim()) return true;
      const q = surahSearch.trim().toLowerCase();
      return (
        s.number.toString() === q ||
        s.name.toLowerCase().includes(q) ||
        s.arabicName.includes(q) ||
        s.meaning.toLowerCase().includes(q)
      );
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Search Input for Surahs */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="input"
            value={surahSearch}
            onChange={(e) => setSurahSearch(e.target.value)}
            placeholder="Search Surah in Kanzul Iman (e.g. Fatihah, Yasin, Mulk, 67, البقرة)..."
            style={{
              width: '100%',
              paddingLeft: 40,
              height: 42,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        {/* Surah Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          {filteredSurahs.map((s) => (
            <div
              key={s.number}
              className="card card-hover"
              onClick={() => handleReadSurah(s.number)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: 'var(--brand-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'var(--weight-bold)',
                    flexShrink: 0,
                  }}
                >
                  {s.number}
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                    Surah {s.name}
                  </div>
                  <div className="text-xs text-muted">
                    {s.meaning} • {s.versesCount} Ayahs
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  className="font-arabic"
                  style={{
                    fontSize: '1.05rem',
                    color: 'var(--brand-gold)',
                    direction: 'rtl',
                  }}
                >
                  {s.arabicName}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {s.revelationType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If the book has explicit volumes defined:
  if (book.volumes && book.volumes.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {book.volumes.map((vol) => {
          const isExpanded = expandedVolume === vol.volumeNumber;
          const chapters = vol.chapters || [];

          return (
            <div
              key={vol.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                borderColor: isExpanded ? 'var(--brand-primary)' : 'var(--border-subtle)',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              {/* Volume Header Accordion Toggle */}
              <div
                onClick={() => toggleVolume(vol.volumeNumber)}
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isExpanded
                    ? 'var(--bg-surface-elevated)'
                    : 'var(--bg-surface)',
                  borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: '0.9rem',
                    }}
                  >
                    V{vol.volumeNumber}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 'var(--weight-semibold)',
                          color: 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        {vol.title}
                      </h4>
                      {vol.isAvailable ? (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: 10,
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--brand-primary)',
                            fontWeight: 'var(--weight-semibold)',
                          }}
                        >
                          Available
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: 10,
                            backgroundColor: 'var(--bg-surface-elevated)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          In Digitization
                        </span>
                      )}
                    </div>
                    {vol.urduTitle && (
                      <div
                        className="font-urdu"
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--text-secondary)',
                          direction: 'rtl',
                          textAlign: 'left',
                        }}
                      >
                        {vol.urduTitle}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {vol.chaptersCount && (
                    <span className="text-xs text-muted">
                      {vol.chaptersCount} {vol.chaptersCount === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>

              {/* Volume Chapters List */}
              {isExpanded && (
                <div style={{ padding: 'var(--space-3)' }}>
                  {chapters.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                      }}
                    >
                      {chapters.map((ch) => (
                        <div
                          key={ch.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            gap: 'var(--space-2)',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                marginBottom: 2,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 'var(--weight-bold)',
                                  color: 'var(--brand-primary)',
                                }}
                              >
                                Ch {ch.chapterNumber}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.9rem',
                                  fontWeight: 'var(--weight-semibold)',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {ch.title}
                              </span>
                            </div>

                            {ch.arabicTitle && (
                              <div
                                className="font-arabic"
                                style={{
                                  fontSize: '0.88rem',
                                  color: 'var(--text-secondary)',
                                  direction: 'rtl',
                                  textAlign: 'right',
                                }}
                              >
                                {ch.arabicTitle}
                              </div>
                            )}

                            {ch.urduTitle && (
                              <div
                                className="font-urdu"
                                style={{
                                  fontSize: '0.82rem',
                                  color: 'var(--text-muted)',
                                  direction: 'rtl',
                                  textAlign: 'right',
                                }}
                              >
                                {ch.urduTitle}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleReadChapter(vol.volumeNumber, ch.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.78rem',
                              flexShrink: 0,
                            }}
                          >
                            <BookOpen size={13} />
                            <span>Read</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 'var(--space-4)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <Clock size={20} style={{ margin: '0 auto var(--space-2)', opacity: 0.6 }} />
                      <p>Digitized text for this volume is currently in compilation.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: If book only has sample chapters or single volume structure:
  if (book.sampleChapters && book.sampleChapters.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {book.sampleChapters.map((ch) => (
          <div
            key={ch.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--brand-primary)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  Section {ch.chapterNumber}
                </span>
                <h4
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {ch.title}
                </h4>
              </div>

              {ch.arabicTitle && (
                <div
                  className="font-arabic"
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--brand-gold)',
                    direction: 'rtl',
                    textAlign: 'right',
                    marginBottom: 2,
                  }}
                >
                  {ch.arabicTitle}
                </div>
              )}

              {ch.urduTitle && (
                <div
                  className="font-urdu"
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    direction: 'rtl',
                    textAlign: 'right',
                  }}
                >
                  {ch.urduTitle}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => handleReadChapter(1, ch.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.82rem',
                flexShrink: 0,
              }}
            >
              <BookOpen size={14} />
              <span>Read</span>
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-6)',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}
    >
      <Clock size={28} style={{ margin: '0 auto var(--space-3)', opacity: 0.5 }} />
      <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        Digital Volume Edition in Preparation
      </h4>
      <p style={{ fontSize: '0.88rem', maxWidth: 460, margin: '0 auto' }}>
        Verified manuscripts and chapters for {book.title} ({book.volumeCount} Volumes) are being
        digitized into high-accuracy multi-lingual formats.
      </p>
    </div>
  );
};
