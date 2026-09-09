import React from 'react';
import {
  Library,
  BookOpen,
  Scale,
  FileText,
  Sparkles,
  Shield,
  Heart,
  Scroll,
  History,
  GraduationCap,
  Bookmark,
} from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { LibraryCategory } from '../../types/library.types';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Library,
  BookOpen,
  Scale,
  FileText,
  Sparkles,
  Shield,
  Heart,
  Scroll,
  History,
  GraduationCap,
  Bookmark,
};

export const CategoryFilterPills: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, books } = useLibraryStore();

  const getCountForCategory = (catId: LibraryCategory) => {
    if (catId === 'all') return books.length;
    return books.filter((b) => b.category === catId).length;
  };

  return (
    <div
      className="category-pills-container"
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        overflowX: 'auto',
        paddingBottom: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        scrollbarWidth: 'thin',
      }}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const IconComponent = CATEGORY_ICONS[cat.iconName] || BookOpen;
        const count = getCountForCategory(cat.id);
        const isAlahazrat = cat.id === 'alahazrat';

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`category-pill ${isSelected ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: isSelected
                ? isAlahazrat
                  ? '1px solid var(--brand-gold)'
                  : '1px solid var(--brand-primary)'
                : '1px solid var(--border-subtle)',
              backgroundColor: isSelected
                ? isAlahazrat
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)'
                : 'var(--bg-surface)',
              color: isSelected
                ? isAlahazrat
                  ? 'var(--brand-gold)'
                  : 'var(--brand-primary)'
                : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              fontWeight: isSelected ? 'var(--weight-semibold)' : 'var(--weight-normal)',
              transition: 'all var(--transition-normal)',
              flexShrink: 0,
            }}
          >
            <IconComponent size={16} />
            <span>{cat.name}</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: 10,
                backgroundColor: isSelected
                  ? isAlahazrat
                    ? 'var(--brand-gold)'
                    : 'var(--brand-primary)'
                  : 'var(--bg-surface-elevated)',
                color: isSelected ? '#000' : 'var(--text-muted)',
                fontWeight: 'var(--weight-bold)',
                marginLeft: 2,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
