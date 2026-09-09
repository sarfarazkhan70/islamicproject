import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { IslamicBook } from '../../types/library.types';

interface BookCardProps {
  book: IslamicBook;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();

  const handleOpenBook = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (book.id === 'kanzul-iman') {
      navigate('/library/kanzul-iman/read?mode=read');
    } else if (book.isAvailable) {
      navigate(`/library/${book.id}/read`);
    } else {
      navigate(`/library/${book.id}`);
    }
  };

  const isAlahazrat =
    book.category === 'alahazrat' ||
    book.id === 'kanzul-iman' ||
    book.id === 'fatawa-razawiyya' ||
    book.id === 'hadaiq-e-bakhshish' ||
    book.author.toLowerCase().includes('ahmad raza');

  const getCategoryLabel = (b: IslamicBook): string => {
    if (b.id === 'kanzul-iman') return 'Quran Translation';
    switch (b.category) {
      case 'hadith':
        return 'Hadith';
      case 'fiqh':
        return 'Fiqh & Masail';
      case 'fatawa':
        return 'Fatawa & Verdicts';
      case 'alahazrat':
        return 'Alahazrat Heritage';
      case 'aqeedah':
        return 'Aqeedah & Beliefs';
      case 'seerat':
        return 'Seerat-un-Nabi ﷺ';
      case 'durood':
        return 'Durood & Salam';
      case 'azkar':
        return 'Azkar & Duas';
      case 'tafseer':
        return 'Tafseer';
      case 'history':
        return 'Islamic History';
      case 'scholars':
        return 'Ulama & Biographies';
      default:
        return 'Islamic Literature';
    }
  };

  const categoryLabel = getCategoryLabel(book);
  const hasMultipleVolumes = Boolean(book.volumeCount && book.volumeCount > 1);

  return (
    <div
      className="book-card card card-hover"
      onClick={handleOpenBook}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: isAlahazrat
          ? '1px solid rgba(245, 158, 11, 0.35)'
          : '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        minHeight: 210,
      }}
    >
      {/* Subtle Top Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor:
            book.accentColor || (isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)'),
        }}
      />

      {/* Main Info Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Top Meta Bar: Category Pill on left, Volumes on right (ONLY if > 1) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-1)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.74rem',
              fontWeight: 'var(--weight-semibold)',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isAlahazrat
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(16, 185, 129, 0.12)',
              color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
            }}
          >
            <span>🏷️</span>
            <span>{categoryLabel}</span>
          </div>

          {hasMultipleVolumes && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.74rem',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span>📚</span>
              <span>{book.volumeCount} Volumes</span>
            </div>
          )}
        </div>

        {/* 📖 Book Title */}
        <div>
          <h3
            style={{
              fontSize: '1.08rem',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              margin: '0 0 3px 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
            }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>📖</span>
            <span>{book.title}</span>
          </h3>

          {book.arabicTitle && (
            <div
              className="font-arabic"
              style={{
                fontSize: '0.92rem',
                color: isAlahazrat ? 'var(--brand-gold)' : 'var(--brand-primary)',
                direction: 'rtl',
                textAlign: 'right',
                lineHeight: 1.3,
                opacity: 0.85,
                marginTop: 2,
              }}
            >
              {book.arabicTitle}
            </div>
          )}
        </div>

        {/* ✍️ Author / Musannif */}
        <div
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            fontWeight: 'var(--weight-medium)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          <span style={{ fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }}>✍️</span>
          <span>{book.author}</span>
        </div>
      </div>

      {/* Primary Action: Read Book */}
      <div
        style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenBook}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '9px 16px',
            fontSize: '0.88rem',
            fontWeight: 'var(--weight-semibold)',
            borderRadius: 'var(--radius-md)',
            boxShadow: isAlahazrat
              ? '0 2px 8px rgba(245, 158, 11, 0.2)'
              : '0 2px 8px rgba(16, 185, 129, 0.2)',
          }}
        >
          <BookOpen size={16} />
          <span>Read Book</span>
        </button>
      </div>
    </div>
  );
};
