import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAzkarStore } from '../../stores/useAzkarStore.js';
import {
  Sun,
  Moon,
  CheckCircle,
  Bed,
  Shield,
  Compass,
  RotateCcw,
  Heart,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';

export const AzkarPage: React.FC = () => {
  const {
    categories,
    items,
    selectedCategory,
    favorites,
    counters,
    digitalTasbeehCount,
    digitalTasbeehTarget,
    searchTerm,
    setSelectedCategory,
    setSearchTerm,
    incrementCounter,
    resetCounter,
    incrementTasbeeh,
    resetTasbeeh,
    setTasbeehTarget,
    toggleFavorite,
  } = useAzkarStore();

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'morning':
        return <Sun size={18} />;
      case 'evening':
        return <Moon size={18} />;
      case 'after-salah':
        return <CheckCircle size={18} />;
      case 'sleep':
        return <Bed size={18} />;
      case 'protection':
        return <Shield size={18} />;
      default:
        return <Compass size={18} />;
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      showOnlyFavorites || selectedCategory === 'all' || item.category === selectedCategory;
    const matchesFav = showOnlyFavorites ? favorites.includes(item.id) : true;
    const matchesSearch = searchTerm.trim()
      ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.arabic.includes(searchTerm)
      : true;

    return matchesCategory && matchesFav && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageHeader
        title="Azkar & Authentic Duas"
        arabicTitle="الأذكار والأدعية"
        subtitle="Daily supplications and remembrances authenticated from the Sahih Sunnah."
        actions={
          <Button
            variant={showOnlyFavorites ? 'gold' : 'outline'}
            size="sm"
            icon={<Heart size={14} />}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            {showOnlyFavorites ? 'Showing Favorites' : `Favorites (${favorites.length})`}
          </Button>
        }
      />

      {/* Digital Tasbeeh Card */}
      <Card
        highlighted
        style={{
          background: 'linear-gradient(135deg, var(--bg-card), rgba(16, 185, 129, 0.06))',
          borderLeft: '4px solid var(--brand-primary)',
        }}
      >
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <span className="label" style={{ color: 'var(--brand-primary)' }}>
              Interactive Digital Tasbeeh
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'var(--weight-extrabold)',
                  color: 'var(--brand-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {digitalTasbeehCount}
              </span>
              <span className="text-secondary text-sm">
                / Target: {digitalTasbeehTarget}
              </span>
              {digitalTasbeehCount >= digitalTasbeehTarget && (
                <Badge variant="emerald">
                  <Check size={12} /> Target Reached!
                </Badge>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              className="btn btn-primary"
              style={{ minWidth: 130, padding: '10px 20px', fontSize: 'var(--text-base)' }}
              onClick={incrementTasbeeh}
            >
              + Tap Tasbeeh
            </button>

            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={resetTasbeeh}
              title="Reset Count"
            >
              Reset
            </Button>

            {/* Target Selectors */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[33, 100].map((t) => (
                <button
                  key={t}
                  className={`btn btn-xs ${digitalTasbeehTarget === t ? 'btn-emerald' : 'btn-ghost'}`}
                  onClick={() => setTasbeehTarget(t)}
                >
                  {t}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Category Pills & Search Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id && !showOnlyFavorites;
              return (
                <button
                  key={cat.id}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setShowOnlyFavorites(false);
                    setSelectedCategory(cat.id);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 240, flex: 1, maxWidth: 320 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Search supplications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Azkar Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredItems.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <Sparkles size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <h4 className="heading-3">No Supplications Found</h4>
            <p className="text-secondary text-xs">
              Try adjusting your category selection or search keywords.
            </p>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const count = counters[item.id] || 0;
            const isCompleted = count >= item.repetitionTarget;
            const isFav = favorites.includes(item.id);

            return (
              <Card
                key={item.id}
                style={{
                  padding: 'var(--space-6)',
                  borderLeft: isCompleted
                    ? '4px solid var(--brand-primary)'
                    : '4px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}
              >
                {/* Header Row */}
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <h4 className="heading-3" style={{ margin: '0 0 4px' }}>
                      {item.title}
                    </h4>
                    <span className="reference-text">{item.reference}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Badge variant={isCompleted ? 'emerald' : 'gray'}>
                      {isCompleted
                        ? `Completed (${count}/${item.repetitionTarget})`
                        : `Target: ${item.repetitionTarget}x (Done: ${count})`}
                    </Badge>

                    <button
                      className="btn-icon btn-icon-sm"
                      onClick={() => toggleFavorite(item.id)}
                      title={isFav ? 'Favorited' : 'Add to Favorites'}
                      style={{ color: isFav ? 'var(--brand-gold)' : undefined }}
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <p
                  className="dua-text"
                  style={{
                    fontSize: '1.6rem',
                    lineHeight: '2.8rem',
                    color: 'var(--text-primary)',
                    textAlign: 'right',
                    margin: '4px 0',
                  }}
                  dir="rtl"
                >
                  {item.arabic}
                </p>

                {/* Transliteration */}
                <p
                  className="text-xs text-secondary"
                  style={{ fontStyle: 'italic', lineHeight: '1.4rem' }}
                >
                  {item.transliteration}
                </p>

                {/* Translation */}
                <p className="translation-text" style={{ fontSize: '0.95rem', margin: 0 }}>
                  "{item.translation}"
                </p>

                {/* Virtue if available */}
                {item.virtue && (
                  <div
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--brand-gold)',
                    }}
                  >
                    <strong>Virtue:</strong> {item.virtue}
                  </div>
                )}

                {/* Bottom Repetition Counter Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button
                      className={`btn btn-sm ${isCompleted ? 'btn-emerald' : 'btn-primary'}`}
                      onClick={() => incrementCounter(item.id, item.repetitionTarget)}
                    >
                      {isCompleted ? <Check size={14} /> : '+ Count'} {count} / {item.repetitionTarget}
                    </button>
                    {count > 0 && (
                      <button
                        className="btn-icon btn-icon-sm"
                        onClick={() => resetCounter(item.id)}
                        title="Reset Counter"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-muted">
                    Recited {count} of {item.repetitionTarget} times
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
