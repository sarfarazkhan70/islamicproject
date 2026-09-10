import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Search,
} from 'lucide-react';
import { IslamicBook, BookChapter } from '../../types/library.types';
import { SURAHS_LIST } from '../../data/quranData';
import { getBookVolumes } from '../../data/libraryData';

interface BookVolumeListProps {
  book: IslamicBook;
}

export const BookVolumeList: React.FC<BookVolumeListProps> = ({ book }) => {
  const navigate = useNavigate();
  const [expandedVolume, setExpandedVolume] = useState<number | null>(null);
  const [surahSearch, setSurahSearch] = useState<string>('');

  const toggleVolume = (volNum: number) => {
    setExpandedVolume((prev) => (prev === volNum ? null : volNum));
  };

  const handleReadVolume = (volNum: number) => {
    if (book.id === 'kanzul-iman') {
      navigate('/library/kanzul-iman/read?mode=read');
    } else {
      navigate(`/library/${book.id}/read?vol=${volNum}`);
    }
  };

  const handleReadChapter = (volNum: number, chapterId: string) => {
    navigate(`/library/${book.id}/read?vol=${volNum}&ch=${chapterId}`);
  };

  const handleReadSurah = (surahNum: number) => {
    navigate(`/library/kanzul-iman/read?surah=${surahNum}`);
  };

  const isAlahazrat =
    book.category === 'alahazrat' ||
    book.id === 'kanzul-iman' ||
    book.id === 'fatawa-razawiyya' ||
    book.id === 'hadaiq-e-bakhshish' ||
    book.author.toLowerCase().includes('ahmad raza');

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

  // Get complete list of authentic volumes for this book
  const volumes = getBookVolumes(book);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {volumes.map((vol) => {
        const isExpanded = expandedVolume === vol.volumeNumber;
        const volumeChapters: BookChapter[] =
          vol.chapters ||
          (book.sampleChapters &&
            book.sampleChapters.filter((c: BookChapter) => c.volumeNumber === vol.volumeNumber)) ||
          [];

        const hasChapters = volumeChapters.length > 0;

        return (
          <div
            key={vol.id}
            className="card card-hover"
            style={{
              padding: 0,
              overflow: 'hidden',
              borderColor: isExpanded ? (isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)') : 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            {/* Volume Main Row */}
            <div
              style={{
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
                backgroundColor: isExpanded
                  ? 'var(--bg-surface-elevated)'
                  : 'var(--bg-surface)',
                borderBottom: isExpanded && hasChapters ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Left Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  flex: '1 1 280px',
                  minWidth: 260,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isAlahazrat
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(16, 185, 129, 0.15)',
                    color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'var(--weight-bold)',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    border: isAlahazrat
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Jild</span>
                  <span>{vol.volumeNumber}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <h4
                      style={{
                        fontSize: '1rem',
                        fontWeight: 'var(--weight-bold)',
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {vol.title.startsWith('Jild') || vol.title.startsWith('Volume')
                        ? vol.title
                        : `Jild ${vol.volumeNumber}: ${vol.title}`}
                    </h4>
                  </div>

                  {vol.urduTitle && (
                    <div
                      className="font-urdu"
                      style={{
                        fontSize: '0.92rem',
                        color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                        direction: 'rtl',
                        textAlign: 'left',
                        marginTop: 2,
                      }}
                    >
                      {vol.urduTitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Actions: Read Complete Jild Button + Chapter Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReadVolume(vol.volumeNumber)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 'var(--weight-semibold)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: isAlahazrat
                      ? '0 2px 8px rgba(245, 158, 11, 0.2)'
                      : '0 2px 8px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <BookOpen size={15} />
                  <span>Read Jild {vol.volumeNumber} (جلد {vol.volumeNumber} پڑھیں)</span>
                </button>

                {hasChapters && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => toggleVolume(vol.volumeNumber)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                    }}
                    title={isExpanded ? 'Collapse Chapters' : 'View Chapters'}
                  >
                    <span>{volumeChapters.length} {volumeChapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Volume Chapters Sub-list if expanded */}
            {isExpanded && hasChapters && (
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  {volumeChapters.map((ch) => (
                    <div
                      key={ch.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface-elevated)',
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
                              color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
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
                        className="btn btn-sm btn-outline"
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
                        <span>Read Chapter</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
