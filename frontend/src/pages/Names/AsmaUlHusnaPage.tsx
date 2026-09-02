import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader.js';
import { Card } from '../../components/common/Card.js';
import { Badge } from '../../components/common/Badge.js';
import { Button } from '../../components/common/Button.js';
import { ASMA_UL_HUSNA } from '../../data/islamic/asmaUlHusnaData.js';
import { IslamicNameItem, NamesFilter, normalizeArabicText } from '../../data/islamic/types.js';
import { NameCard } from '../../components/names/NameCard.js';
import { NameDetailModal } from '../../components/names/NameDetailModal.js';
import { NamesAutoPlayHeader } from '../../components/names/NamesAutoPlayHeader.js';
import { useNamesStore } from '../../stores/useNamesStore.js';
import {
  Search,
  Sparkles,
  Heart,
  X,
  BookOpen,
  Filter,
} from 'lucide-react';



export const AsmaUlHusnaPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NamesFilter>('all');
  const [selectedItem, setSelectedItem] = useState<IslamicNameItem | null>(null);

  const { favorites } = useNamesStore();

  const filteredNames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const qArabic = normalizeArabicText(searchQuery);

    return ASMA_UL_HUSNA.filter((item) => {
      // Filter by favorites if active
      if (filter === 'favorites' && !favorites.includes(item.id)) {
        return false;
      }

      if (!q) return true;

      // Multi-lingual search
      const matchTranslit = item.transliteration.toLowerCase().includes(q);
      const matchEnglish = item.english.toLowerCase().includes(q);
      const matchRomanUrdu = item.romanUrdu.toLowerCase().includes(q);
      const matchArabic =
        item.arabic.includes(q) || (qArabic && normalizeArabicText(item.arabic).includes(qArabic));
      const matchUrdu = item.urdu.includes(q);
      const matchNum = String(item.number) === q;

      return (
        matchTranslit ||
        matchEnglish ||
        matchRomanUrdu ||
        matchArabic ||
        matchUrdu ||
        matchNum
      );
    });
  }, [searchQuery, filter, favorites]);


  const favoriteCount = favorites.filter((id) => id.startsWith('allah-')).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <PageHeader
        title="Asma-ul-Husna"
        arabicTitle="أسماء الله الحسنى"
        subtitle="The 99 Beautiful and Sublime Names of Allah Ta'ala with authentic Qur'anic and Hadith references."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Badge variant="gold">
              <Sparkles size={12} /> 99 Names of Allah
            </Badge>
            <Badge variant="emerald">
              <BookOpen size={12} /> Sahih Bukhari 2736
            </Badge>
          </div>
        }
      />

      {/* Prophetic Hadith Intro Card */}
      <Card
        style={{
          borderLeft: '4px solid var(--brand-primary)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div
            className="font-arabic"
            style={{
              fontSize: '1.25rem',
              color: 'var(--brand-primary)',
              direction: 'rtl',
              lineHeight: 1.6,
            }}
          >
            «إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا، مِائَةً إِلَّا وَاحِدًا، مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ»
          </div>
          <p className="text-sm text-secondary" style={{ margin: 0 }}>
            "Verily, Allah has ninety-nine names, one hundred less one; whoever enumerates, memorizes, and reflects upon them will enter Paradise."
            <span style={{ fontWeight: 'var(--weight-semibold)', marginLeft: 6, color: 'var(--brand-gold)' }}>
              — Sahih al-Bukhari 2736; Sahih Muslim 2677
            </span>
          </p>
        </div>
      </Card>

      {/* Sequential Audio Toolbar */}
      <NamesAutoPlayHeader items={ASMA_UL_HUSNA} title="Names of Allah Ta'ala" />

      {/* Search & Filter Bar */}
      <Card style={{ padding: 'var(--space-4)' }}>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search
              size={16}
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
              style={{ paddingLeft: 36, paddingRight: searchQuery ? 36 : 12 }}
              placeholder="Search in Arabic, English, Transliteration, or Roman Urdu (e.g. Rahman, Merciful)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-icon btn-icon-sm"
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Names ({ASMA_UL_HUSNA.length})
            </Button>
            <Button
              variant={filter === 'favorites' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('favorites')}
              icon={<Heart size={14} fill={filter === 'favorites' ? 'currentColor' : 'none'} />}
            >
              Favorites ({favoriteCount})
            </Button>
          </div>
        </div>

        {/* Counter readout */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-3)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Showing <strong>{filteredNames.length}</strong> of {ASMA_UL_HUSNA.length} Names
          </span>
          {searchQuery && (
            <span>
              Search query: "<em>{searchQuery}</em>"
            </span>
          )}
        </div>
      </Card>

      {/* Names Grid */}
      {filteredNames.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <Filter size={32} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-2)' }} />
          <h3 className="heading-3">No Names Found</h3>
          <p className="text-sm text-secondary" style={{ maxWidth: 400, margin: '0 auto var(--space-4)' }}>
            {filter === 'favorites'
              ? 'You have not saved any names to your favorites list yet. Tap the heart icon on any card to add it.'
              : `No names matched your search query "${searchQuery}". Try searching by Arabic text, English meaning, or transliteration.`}
          </p>
          {filter === 'favorites' ? (
            <Button variant="primary" onClick={() => setFilter('all')}>
              View All 99 Names
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {filteredNames.map((item) => (
            <NameCard key={item.id} item={item} onSelect={setSelectedItem} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <NameDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};
