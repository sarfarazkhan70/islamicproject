import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Sparkles,
  Search,
  Copy,
  Check,
} from 'lucide-react';
import { getBookById, getBookVolumes } from '../../data/libraryData';
import { useLibraryStore, ReaderFontSize } from '../../stores/useLibraryStore';
import { BookChapter, BookSection } from '../../types/library.types';
import { KanzulImanReader } from '../../components/library/KanzulImanReader';
import { BukhariReader } from '../../components/library/BukhariReader';
import { MuslimReader } from '../../components/library/MuslimReader';
import { TirmiziReader } from '../../components/library/TirmiziReader';
import { HadaiqReader } from '../../components/library/HadaiqReader';
import { HadaiqHindiReader } from '../../components/library/HadaiqHindiReader';
import { HadaiqEnglishReader } from '../../components/library/HadaiqEnglishReader';

export const BookReaderPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // If Kanzul Iman, render the dedicated Quran + Kanzul Iman Reader
  if (bookId === 'kanzul-iman') {
    return <KanzulImanReader />;
  }

  // If Sahih al-Bukhari, render the dedicated authentic 9-volume PDF-style reader
  if (bookId === 'sahih-al-bukhari') {
    return <BukhariReader />;
  }

  // If Sahih Muslim
  if (bookId === 'sahih-muslim') {
    return <MuslimReader />;
  }

  // If Jami' at-Tirmidhi
  if (
    bookId === 'jami-at-tirmidhi' ||
    bookId === 'jami-tirmizi' ||
    bookId === 'tirmizi' ||
    bookId === 'sunan-at-tirmidhi'
  ) {
    return <TirmiziReader />;
  }

  // If Hadaiq-e-Bakhshish Hindi edition
  if (
    bookId === 'hadaiq-e-bakhshish-hindi' ||
    (bookId === 'hadaiq-e-bakhshish' && (searchParams.get('lang') === 'hindi' || searchParams.get('lang') === 'hi'))
  ) {
    return <HadaiqHindiReader />;
  }

  // If Hadaiq-e-Bakhshish English edition
  if (
    bookId === 'hadaiq-e-bakhshish-english' ||
    (bookId === 'hadaiq-e-bakhshish' && (searchParams.get('lang') === 'english' || searchParams.get('lang') === 'en'))
  ) {
    return <HadaiqEnglishReader />;
  }

  // If Hadaiq-e-Bakhshish (Urdu edition), render the authentic Hadaiq Urdu PDF Reader with Naat Index
  if (bookId === 'hadaiq-e-bakhshish') {
    return <HadaiqReader />;
  }

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inBookSearch, setInBookSearch] = useState('');
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    readerFontSize,
    setReaderFontSize,
    showArabic,
    showUrdu,
    showEnglish,
    toggleArabic,
    toggleUrdu,
    toggleEnglish,
    bookmarks,
    addBookmark,
    removeBookmark,
    saveReadingProgress,
  } = useLibraryStore();

  const book = bookId ? getBookById(bookId) : undefined;

  // Derive active volume and chapter
  const volParam = searchParams.get('vol');
  const chParam = searchParams.get('ch');

  const activeVolNum = volParam ? parseInt(volParam, 10) : 1;
  const bookVolumes = useMemo(() => (book ? getBookVolumes(book) : []), [book]);

  // Collect all available chapters for this volume
  const allChapters: BookChapter[] = useMemo(() => {
    if (!book) return [];
    const vol = bookVolumes.find((v) => v.volumeNumber === activeVolNum) || bookVolumes[0];
    if (vol?.chapters && vol.chapters.length > 0) {
      return vol.chapters;
    }
    if (book.sampleChapters && book.sampleChapters.length > 0) {
      const volChapters = book.sampleChapters.filter((c: BookChapter) => c.volumeNumber === activeVolNum);
      if (volChapters.length > 0) return volChapters;
      return book.sampleChapters;
    }
    return [];
  }, [book, bookVolumes, activeVolNum]);

  // Current active chapter
  const activeChapter: BookChapter | undefined = useMemo(() => {
    if (!allChapters || allChapters.length === 0) return undefined;
    if (chParam) {
      const found = allChapters.find((c: BookChapter) => c.id === chParam);
      if (found) return found;
    }
    return allChapters[0];
  }, [allChapters, chParam]);

  // Save progress whenever active chapter changes
  useEffect(() => {
    if (book && activeChapter) {
      saveReadingProgress(book.id, activeVolNum, activeChapter.id);
    }
  }, [book, activeVolNum, activeChapter, saveReadingProgress]);

  // Current chapter index for Prev/Next
  const currentChapterIndex = useMemo(() => {
    if (!activeChapter || !allChapters) return -1;
    return allChapters.findIndex((c: BookChapter) => c.id === activeChapter.id);
  }, [allChapters, activeChapter]);

  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex >= 0 && currentChapterIndex < allChapters.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      const prevCh = allChapters[currentChapterIndex - 1];
      setSearchParams({ vol: activeVolNum.toString(), ch: prevCh.id });
      setInBookSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextCh = allChapters[currentChapterIndex + 1];
      setSearchParams({ vol: activeVolNum.toString(), ch: nextCh.id });
      setInBookSearch('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setSearchParams({ vol: newVol.toString() });
    setInBookSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentChapterBookmarked = useMemo(() => {
    if (!book || !activeChapter) return false;
    return bookmarks.some(
      (b) => b.bookId === book.id && b.chapterId === activeChapter.id && !b.sectionId
    );
  }, [bookmarks, book, activeChapter]);

  const handleToggleBookmark = (section?: BookSection) => {
    if (!book || !activeChapter) return;

    const existing = bookmarks.find(
      (b) =>
        b.bookId === book.id &&
        b.chapterId === activeChapter.id &&
        (section ? b.sectionId === section.id : !b.sectionId)
    );

    if (existing) {
      removeBookmark(existing.id);
      showToast('Bookmark removed');
    } else {
      addBookmark({
        bookId: book.id,
        bookTitle: book.title,
        author: book.compiler || book.author,
        volumeNumber: activeVolNum,
        chapterId: activeChapter.id,
        chapterTitle: activeChapter.title,
        sectionId: section?.id,
        snippet:
          section?.arabicText?.slice(0, 70) ||
          section?.urduText?.slice(0, 70) ||
          section?.englishText?.slice(0, 70) ||
          activeChapter.title,
      });
      showToast('Saved to Library Bookmarks');
    }
  };

  const handleCopySection = (sec: BookSection) => {
    let text = `${sec.title}\n`;
    if (sec.narrator) text += `Narrator: ${sec.narrator}\n`;
    if (sec.arabicText) text += `\n${sec.arabicText}\n`;
    if (sec.urduText) text += `\nاردو: ${sec.urduText}\n`;
    if (sec.englishText) text += `\nEnglish: ${sec.englishText}\n`;
    if (sec.ruling) text += `\nFiqh Ruling: ${sec.ruling}\n`;
    if (sec.reference) text += `\nReference: ${sec.reference}\n`;
    text += `\n[${book?.title} - Ch ${activeChapter?.chapterNumber}]`;

    navigator.clipboard.writeText(text);
    setCopiedSectionId(sec.id);
    showToast('Section text copied to clipboard');
    setTimeout(() => setCopiedSectionId(null), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (!book) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <BookOpen size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }} />
        <h2>Book Not Found</h2>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 'var(--space-4)' }}
          onClick={() => navigate('/library')}
        >
          Back to Library
        </button>
      </div>
    );
  }

  // Filter sections by in-book search query
  const filteredSections = useMemo(() => {
    const rawSections = activeChapter?.sections || [];
    if (!inBookSearch.trim()) return rawSections;
    const q = inBookSearch.trim().toLowerCase();
    return rawSections.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchUrdu = s.urduText ? s.urduText.includes(q) : false;
      const matchArabic = s.arabicText ? s.arabicText.includes(q) : false;
      const matchEng = s.englishText ? s.englishText.toLowerCase().includes(q) : false;
      const matchNarrator = s.narrator ? s.narrator.toLowerCase().includes(q) : false;
      const matchRuling = s.ruling ? s.ruling.toLowerCase().includes(q) : false;
      const matchFaida = s.faida ? s.faida.toLowerCase().includes(q) : false;
      return (
        matchTitle ||
        matchUrdu ||
        matchArabic ||
        matchEng ||
        matchNarrator ||
        matchRuling ||
        matchFaida
      );
    });
  }, [activeChapter, inBookSearch]);

  // Dynamic font sizing styles
  const arabicFontSizeMap: Record<ReaderFontSize, string> = {
    sm: '1.25rem',
    base: '1.5rem',
    lg: '1.8rem',
    xl: '2.15rem',
  };

  const translationFontSizeMap: Record<ReaderFontSize, string> = {
    sm: '0.9rem',
    base: '1.02rem',
    lg: '1.16rem',
    xl: '1.3rem',
  };

  const isAlahazrat =
    book.category === 'alahazrat' ||
    book.tradition.toLowerCase().includes('alahazrat') ||
    book.author.toLowerCase().includes('ahmad raza');

  return (
    <div className="book-reader-container" style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.88rem',
            border: isAlahazrat
              ? '1px solid rgba(245, 158, 11, 0.4)'
              : '1px solid rgba(16, 185, 129, 0.4)',
          }}
        >
          <Sparkles size={16} style={{ color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader Top Sticky Navbar */}
      <div
        className="card"
        style={{
          position: 'sticky',
          top: 10,
          zIndex: 40,
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          border: isAlahazrat
            ? '1px solid rgba(245, 158, 11, 0.3)'
            : '1px solid var(--border-subtle)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn-icon btn-icon-sm"
            onClick={() => navigate(`/library/${book.id}`)}
            title="Back to Book Details"
            aria-label="Back to Book Details"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h2
              style={{
                fontSize: '0.95rem',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {book.title}
            </h2>
            <div className="text-xs text-muted">
              {book.volumeCount > 1 ? `Vol ${activeVolNum} • ` : ''}
              {activeChapter?.title || 'Reading'}
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Volume Dropdown if multiple volumes */}
          {book.volumes && book.volumes.length > 1 && (
            <select
              className="select"
              value={activeVolNum}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              style={{
                fontSize: '0.78rem',
                padding: '4px 6px',
                height: 34,
                maxWidth: 100,
              }}
            >
              {book.volumes.map((v) => (
                <option key={v.id} value={v.volumeNumber}>
                  Vol {v.volumeNumber}
                </option>
              ))}
            </select>
          )}

          {/* Chapter Selector Dropdown */}
          {allChapters.length > 1 && (
            <select
              className="select"
              value={activeChapter?.id || ''}
              onChange={(e) => {
                setSearchParams({ vol: activeVolNum.toString(), ch: e.target.value });
                setInBookSearch('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                fontSize: '0.78rem',
                padding: '4px 8px',
                height: 34,
                maxWidth: 150,
              }}
            >
              {allChapters.map((ch: BookChapter) => (
                <option key={ch.id} value={ch.id}>
                  Ch {ch.chapterNumber}: {ch.title}
                </option>
              ))}
            </select>
          )}

          {/* Bookmark Current Chapter */}
          <button
            type="button"
            className="btn-icon btn-icon-sm"
            onClick={() => handleToggleBookmark()}
            title={isCurrentChapterBookmarked ? 'Remove Bookmark' : 'Bookmark Chapter'}
            aria-label="Bookmark Chapter"
            style={{
              color: isCurrentChapterBookmarked
                ? 'var(--brand-gold)'
                : 'var(--text-secondary)',
            }}
          >
            {isCurrentChapterBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>

          {/* Settings Toggle */}
          <button
            type="button"
            className="btn-icon btn-icon-sm"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Reader Display Settings"
            aria-label="Reader Display Settings"
            style={{
              color: isSettingsOpen ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Reader Settings Drawer */}
      {isSettingsOpen && (
        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-3)',
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'var(--weight-semibold)', margin: 0 }}>
              Reader Display Preferences
            </h4>
            <span className="text-xs text-muted">Auto-saved</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Font Size Selector */}
            <div>
              <div className="text-xs text-muted" style={{ marginBottom: 6 }}>
                Font Size:
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['sm', 'base', 'lg', 'xl'] as ReaderFontSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setReaderFontSize(size)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 'var(--radius-sm)',
                      border:
                        readerFontSize === size
                          ? '1px solid var(--brand-primary)'
                          : '1px solid var(--border-subtle)',
                      backgroundColor:
                        readerFontSize === size
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'var(--bg-surface)',
                      color:
                        readerFontSize === size
                          ? 'var(--brand-primary)'
                          : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: readerFontSize === size ? 600 : 400,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Visibility Toggles */}
            <div>
              <div className="text-xs text-muted" style={{ marginBottom: 6 }}>
                Display Languages:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={toggleArabic}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: showArabic
                      ? '1px solid var(--brand-primary)'
                      : '1px solid var(--border-subtle)',
                    backgroundColor: showArabic
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'var(--bg-surface)',
                    color: showArabic ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Arabic {showArabic ? '✓' : ''}
                </button>

                <button
                  type="button"
                  onClick={toggleUrdu}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: showUrdu
                      ? '1px solid var(--brand-primary)'
                      : '1px solid var(--border-subtle)',
                    backgroundColor: showUrdu
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'var(--bg-surface)',
                    color: showUrdu ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Urdu {showUrdu ? '✓' : ''}
                </button>

                <button
                  type="button"
                  onClick={toggleEnglish}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: showEnglish
                      ? '1px solid var(--brand-primary)'
                      : '1px solid var(--border-subtle)',
                    backgroundColor: showEnglish
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'var(--bg-surface)',
                    color: showEnglish ? 'var(--brand-primary)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  English {showEnglish ? '✓' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chapter Content View */}
      {activeChapter ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Multi-Volume Quick Switcher Pills */}
          {bookVolumes.length > 1 && (
            <div
              className="card"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                overflowX: 'auto',
                scrollbarWidth: 'thin',
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Select Jild:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                {bookVolumes.map((vol) => {
                  const isCurrent = vol.volumeNumber === activeVolNum;
                  return (
                    <button
                      key={vol.id}
                      type="button"
                      onClick={() => handleVolumeChange(vol.volumeNumber)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: isCurrent
                          ? isAlahazrat
                            ? '1px solid var(--brand-gold)'
                            : '1px solid var(--brand-primary)'
                          : '1px solid var(--border-subtle)',
                        backgroundColor: isCurrent
                          ? isAlahazrat
                            ? 'rgba(245, 158, 11, 0.18)'
                            : 'rgba(16, 185, 129, 0.18)'
                          : 'var(--bg-surface-elevated)',
                        color: isCurrent
                          ? isAlahazrat
                            ? 'var(--brand-gold)'
                            : 'var(--brand-primary)'
                          : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: isCurrent ? 'var(--weight-bold)' : 'var(--weight-normal)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      Jild {vol.volumeNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chapter Header Banner */}
          <div
            className="card"
            style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: isAlahazrat
                ? '1px solid rgba(245, 158, 11, 0.25)'
                : '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 'var(--weight-semibold)',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isAlahazrat
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(16, 185, 129, 0.12)',
                color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                display: 'inline-block',
                marginBottom: 'var(--space-2)',
              }}
            >
              {book.volumeCount > 1 ? `Volume ${activeVolNum} • ` : ''}Chapter {activeChapter.chapterNumber}
            </span>

            <h2
              style={{
                fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
                marginBottom: 6,
              }}
            >
              {activeChapter.title}
            </h2>

            {showArabic && activeChapter.arabicTitle && (
              <div
                className="font-arabic"
                style={{
                  fontSize: arabicFontSizeMap[readerFontSize],
                  color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                  direction: 'rtl',
                  textAlign: 'center',
                  marginBottom: 6,
                  lineHeight: 1.6,
                }}
              >
                {activeChapter.arabicTitle}
              </div>
            )}

            {showUrdu && activeChapter.urduTitle && (
              <div
                className="font-urdu"
                style={{
                  fontSize: translationFontSizeMap[readerFontSize],
                  color: 'var(--text-secondary)',
                  direction: 'rtl',
                  textAlign: 'center',
                }}
              >
                {activeChapter.urduTitle}
              </div>
            )}
          </div>

          {/* Search inside this chapter */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="input"
              value={inBookSearch}
              onChange={(e) => setInBookSearch(e.target.value)}
              placeholder={`Search in ${activeChapter.title} (Hadith, rulings, Arabic, Urdu)...`}
              style={{
                width: '100%',
                paddingLeft: 38,
                height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
              }}
            />
          </div>

          {/* Sections / Hadith List */}
          {filteredSections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filteredSections.map((sec, idx) => {
                const isSecBookmarked = bookmarks.some(
                  (b) =>
                    b.bookId === book.id &&
                    b.chapterId === activeChapter.id &&
                    b.sectionId === sec.id
                );

                return (
                  <div
                    key={sec.id}
                    className="card"
                    style={{
                      padding: 'var(--space-6)',
                      backgroundColor: 'var(--bg-surface)',
                      position: 'relative',
                      border: isSecBookmarked
                        ? isAlahazrat
                          ? '1px solid var(--brand-gold)'
                          : '1px solid var(--brand-primary)'
                        : '1px solid var(--border-subtle)',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    {/* Section Top Header & Numbering */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-subtle)',
                        paddingBottom: 'var(--space-2)',
                        marginBottom: 'var(--space-4)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 'var(--weight-bold)',
                            color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                          }}
                        >
                          {sec.hadithNumber ? `Hadith #${sec.hadithNumber}` : `Section #${idx + 1}`}
                        </span>

                        {sec.narrator && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              padding: '1px 8px',
                              borderRadius: 4,
                            }}
                          >
                            Narrator: {sec.narrator}
                          </span>
                        )}

                        {sec.grade && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--brand-gold)',
                              backgroundColor: 'rgba(245, 158, 11, 0.12)',
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontWeight: 600,
                            }}
                          >
                            {sec.grade}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          className="btn-icon btn-icon-sm"
                          onClick={() => handleCopySection(sec)}
                          title="Copy Section Text"
                          aria-label="Copy Section Text"
                        >
                          {copiedSectionId === sec.id ? (
                            <Check size={15} style={{ color: 'var(--brand-primary)' }} />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn-icon btn-icon-sm"
                          onClick={() => handleToggleBookmark(sec)}
                          title={isSecBookmarked ? 'Remove Bookmark' : 'Bookmark Section'}
                          aria-label="Bookmark Section"
                          style={{
                            color: isSecBookmarked
                              ? isAlahazrat
                                ? 'var(--brand-gold)'
                                : 'var(--brand-primary)'
                              : 'var(--text-muted)',
                          }}
                        >
                          {isSecBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text Block */}
                    {showArabic && sec.arabicText && (
                      <div
                        className="font-arabic"
                        style={{
                          fontSize: arabicFontSizeMap[readerFontSize],
                          color: 'var(--text-primary)',
                          direction: 'rtl',
                          textAlign: 'right',
                          lineHeight: 1.85,
                          marginBottom: 'var(--space-4)',
                          padding: 'var(--space-2) 0',
                          fontWeight: 500,
                        }}
                      >
                        {sec.arabicText}
                      </div>
                    )}

                    {/* Urdu Translation Block */}
                    {showUrdu && sec.urduText && (
                      <div
                        className="font-urdu"
                        style={{
                          fontSize: translationFontSizeMap[readerFontSize],
                          color: isAlahazrat ? 'var(--brand-gold)' : 'var(--text-secondary)',
                          direction: 'rtl',
                          textAlign: 'right',
                          lineHeight: 1.8,
                          marginBottom: 'var(--space-3)',
                          paddingTop: showArabic ? 'var(--space-2)' : 0,
                          borderTop: showArabic ? '1px dashed var(--border-subtle)' : 'none',
                        }}
                      >
                        {sec.urduText}
                      </div>
                    )}

                    {/* English Translation Block */}
                    {showEnglish && sec.englishText && (
                      <div
                        style={{
                          fontSize: translationFontSizeMap[readerFontSize],
                          color: 'var(--text-primary)',
                          lineHeight: 1.6,
                          marginBottom: 'var(--space-3)',
                          paddingTop: showUrdu || showArabic ? 'var(--space-2)' : 0,
                          borderTop:
                            showUrdu || showArabic
                              ? '1px dashed var(--border-subtle)'
                              : 'none',
                        }}
                      >
                        {sec.englishText}
                      </div>
                    )}

                    {/* Jurisprudence Ruling / Faida / Reference */}
                    {(sec.ruling || sec.faida || sec.reference) && (
                      <div
                        style={{
                          marginTop: 'var(--space-3)',
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        {sec.ruling && (
                          <div>
                            <strong style={{ color: 'var(--brand-gold)' }}>
                              Fiqh Ruling / فتویٰ:
                            </strong>{' '}
                            {sec.ruling}
                          </div>
                        )}
                        {sec.faida && (
                          <div>
                            <strong style={{ color: 'var(--brand-primary)' }}>Benefit / فائدة:</strong>{' '}
                            {sec.faida}
                          </div>
                        )}
                        {sec.reference && (
                          <div className="text-xs text-muted">Reference: {sec.reference}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              {inBookSearch ? (
                <>
                  <p>No sections found matching "{inBookSearch}".</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => setInBookSearch('')}
                    style={{ marginTop: 'var(--space-2)' }}
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <p>Digitized text for this specific chapter is currently being compiled.</p>
              )}
            </div>
          )}

          {/* Bottom Pagination: Previous & Next Chapter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'var(--space-4)',
              paddingBottom: 'var(--space-8)',
              gap: 'var(--space-3)',
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={handlePrev}
              disabled={!hasPrev}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: hasPrev ? 1 : 0.4,
                cursor: hasPrev ? 'pointer' : 'not-allowed',
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous Chapter</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!hasNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: hasNext ? 1 : 0.4,
                cursor: hasNext ? 'pointer' : 'not-allowed',
              }}
            >
              <span>Next Chapter</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: 'var(--space-8)',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <BookOpen size={36} style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }} />
          <h3>No Available Chapters Found</h3>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-3)' }}
            onClick={() => navigate(`/library/${book.id}`)}
          >
            Back to Book Overview
          </button>
        </div>
      )}
    </div>
  );
};
