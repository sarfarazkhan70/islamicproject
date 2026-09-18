import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import { IslamicBook } from '../../types/library.types';

interface BookCardProps {
  book: IslamicBook;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();

  const isAlahazrat =
    book.category === 'alahazrat' ||
    book.id === 'kanzul-iman' ||
    book.id === 'fatawa-razawiyya' ||
    book.id === 'hadaiq-e-bakhshish' ||
    book.id === 'hadaiq-e-bakhshish-hindi' ||
    book.author.toLowerCase().includes('ahmad raza');

  const handleOpenBook = () => {
    if (book.id === 'kanzul-iman') {
      navigate('/library/kanzul-iman/read?mode=read');
    } else if (book.id === 'fatawa-razawiyya' || book.id === 'fatawa-e-razviya') {
      navigate('/library/fatawa-razawiyya');
    } else if (book.id === 'sahih-al-bukhari') {
      navigate('/library/sahih-al-bukhari');
    } else if (book.id === 'hadaiq-e-bakhshish') {
      navigate('/library/hadaiq-e-bakhshish');
    } else if (book.id === 'hadaiq-e-bakhshish-hindi') {
      navigate('/library/hadaiq-e-bakhshish-hindi/read');
    } else {
      navigate(`/library/${book.id}`);
    }
  };

  return (
    <div
      className="book-card card card-hover"
      onClick={handleOpenBook}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--space-6) var(--space-4) var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        border: isAlahazrat
          ? '1px solid rgba(245, 158, 11, 0.35)'
          : '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
      }}
    >
      {/* Top Subtle Accent Bar */}
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

      {/* Book Cover / Emblem Box (Clean icon emblem, no images on main library cards) */}
      <div
        style={{
          width: 86,
          height: 118,
          borderRadius: 'var(--radius-md)',
          background: `linear-gradient(145deg, ${book.coverColor || '#064e3b'} 0%, #0f172a 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 18px -3px rgba(0, 0, 0, 0.35)',
          border: isAlahazrat
            ? '1px solid rgba(245, 158, 11, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.15)',
          color: isAlahazrat ? 'var(--brand-gold)' : '#fff',
          marginBottom: 'var(--space-4)',
          flexShrink: 0,
        }}
      >
        <BookOpen size={36} style={{ opacity: 0.95 }} />
      </div>

      {/* Book Name */}
      <h3
        style={{
          fontSize: '1.08rem',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          margin: '0 0 var(--space-1) 0',
        }}
      >
        {book.title}
      </h3>

      {/* Arabic/Urdu Subtitle for special books */}
      {book.id === 'hadaiq-e-bakhshish' && (
        <div
          className="font-urdu text-xs"
          style={{ color: 'var(--brand-gold)', marginBottom: 4, fontWeight: 'bold' }}
        >
          حدائقِ بخشش (اردو و ہندی)
        </div>
      )}

      {/* Writer Name */}
      <p
        style={{
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.4,
          fontWeight: 'var(--weight-normal)',
        }}
      >
        <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
          Writer Name:
        </span>{' '}
        {book.author}
      </p>

      {/* Edition Tag for Hadaiq */}
      {book.id === 'hadaiq-e-bakhshish' && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--brand-gold)',
            fontSize: '0.72rem',
            fontWeight: 600,
          }}
        >
          <Sparkles size={11} />
          <span>Urdu & Hindi Editions</span>
        </div>
      )}
    </div>
  );
};


