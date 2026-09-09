import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Headphones,
} from 'lucide-react';
import {
  KANZUL_IMAN_MIN_PAGE,
  KANZUL_IMAN_MAX_PAGE,
  getKanzulImanPageForSurah,
  getKanzulImanPageForJuz,
} from '../../data/kanzulImanData';
import { KanzulImanPageViewer } from '../quran/KanzulImanPageViewer';
import { KanzulImanAudioStudio } from '../quran/KanzulImanAudioStudio';

export type KanzulImanMode = 'read' | 'listen';

export const KanzulImanReader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode from URL query param (?mode=read or ?mode=listen)
  const modeParam = searchParams.get('mode');
  const [activeMode, setActiveMode] = useState<KanzulImanMode>(
    modeParam === 'listen' ? 'listen' : 'read'
  );

  // Sync mode with URL param
  useEffect(() => {
    if (modeParam === 'listen' || modeParam === 'read') {
      setActiveMode(modeParam);
    }
  }, [modeParam]);

  // Calculate target page from surah, juz, or page query parameters
  const initialPage = useMemo(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p >= KANZUL_IMAN_MIN_PAGE && p <= KANZUL_IMAN_MAX_PAGE) {
        return p;
      }
    }

    const surahParam = searchParams.get('surah');
    if (surahParam) {
      const s = parseInt(surahParam, 10);
      if (!isNaN(s) && s >= 1 && s <= 114) {
        return getKanzulImanPageForSurah(s);
      }
    }

    const juzParam = searchParams.get('juz') || searchParams.get('para');
    if (juzParam) {
      const j = parseInt(juzParam, 10);
      if (!isNaN(j) && j >= 1 && j <= 30) {
        return getKanzulImanPageForJuz(j);
      }
    }

    return KANZUL_IMAN_MIN_PAGE;
  }, [searchParams]);

  const handleModeChange = (newMode: KanzulImanMode) => {
    setActiveMode(newMode);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', newMode);
    setSearchParams(newParams);
  };

  return (
    <div className="kanzul-iman-hub" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 'var(--space-12)' }}>
      {/* Top Header & Breadcrumb Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-3)',
          gap: 'var(--space-2)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => navigate('/library')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Library</span>
        </button>

        <div
          className="text-xs text-muted"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span
            onClick={() => navigate('/library')}
            style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            Islamic Library
          </span>
          <span>/</span>
          <span style={{ color: 'var(--brand-gold)', fontWeight: 'var(--weight-semibold)' }}>
            Kanzul Iman
          </span>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>
            {activeMode === 'read' ? 'Kanzul Iman Reading' : 'Kanzul Iman Audio'}
          </span>
        </div>
      </div>

      {/* Clean, Modern, Elegant Two-Section Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '4px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          marginBottom: 'var(--space-4)',
          width: 'fit-content',
        }}
      >
        {/* Tab 1: Kanzul Iman Reading */}
        <button
          type="button"
          onClick={() => handleModeChange('read')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.92rem',
            fontWeight: 700,
            backgroundColor: activeMode === 'read' ? 'var(--brand-gold)' : 'transparent',
            color: activeMode === 'read' ? '#1a1204' : 'var(--text-secondary)',
            boxShadow: activeMode === 'read' ? '0 2px 10px rgba(245, 158, 11, 0.25)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          <BookOpen size={18} />
          <span>Kanzul Iman Reading</span>
        </button>

        {/* Tab 2: Kanzul Iman Audio */}
        <button
          type="button"
          onClick={() => handleModeChange('listen')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.92rem',
            fontWeight: 700,
            backgroundColor: activeMode === 'listen' ? 'var(--brand-primary)' : 'transparent',
            color: activeMode === 'listen' ? '#041f14' : 'var(--text-secondary)',
            boxShadow: activeMode === 'listen' ? '0 2px 10px rgba(16, 185, 129, 0.25)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Headphones size={18} />
          <span>Kanzul Iman Audio</span>
        </button>
      </div>

      {/* Render Active Section */}
      {activeMode === 'read' ? (
        <div className="kanzul-iman-reading-section">
          {/* Complete Authentic Printed Kanzul Iman Mushaf Page Viewer */}
          <KanzulImanPageViewer initialPage={initialPage} />
        </div>
      ) : (
        <div className="kanzul-iman-audio-section">
          {/* Pure Audio Studio with Hidden Translation Text */}
          <KanzulImanAudioStudio />
        </div>
      )}
    </div>
  );
};
