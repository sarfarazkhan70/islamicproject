import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  useQuranStore,
  RECITERS_LIST,
} from '../../stores/useQuranStore';
import {
  SURAHS_LIST,
  JUZ_LIST,
  getMushafPageUrl,
  getMushafPageFallbackUrl,
  getSurahByPage,
  getJuzByPage,
} from '../../data/quranData';
import {
  Search,
  Bookmark,
  BookOpen,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const QuranPage: React.FC = () => {
  const {
    mode,
    surahs,
    juzList,
    currentSurah,
    mushafPage,
    zoomLevel,
    activeAudioSurah,
    selectedReciter,
    isPlaying,
    playbackTime,
    playbackDuration,
    audioVolume,
    isLooping,
    autoPlayNext,
    bookmarks,
    readingProgress,
    searchTerm,
    activeTab,
    setMode,
    setMushafPage,
    jumpToSurahPage,
    jumpToJuzPage,
    nextMushafPage,
    prevMushafPage,
    zoomIn,
    zoomOut,
    resetZoom,
    loadSurah,
    setSearchTerm,
    setActiveTab,
    playSurahAudio,
    playNextSurahAudio,
    playPrevSurahAudio,
    toggleAudioPlay,
    seekAudio,
    setAudioVolume,
    setIsLooping,
    setAutoPlayNext,
    setSelectedReciter,
  } = useQuranStore();

  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [pageInputValue, setPageInputValue] = useState<string>(String(mushafPage));
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(getMushafPageUrl(mushafPage));
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Sync pageInputValue and imageSrc with current mushafPage
  useEffect(() => {
    setPageInputValue(String(mushafPage));
    setImageSrc(getMushafPageUrl(mushafPage));
    setIsImageLoading(true);
  }, [mushafPage]);

  // Ensure current Surah data is loaded when mushafPage changes
  useEffect(() => {
    const matchedSurah = getSurahByPage(mushafPage);
    if (!currentSurah || currentSurah.number !== matchedSurah.number) {
      loadSurah(matchedSurah.number);
    }
  }, [mushafPage, currentSurah, loadSurah]);

  const handleImageError = () => {
    const fallback = getMushafPageFallbackUrl(mushafPage);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    } else {
      setIsImageLoading(false);
    }
  };

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (readerContainerRef.current) {
        readerContainerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation shortcuts in Reading Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture shortcuts when not typing inside an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (mode === 'read') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          nextMushafPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          prevMushafPage();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, nextMushafPage, prevMushafPage, zoomIn, zoomOut, resetZoom, toggleFullscreen]);

  // Current page metadata
  const currentSurahMeta = getSurahByPage(mushafPage);
  const currentJuzMeta = getJuzByPage(mushafPage);

  // Filtered surahs for search
  const filteredSurahs = surahs.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toString() === searchTerm ||
      s.arabicName.includes(searchTerm)
  );

  const activeAudioSurahMeta =
    SURAHS_LIST.find((s) => s.number === activeAudioSurah) || SURAHS_LIST[66];

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseInt(pageInputValue, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 604) {
        setMushafPage(parsed);
      } else {
        setPageInputValue(String(mushafPage));
      }
    }
  };

  const handleSurahSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNum = parseInt(e.target.value, 10);
    if (!isNaN(surahNum)) {
      jumpToSurahPage(surahNum);
    }
  };

  const handleParaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const paraNum = parseInt(e.target.value, 10);
    if (!isNaN(paraNum)) {
      jumpToJuzPage(paraNum);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setAudioVolume(0.9);
      setIsMuted(false);
    } else {
      setAudioVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="quran-page" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Page Header */}
      <PageHeader
        title="The Holy Quran"
        arabicTitle="القرآن الكريم"
        subtitle="Authentic Madinah Mushaf & Revered Recitations"
        actions={
          <div className="flex items-center gap-2">
            {/* Dual Mode Switcher: Read | Listen */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                padding: '4px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                className={`tab-btn ${mode === 'read' ? 'active' : ''}`}
                onClick={() => setMode('read')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <BookOpen size={16} />
                <span>Read</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${mode === 'listen' ? 'active' : ''}`}
                onClick={() => setMode('listen')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <Headphones size={16} />
                <span>Listen</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Reading Progress Quick Banner */}
      {readingProgress && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-emerald-500" />
            <span>
              Last Reading: <strong>Surah {readingProgress.surahName}</strong> (Page {readingProgress.pageNumber || 562})
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setMushafPage(readingProgress.pageNumber || 562)}
          >
            Resume Reading
          </button>
        </div>
      )}

      {/* ========================================================
          MODE 1: QURAN READING MODE (AUTHENTIC MUSHAF PAGE IMAGES)
          ======================================================== */}
      {mode === 'read' && (
        <div ref={readerContainerRef} className={`mushaf-view-container ${isFullscreen ? 'is-fullscreen' : ''}`}>
          {/* Top Selectors Bar: Independent Surah & Juz dropdowns */}
          <div className="mushaf-selectors-bar">
            {/* Surah Selector */}
            <div className="mushaf-selector-group">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                SURAH:
              </span>
              <select
                className="mushaf-select-dropdown"
                value={currentSurahMeta.number}
                onChange={handleSurahSelect}
                aria-label="Select Surah"
              >
                {SURAHS_LIST.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name} ({s.arabicName}) — Page {s.pageStart}
                  </option>
                ))}
              </select>
            </div>

            {/* Para / Juz Selector */}
            <div className="mushaf-selector-group">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                PARA / JUZ:
              </span>
              <select
                className="mushaf-select-dropdown"
                value={currentJuzMeta.number}
                onChange={handleParaSelect}
                aria-label="Select Para / Juz"
              >
                {JUZ_LIST.map((j) => (
                  <option key={j.number} value={j.number}>
                    {j.number}. {j.name} — Page {j.pageStart}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom & Fullscreen Controls */}
            <div className="mushaf-zoom-controls">
              <button
                type="button"
                className="mushaf-zoom-btn"
                onClick={zoomOut}
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                className="mushaf-zoom-btn"
                onClick={resetZoom}
                title="Reset Zoom (0 / 100%)"
                style={{ fontSize: '0.75rem', width: 'auto', padding: '0 6px' }}
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                className="mushaf-zoom-btn"
                onClick={zoomIn}
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className={`mushaf-zoom-btn ${isFullscreen ? 'active-btn' : ''}`}
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen Reader (F)'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="mushaf-nav-controls">
            <button
              type="button"
              className="mushaf-nav-btn"
              onClick={prevMushafPage}
              disabled={mushafPage <= 1}
              title="Previous Mushaf Page (Left Arrow)"
            >
              <ChevronLeft size={18} />
              <span>Prev Page</span>
            </button>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Page</span>
              <input
                type="number"
                className="mushaf-page-jump-input"
                min={1}
                max={604}
                value={pageInputValue}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputSubmit}
                onBlur={() => {
                  const p = parseInt(pageInputValue, 10);
                  if (!isNaN(p) && p >= 1 && p <= 604) setMushafPage(p);
                }}
                aria-label="Mushaf Page Number (1 to 604)"
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>of 604</span>
            </div>

            <button
              type="button"
              className="mushaf-nav-btn"
              onClick={nextMushafPage}
              disabled={mushafPage >= 604}
              title="Next Mushaf Page (Right Arrow)"
            >
              <span>Next Page</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Mushaf Page High-Resolution Container */}
          <div
            className="mushaf-page-frame"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
            }}
          >
            {/* Mushaf Header Line */}
            <div className="mushaf-page-header-info">
              <span>
                <strong>Juz {currentJuzMeta.number}</strong> ({currentJuzMeta.arabicName})
              </span>
              <span className="mushaf-header-surah-title">
                Surah <strong>{currentSurahMeta.name}</strong> • سُورَةُ {currentSurahMeta.arabicName}
              </span>
              <span>
                Page <strong>{mushafPage}</strong>
              </span>
            </div>

            {/* High-Resolution Mushaf Page Image */}
            <div className="mushaf-image-wrapper">
              {isImageLoading && (
                <div className="mushaf-loading-overlay">
                  <div className="spinner" />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    Loading Authentic Mushaf Page {mushafPage}...
                  </span>
                </div>
              )}
              <img
                src={imageSrc}
                alt={`Authentic Quran Page ${mushafPage} - Surah ${currentSurahMeta.name}`}
                className="mushaf-img-element"
                onLoad={() => setIsImageLoading(false)}
                onError={handleImageError}
                loading="eager"
              />
            </div>

            {/* Mushaf Footer Line */}
            <div className="mushaf-page-footer-info">
              <span>مصحف المدينة المنورة • Standard Madinah Mushaf • Page {mushafPage} of 604</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: QURAN AUDIO / LISTENING MODE (STUDIO & DIRECTORY)
          ======================================================== */}
      {mode === 'listen' && (
        <div className="quran-listen-container flex flex-col gap-6">
          {/* Main Audio Player Card */}
          <Card className="audio-studio-hero-card" style={{ padding: 'var(--space-6)', position: 'relative' }}>
            <div className="audio-studio-layout flex flex-col gap-5">
              {/* Surah and Reciter Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-xl)',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Headphones size={30} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', margin: 0 }}>
                        {activeAudioSurahMeta.number}. {activeAudioSurahMeta.name}
                      </h2>
                      <Badge variant="gold">
                        {activeAudioSurahMeta.revelationType}
                      </Badge>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {activeAudioSurahMeta.meaning} • {activeAudioSurahMeta.versesCount} Verses • Juz{' '}
                      {activeAudioSurahMeta.juzStart}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    className="mushaf-text"
                    dir="rtl"
                    style={{ fontSize: '2rem', color: 'var(--brand-gold)', lineHeight: 1.2 }}
                  >
                    سُورَةُ {activeAudioSurahMeta.arabicName}
                  </div>
                </div>
              </div>

              {/* Reciter Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  SELECT QARI / RECITER:
                </span>
                <select
                  className="mushaf-select-dropdown"
                  value={selectedReciter}
                  onChange={(e) => {
                    setSelectedReciter(e.target.value);
                    if (isPlaying) {
                      playSurahAudio(activeAudioSurah, e.target.value);
                    }
                  }}
                  style={{ minWidth: '260px' }}
                >
                  {RECITERS_LIST.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.style})
                    </option>
                  ))}
                </select>
              </div>

              {/* Audio Scrubber Slider */}
              <div className="audio-scrubber-group flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-secondary font-mono">
                  <span>{formatTime(playbackTime)}</span>
                  <span>{formatTime(playbackDuration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={playbackDuration || 100}
                  step={0.5}
                  value={playbackTime}
                  onChange={(e) => seekAudio(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--brand-primary)',
                    cursor: 'pointer',
                  }}
                  aria-label="Audio Playback Progress"
                />
              </div>

              {/* Playback Controls Row */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Left: Auto-next & Loop buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${isLooping ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setIsLooping(!isLooping)}
                    title={isLooping ? 'Looping Enabled' : 'Enable Repeat Surah'}
                  >
                    <Repeat size={16} />
                    <span>Repeat</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${autoPlayNext ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setAutoPlayNext(!autoPlayNext)}
                    title={autoPlayNext ? 'Auto-play Next Surah Enabled' : 'Enable Auto-play Next'}
                  >
                    <span>Auto-Next</span>
                  </button>
                </div>

                {/* Center: Prev Surah, Rewind 10s, Play/Pause, Forward 10s, Next Surah */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={playPrevSurahAudio}
                    title="Previous Surah"
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                  >
                    <SkipBack size={18} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => seekAudio(Math.max(0, playbackTime - 10))}
                    title="Rewind 10 seconds"
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={toggleAudioPlay}
                    style={{
                      borderRadius: '50%',
                      width: '56px',
                      height: '56px',
                      padding: 0,
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                    }}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '3px' }} />}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => seekAudio(Math.min(playbackDuration, playbackTime + 10))}
                    title="Forward 10 seconds"
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                  >
                    <RotateCw size={18} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={playNextSurahAudio}
                    title="Next Surah"
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                  >
                    <SkipForward size={18} />
                  </button>
                </div>

                {/* Right: Volume & Mute */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleToggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || audioVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : audioVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setAudioVolume(v);
                      if (v > 0 && isMuted) setIsMuted(false);
                    }}
                    style={{ width: '80px', accentColor: 'var(--brand-primary)' }}
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Surahs & Juz Recitation Catalog */}
          <Card style={{ padding: 'var(--space-6)' }}>
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search Surah name, number, meaning..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 1rem 0.6rem 2.4rem',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="tabs-container">
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'surahs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('surahs')}
                  >
                    All 114 Surahs
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'juz' ? 'active' : ''}`}
                    onClick={() => setActiveTab('juz')}
                  >
                    30 Paras / Juz
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookmarks')}
                  >
                    Bookmarks ({bookmarks.length})
                  </button>
                </div>
              </div>

              {/* Surahs Grid */}
              {activeTab === 'surahs' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 'var(--space-3)',
                    maxHeight: '520px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                  }}
                >
                  {filteredSurahs.map((s) => {
                    const isSelected = s.number === activeAudioSurah;
                    return (
                      <div
                        key={s.number}
                        onClick={() => playSurahAudio(s.number, selectedReciter)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-lg)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface)',
                              color: isSelected ? '#061c14' : 'var(--brand-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {s.number}
                          </span>
                          <div>
                            <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
                              {s.name}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                              {s.meaning} • {s.versesCount} Ayahs
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            className="mushaf-text"
                            dir="rtl"
                            style={{ fontSize: '1.2rem', color: isSelected ? 'var(--brand-gold)' : 'var(--text-secondary)' }}
                          >
                            {s.arabicName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Juz List */}
              {activeTab === 'juz' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 'var(--space-3)',
                    maxHeight: '520px',
                    overflowY: 'auto',
                  }}
                >
                  {juzList.map((j) => (
                    <div
                      key={j.number}
                      onClick={() => {
                        jumpToJuzPage(j.number);
                        setMode('read');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--brand-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                          }}
                        >
                          {j.number}
                        </span>
                        <div>
                          <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
                            {j.name}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            Starts: {j.startSurahName} (Page {j.pageStart})
                          </div>
                        </div>
                      </div>
                      <span className="mushaf-text" dir="rtl" style={{ fontSize: '1.1rem', color: 'var(--brand-gold)' }}>
                        {j.arabicName}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bookmarks Tab */}
              {activeTab === 'bookmarks' && (
                <div className="flex flex-col gap-3">
                  {bookmarks.length === 0 ? (
                    <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No bookmarks saved yet. Click bookmark on any Surah or page to save it here.
                    </div>
                  ) : (
                    bookmarks.map((bm, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          jumpToSurahPage(bm.surahNumber);
                          setMode('read');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-lg)',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <strong>
                            Surah {bm.surahName} ({bm.surahNumber}) — Ayah {bm.ayahNumber}
                          </strong>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                            Saved on {new Date(bm.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Open in Reader
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
