import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  NAMAZ_KE_BAAD_DUA,
  QURANI_DUAS,
  DUA_SECTIONS,
  DuaItem,
} from '../../data/duaData.js';
import {
  Heart,
  Search,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Bookmark,
  Sun,
  Layers,
  ZoomIn,
} from 'lucide-react';

export const AzkarPage: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<'all' | 'namaz-ke-baad' | 'qurani-duain'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'standard' | 'large' | 'xlarge'>('large');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('islamic_prayer_dua_favorites');
      return raw ? JSON.parse(raw) : ['dua-namaz-baad-1', 'qurani-dua-1'];
    } catch {
      return ['dua-namaz-baad-1'];
    }
  });

  const toggleFavorite = (id: string) => {
    const isFav = favorites.includes(id);
    const updated = isFav ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(updated);
    try {
      localStorage.setItem('islamic_prayer_dua_favorites', JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  };

  const handleCopyDua = (item: DuaItem) => {
    const textToCopy = `${item.arabic}\n\n[${item.reference}]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  };

  // Font size mapping for comfortable reading
  const getArabicStyle = () => {
    switch (fontSizeLevel) {
      case 'standard':
        return { fontSize: '1.5rem', lineHeight: '2.4rem' };
      case 'large':
        return { fontSize: '1.85rem', lineHeight: '2.85rem' };
      case 'xlarge':
        return { fontSize: '2.2rem', lineHeight: '3.3rem' };
      default:
        return { fontSize: '1.85rem', lineHeight: '2.85rem' };
    }
  };

  // Filter items based on search and favorites
  const matchesSearch = (item: DuaItem) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      (item.surahName && item.surahName.toLowerCase().includes(q)) ||
      (item.ayahReference && item.ayahReference.includes(q)) ||
      item.arabic.includes(searchTerm)
    );
  };

  const showSection1 =
    (selectedSection === 'all' || selectedSection === 'namaz-ke-baad') &&
    matchesSearch(NAMAZ_KE_BAAD_DUA) &&
    (!showOnlyFavorites || favorites.includes(NAMAZ_KE_BAAD_DUA.id));

  const filteredQuraniDuas = QURANI_DUAS.filter((dua) => {
    const sectionMatch = selectedSection === 'all' || selectedSection === 'qurani-duain';
    const favMatch = showOnlyFavorites ? favorites.includes(dua.id) : true;
    return sectionMatch && favMatch && matchesSearch(dua);
  });

  const totalVisibleCount = (showSection1 ? 1 : 0) + filteredQuraniDuas.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <PageHeader
        title="Masnoon & Qurani Duain"
        arabicTitle="الأدعية المأثورة والقرآنية"
        subtitle="Authentic supplications from the Holy Quran and Sunnah with complete verified references."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button
              variant={showOnlyFavorites ? 'gold' : 'outline'}
              size="sm"
              icon={<Heart size={14} fill={showOnlyFavorites ? 'currentColor' : 'none'} />}
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            >
              {showOnlyFavorites ? 'Showing Favorites' : `Favorites (${favorites.length})`}
            </Button>
          </div>
        }
      />

      {/* Control Bar: Categories, Search, Font Size */}
      <Card
        style={{
          padding: 'var(--space-4)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          {/* Section Selector Pills */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {DUA_SECTIONS.map((sec) => {
              const isActive = selectedSection === sec.id && !showOnlyFavorites;
              return (
                <button
                  key={sec.id}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setShowOnlyFavorites(false);
                    setSelectedSection(sec.id);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {sec.id === 'all' && <Layers size={14} />}
                  {sec.id === 'namaz-ke-baad' && <Sun size={14} />}
                  {sec.id === 'qurani-duain' && <BookOpen size={14} />}
                  <span>{sec.title}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: 10,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(16, 185, 129, 0.12)',
                      color: isActive ? '#fff' : 'var(--brand-primary)',
                      fontWeight: 'var(--weight-bold)',
                    }}
                  >
                    {sec.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Font Size Adjustment */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', minWidth: 220, maxWidth: 300, flex: 1 }}>
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
                className="input input-sm"
                style={{ paddingLeft: 36, width: '100%' }}
                placeholder="Search Dua, Surah, or Ayat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Font Size Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'var(--bg-surface)',
                padding: '3px 4px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
              }}
              title="Adjust Arabic Reading Size"
            >
              <ZoomIn size={13} style={{ color: 'var(--text-muted)', margin: '0 4px' }} />
              {(['standard', 'large', 'xlarge'] as const).map((lvl) => (
                <button
                  key={lvl}
                  className={`btn btn-xs ${fontSizeLevel === lvl ? 'btn-emerald' : 'btn-ghost'}`}
                  style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                  onClick={() => setFontSizeLevel(lvl)}
                >
                  {lvl === 'standard' ? 'A' : lvl === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {totalVisibleCount === 0 && (
        <Card style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <Sparkles size={36} style={{ color: 'var(--brand-gold)', margin: '0 auto 12px' }} />
          <h3 className="heading-3">No Duas Found</h3>
          <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
            {showOnlyFavorites
              ? 'You have not favorited any Duas yet. Tap the heart icon on any Dua card to add it to your favorites.'
              : 'No supplications match your search keyword. Try searching for "Baqarah", "Rabbana", or clear your filter.'}
          </p>
          {(showOnlyFavorites || searchTerm) && (
            <Button
              variant="outline"
              size="sm"
              style={{ marginTop: 'var(--space-4)' }}
              onClick={() => {
                setShowOnlyFavorites(false);
                setSearchTerm('');
                setSelectedSection('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      )}

      {/* SECTION 1 — NAMAZ KE BAAD KI DUA */}
      {showSection1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="flex-between" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-gold)',
                  display: 'inline-block',
                }}
              />
              <h2 className="heading-3" style={{ margin: 0 }}>
                Section 1 — Namaz Ke Baad Ki Dua
              </h2>
            </div>
            <Badge variant="gold">Masnoon Post-Prayer Dua</Badge>
          </div>

          <Card
            highlighted
            style={{
              padding: 'var(--space-6)',
              background: 'linear-gradient(135deg, var(--bg-card), rgba(245, 158, 11, 0.05))',
              borderLeft: '4px solid var(--brand-gold)',
              borderTop: '1px solid rgba(245, 158, 11, 0.3)',
              position: 'relative',
            }}
          >
            {/* Top Bar: Title & Actions */}
            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--brand-gold)',
                    fontWeight: 'var(--weight-bold)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Section 1 • Masnoon Supplication
                </span>
                <h3 className="heading-2" style={{ margin: '2px 0 0', color: 'var(--text-primary)' }}>
                  {NAMAZ_KE_BAAD_DUA.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleCopyDua(NAMAZ_KE_BAAD_DUA)}
                  title="Copy Arabic Dua"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {copiedId === NAMAZ_KE_BAAD_DUA.id ? (
                    <>
                      <Check size={14} style={{ color: 'var(--brand-primary)' }} />
                      <span style={{ color: 'var(--brand-primary)' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  className="btn-icon btn-icon-sm"
                  onClick={() => toggleFavorite(NAMAZ_KE_BAAD_DUA.id)}
                  title={favorites.includes(NAMAZ_KE_BAAD_DUA.id) ? 'Favorited' : 'Add to Favorites'}
                  style={{
                    color: favorites.includes(NAMAZ_KE_BAAD_DUA.id) ? 'var(--brand-gold)' : undefined,
                  }}
                >
                  <Heart
                    size={18}
                    fill={favorites.includes(NAMAZ_KE_BAAD_DUA.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </div>

            {/* Arabic Text (Preserved with harakaat, large & readable) */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                margin: 'var(--space-2) 0 var(--space-4)',
              }}
            >
              <p
                className="quran-text"
                style={{
                  ...getArabicStyle(),
                  color: 'var(--text-primary)',
                  textAlign: 'right',
                  direction: 'rtl',
                  margin: 0,
                  wordSpacing: '0.15em',
                }}
                dir="rtl"
              >
                {NAMAZ_KE_BAAD_DUA.arabic}
              </p>
            </div>

            {/* Bottom Reference Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bookmark size={14} style={{ color: 'var(--brand-gold)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--brand-gold)',
                    fontWeight: 'var(--weight-semibold)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Reference: {NAMAZ_KE_BAAD_DUA.reference}
                </span>
              </div>
              <span className="text-xs text-muted">Sunnah of the Beloved Messenger ﷺ</span>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION 2 — 20 QURANI DUAIN */}
      {filteredQuraniDuas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Section Header */}
          <div className="flex-between" style={{ alignItems: 'center', marginTop: showSection1 ? 'var(--space-4)' : 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-primary)',
                    display: 'inline-block',
                  }}
                />
                <h2 className="heading-3" style={{ margin: 0 }}>
                  Section 2 — 20 Qurani Duain
                </h2>
              </div>
              <p className="text-secondary text-xs" style={{ marginTop: 2 }}>
                Authentic Rabbana supplications preserved from the Holy Quran with Surah and Ayat references.
              </p>
            </div>
            <Badge variant="emerald">{filteredQuraniDuas.length} Qurani Duas</Badge>
          </div>

          {/* 20 Separate Dua Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredQuraniDuas.map((dua) => {
              const isFav = favorites.includes(dua.id);
              const isCopied = copiedId === dua.id;

              return (
                <Card
                  key={dua.id}
                  style={{
                    padding: 'var(--space-6)',
                    borderLeft: '4px solid var(--brand-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    transition: 'var(--transition-normal)',
                  }}
                >
                  {/* Top Bar: Dua Number, Title & Reference */}
                  <div
                    className="flex-between"
                    style={{
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {/* Number Badge */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: 'var(--brand-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'var(--weight-bold)',
                          fontSize: 'var(--text-sm)',
                          flexShrink: 0,
                        }}
                      >
                        {dua.number}
                      </div>

                      <div>
                        <h3 className="heading-3" style={{ margin: '0 0 2px', fontSize: 'var(--text-lg)' }}>
                          {dua.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BookOpen size={13} style={{ color: 'var(--brand-primary)' }} />
                          <span className="reference-text" style={{ fontSize: '0.78rem' }}>
                            {dua.reference}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Copy & Favorite */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleCopyDua(dua)}
                        title="Copy Arabic Dua"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} style={{ color: 'var(--brand-primary)' }} />
                            <span style={{ color: 'var(--brand-primary)' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        className="btn-icon btn-icon-sm"
                        onClick={() => toggleFavorite(dua.id)}
                        title={isFav ? 'Favorited' : 'Add to Favorites'}
                        style={{ color: isFav ? 'var(--brand-gold)' : undefined }}
                      >
                        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text (Preserved with harakaat, large & readable) */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-5) var(--space-6)',
                      border: '1px solid var(--border-subtle)',
                      margin: 'var(--space-1) 0',
                    }}
                  >
                    <p
                      className="quran-text"
                      style={{
                        ...getArabicStyle(),
                        color: 'var(--text-primary)',
                        textAlign: 'right',
                        direction: 'rtl',
                        margin: 0,
                        wordSpacing: '0.15em',
                      }}
                      dir="rtl"
                    >
                      {dua.arabic}
                    </p>
                  </div>

                  {/* Card Footer: Reference */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 'var(--space-2)',
                      borderTop: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        fontWeight: 'var(--weight-medium)',
                      }}
                    >
                      Quranic Reference: <strong style={{ color: 'var(--brand-primary)' }}>{dua.reference}</strong>
                    </span>

                    <span className="text-xs text-muted">
                      Supplication #{dua.number} of 20
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
