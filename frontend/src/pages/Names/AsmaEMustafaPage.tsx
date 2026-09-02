import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader.js';
import { Card } from '../../components/common/Card.js';
import { Badge } from '../../components/common/Badge.js';
import { Button } from '../../components/common/Button.js';
import { ASMA_E_MUSTAFA } from '../../data/islamic/asmaEMustafaData.js';
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
  Filter,
  CheckCircle2,
} from 'lucide-react';


export const AsmaEMustafaPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NamesFilter>('all');
  const [selectedItem, setSelectedItem] = useState<IslamicNameItem | null>(null);

  const { favorites } = useNamesStore();

  const filteredNames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const qArabic = normalizeArabicText(searchQuery);

    return ASMA_E_MUSTAFA.filter((item) => {
      // Filter by favorites if active
      if (filter === 'favorites' && !favorites.includes(item.id)) {
        return false;
      }

      if (!q) return true;

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


  const favoriteCount = favorites.filter((id) => id.startsWith('prophet-')).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <PageHeader
        title="Asma-e-Mustafa ﷺ"
        arabicTitle="أسماء النبي المصطفى ﷺ"
        subtitle="Blessed Names and Titles of Prophet Muhammad ﷺ verified from the Noble Qur'an and Sahih Hadith."
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Badge variant="gold">
              <Sparkles size={12} /> Prophetic Names & Titles
            </Badge>
            <Badge variant="emerald">
              <CheckCircle2 size={12} /> Qur'an & Sahih Hadith Verified
            </Badge>
          </div>
        }
      />

      {/* Authenticity & Scholarly Standard Card */}
      <Card
        style={{
          borderLeft: '4px solid var(--brand-gold)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--brand-primary)', fontSize: 'var(--text-sm)' }}>
              Authentic Islamic Documentation Notice
            </span>
          </div>
          <p className="text-sm text-secondary" style={{ margin: 0 }}>
            <strong>Sirf Qur'an aur authentic Hadith se sabit names aur titles included hain.</strong> Unlike arbitrary lists, each entry here is accompanied by its verified textual citation from the Noble Qur'an (Surah & Ayah) or Sahih Hadith collections (Sahih al-Bukhari, Sahih Muslim, etc.).
          </p>
          <div
            className="font-arabic"
            style={{
              fontSize: '1.15rem',
              color: 'var(--brand-gold)',
              direction: 'rtl',
              lineHeight: 1.6,
              marginTop: 4,
            }}
          >
            «لِي خَمْسَةُ أَسْمَاءٍ: أَنَا مُحَمَّدٌ، وَأَنَا أَحْمَدُ، وَأَنَا الْمَاحِي... وَأَنَا الْحَاشِرُ... وَأَنَا الْعَاقِبُ»
          </div>
          <span className="text-xs text-muted">
            — Sahih al-Bukhari 4896; Sahih Muslim 2354
          </span>
        </div>
      </Card>

      {/* Sequential Audio Toolbar */}
      <NamesAutoPlayHeader items={ASMA_E_MUSTAFA} title="Prophetic Names & Titles" />

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
              placeholder="Search in Arabic, English, Transliteration, or Roman Urdu (e.g. Ahmad, Mercy, Rahmat)..."
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
              All Verified ({ASMA_E_MUSTAFA.length})
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
            Showing <strong>{filteredNames.length}</strong> of {ASMA_E_MUSTAFA.length} Verified Prophetic Names & Titles
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
              ? 'You have not saved any prophetic names to your favorites list yet. Tap the heart icon on any card to add it.'
              : `No names matched your search query "${searchQuery}". Try searching by Arabic text, English title, or transliteration.`}
          </p>
          {filter === 'favorites' ? (
            <Button variant="primary" onClick={() => setFilter('all')}>
              View All Verified Names
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
