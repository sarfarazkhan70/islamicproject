import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';

export const LibrarySearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    clearSearch,
  } = useLibraryStore();

  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'Arabic', label: 'Arabic' },
    { id: 'Urdu', label: 'Urdu' },
    { id: 'English', label: 'English' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 260,
          }}
        >
          <Search
            size={18}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Islamic Books (e.g. Bukhari, Ahmad Raza, Fatawa, Bahar-e-Shariat)..."
            style={{
              width: '100%',
              paddingLeft: 42,
              paddingRight: searchQuery ? 36 : 14,
              height: 44,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.92rem',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="btn-icon btn-icon-sm"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Language Filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 2,
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLanguage(lang.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight:
                    selectedLanguage === lang.id
                      ? 'var(--weight-semibold)'
                      : 'var(--weight-normal)',
                  backgroundColor:
                    selectedLanguage === lang.id
                      ? 'var(--brand-primary)'
                      : 'transparent',
                  color:
                    selectedLanguage === lang.id ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {(searchQuery || selectedLanguage !== 'all') && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={clearSearch}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
