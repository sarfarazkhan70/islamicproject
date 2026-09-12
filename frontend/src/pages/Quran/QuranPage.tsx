import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useQuranStore } from '../../stores/useQuranStore';
import {
  SURAHS_LIST,
  JUZ_LIST,
  MAX_MUSHAF_PAGE,
  QURAN_COM_RECITERS,
  getSurahByNumber,
  getJuzByNumber,
  getSurahByPage,
  getJuzByPage,
  quranTextPageToApiPage,
} from '../../data/quranData';
import { QuranApiPageViewer } from '../../components/quran/QuranApiPageViewer';
import {
  Search,
  Bookmark,
  BookOpen,
  Headphones,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';

export const QuranPage: React.FC = () => {
  const {
    mode,
    mushafPage,
    currentSurahNumber,
    selectedPara,
    playbackType,
    activeAudioJuz,
    activeAudioSurah,
    activeAudioAyah,
    selectedReciterId,
    audioPlaybackPhase,
    isPlaying,
    hasUserStartedAudio,
    playbackTime,
    playbackDuration,
    audioVolume,
    playbackSpeed,
    isLooping,
    autoPlayNext,
    bookmarks,
    readingProgress,
    searchTerm,
    activeTab,
    setMode,
    goToQuranPage,
    setMushafPage,
    jumpToSurahPage,
    jumpToJuzPage,
    playSurahAudio,
    playJuzAudio,
    playNextSurahAudio,
    playPrevSurahAudio,
    toggleAudioPlay,
    stopAudio,
    seekAudio,
    setAudioVolume,
    setPlaybackSpeed,
    setIsLooping,
    setAutoPlayNext,
    setSelectedReciterId,
    toggleBookmark,
    removeBookmarkItem,
    setSearchTerm,
    setActiveTab,
  } = useQuranStore();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showAudioStrip, setShowAudioStrip] = useState<boolean>(false);

  // Metadata for active audio
  const activeAudioSurahMeta = getSurahByNumber(activeAudioSurah);
  const activeAudioJuzMeta = activeAudioJuz ? getJuzByNumber(activeAudioJuz) : null;
  const activeReciterObj =
    QURAN_COM_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_COM_RECITERS[0];

  // Search filtered surahs and juz for listen tab
  const filteredSurahs = useMemo(
    () =>
      SURAHS_LIST.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `surah ${s.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.number.toString() === searchTerm ||
          s.arabicName.includes(searchTerm) ||
          `سورۃ ${s.arabicName}`.includes(searchTerm) ||
          `سورة ${s.arabicName}`.includes(searchTerm)
      ),
    [searchTerm]
  );

  const filteredJuz = useMemo(
    () =>
      JUZ_LIST.filter(
        (j) =>
          j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.startSurahName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.number.toString() === searchTerm ||
          j.arabicName.includes(searchTerm) ||
          `para ${j.number}`.includes(searchTerm.toLowerCase()) ||
          `juz ${j.number}`.includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  const formatTime = (sec: number, forceHours: boolean = false) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) {
      return forceHours ? '00:00:00' : '00:00';
    }
    const totalSeconds = Math.floor(sec);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (forceHours || hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const [directPageInput, setDirectPageInput] = useState<string>(mushafPage.toString());

  // Keep direct page input box synchronized when active page updates (via scroll or selectors)
  useEffect(() => {
    setDirectPageInput(mushafPage.toString());
  }, [mushafPage]);

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

  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(directPageInput, 10);
    if (!isNaN(pageNum)) {
      const validPage = quranTextPageToApiPage(pageNum);
      goToQuranPage(validPage);
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

  // Active bookmark status checks
  const isPageBookmarked = bookmarks.some(
    (b) => (b.type === 'page' ? b.pageNumber === mushafPage : b.pageNumber === mushafPage && !b.ayahNumber)
  );
  const isParaBookmarked = bookmarks.some(
    (b) => (b.type === 'juz' && b.juzNumber === selectedPara)
  );
  const isSurahBookmarked = bookmarks.some(
    (b) => (b.type === 'surah' ? b.surahNumber === currentSurahNumber : (!b.type && !b.ayahNumber && b.surahNumber === currentSurahNumber))
  );

  const handleTogglePageBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const surah = getSurahByPage(mushafPage);
    const juz = getJuzByPage(mushafPage);
    toggleBookmark({
      type: 'page',
      pageNumber: mushafPage,
      surahNumber: surah.number,
      surahName: surah.name,
      surahArabicName: surah.arabicName,
      juzNumber: juz.number,
      juzName: juz.name,
      juzArabicName: juz.arabicName,
    });
  };

  const handleToggleParaBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const juz = getJuzByNumber(selectedPara);
    toggleBookmark({
      type: 'juz',
      juzNumber: juz.number,
      juzName: juz.name,
      juzArabicName: juz.arabicName,
      pageNumber: juz.pageStart,
      surahNumber: juz.startSurah,
      surahName: juz.startSurahName,
    });
  };

  const handleToggleSurahBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const surah = getSurahByNumber(currentSurahNumber);
    toggleBookmark({
      type: 'surah',
      surahNumber: surah.number,
      surahName: surah.name,
      surahArabicName: surah.arabicName,
      pageNumber: surah.pageStart,
      juzNumber: surah.juzStart,
    });
  };

  const handleOpenBookmark = (bm: any) => {
    if (bm.type === 'page' && bm.pageNumber) {
      goToQuranPage(bm.pageNumber);
    } else if (bm.type === 'juz' && bm.juzNumber) {
      jumpToJuzPage(bm.juzNumber);
    } else if (bm.type === 'surah' && bm.surahNumber) {
      jumpToSurahPage(bm.surahNumber);
    } else if (bm.pageNumber) {
      goToQuranPage(bm.pageNumber);
    } else if (bm.surahNumber) {
      jumpToSurahPage(bm.surahNumber);
    }
    setMode('read');
  };

  return (
    <div className="quran-page" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Clean Header */}
      <PageHeader
        title="Al-Quran Al-Kareem"
        arabicTitle="القرآن الكريم"
        subtitle="Read • Listen • Reflect"
        actions={
          <div className="quran-header-actions flex items-center gap-3">
            {/* Audio Recitation Toggle Card Box */}
            <button
              type="button"
              className={`audio-recitation-card-box ${isPlaying ? 'is-playing' : ''} ${showAudioStrip ? 'is-active' : ''}`}
              onClick={() => setShowAudioStrip(!showAudioStrip)}
              title={showAudioStrip ? 'Hide Quran Audio Player' : 'Open Quran Audio Player'}
              aria-label="Toggle Quran Audio Recitation"
            >
              <div className="audio-recitation-icon-badge">
                <Headphones size={15} />
              </div>
              <div className="audio-recitation-label-group">
                <span className="audio-recitation-title">Audio Recitation</span>
                {isPlaying && (
                  <span className="audio-recitation-status">
                    <span className="live-dot animate-pulse">●</span> Live
                  </span>
                )}
              </div>
            </button>

            {/* Mode Switcher: Quran Reading | Quran Audio */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                padding: '3px',
                gap: '3px',
                flexWrap: 'wrap',
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
                  fontWeight: mode === 'read' ? 'var(--weight-bold)' : 'var(--weight-medium)',
                }}
                title="Quran Reading"
              >
                <BookOpen size={14} />
                <span>Quran Reading</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${mode === 'listen' ? 'active' : ''}`}
                onClick={() => {
                  setMode('listen');
                  if (activeTab === 'bookmarks') setActiveTab('surahs');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: mode === 'listen' ? 'var(--weight-bold)' : 'var(--weight-medium)',
                }}
                title="Quran Audio"
              >
                <Headphones size={14} />
                <span>Quran Audio</span>
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
              Last Reading: <strong>Surah {readingProgress.surahName}</strong> (Ayah {readingProgress.ayahNumber})
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              jumpToSurahPage(readingProgress.surahNumber);
              setMode('read');
            }}
          >
            Resume Reading
          </button>
        </div>
      )}

      {/* ========================================================
          MODE 1: MAIN QURAN MUSHAF READING MODE (ARABIC ONLY)
          ======================================================== */}
      {mode === 'read' && (
        <div className="flex flex-col gap-3">
          {/* Polished Non-Intrusive Quran Audio Player Strip (Active when listening in Reading Mode) */}
          {(showAudioStrip || hasUserStartedAudio || isPlaying || playbackTime > 0) && (
            <div className="quran-audio-strip">
              {/* Header Info: Surah metadata + Qari Selector */}
              <div className="quran-audio-strip-header">
                <div className="flex items-center gap-3">
                  <div className="quran-audio-avatar">
                    <Headphones size={18} />
                  </div>
                  <div>
                    <div className="quran-audio-title-row">
                      {playbackType === 'juz' && activeAudioJuzMeta ? (
                        <span>🎧 {activeAudioJuzMeta.name} — Surah {activeAudioSurahMeta.name} ({activeAudioSurahMeta.number}:{activeAudioAyah || activeAudioJuzMeta.startAyah})</span>
                      ) : (
                        <span>🎧 Surah {activeAudioSurahMeta.number}. {activeAudioSurahMeta.name} ({activeAudioSurahMeta.arabicName.startsWith('سورۃ') || activeAudioSurahMeta.arabicName.startsWith('سورة') || activeAudioSurahMeta.arabicName.startsWith('سُورَةُ') ? activeAudioSurahMeta.arabicName : `سورۃ ${activeAudioSurahMeta.arabicName}`})</span>
                      )}
                      {isPlaying && audioPlaybackPhase === 'taawwuz' && (
                        <span className="phase-badge phase-badge-gold">
                          Ta'awwuz (أَعُوذُ بِاللَّهِ)
                        </span>
                      )}
                      {isPlaying && audioPlaybackPhase === 'bismillah' && (
                        <span className="phase-badge phase-badge-emerald">
                          Bismillah (بِسْمِ اللَّهِ)
                        </span>
                      )}
                    </div>
                    <div className="quran-audio-subtitle">
                      {playbackType === 'juz' && activeAudioJuzMeta ? (
                        <>Reciter: {activeReciterObj.name}</>
                      ) : (
                        <>Reciter: {activeReciterObj.name} • {activeAudioSurahMeta.versesCount} Verses</>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reciter Dropdown */}
                <div className="quran-audio-reciter-select-group flex items-center gap-3">
                  <span className="qari-label">
                    Select Voice:
                  </span>
                  <select
                    className="mushaf-select-dropdown"
                    value={selectedReciterId}
                    onChange={(e) => setSelectedReciterId(parseInt(e.target.value, 10))}
                    style={{ minWidth: '180px', padding: '5px 10px', fontSize: 'var(--text-xs)' }}
                    aria-label="Select Voice"
                  >
                    {QURAN_COM_RECITERS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dedicated Clean Audio Player Box */}
              <div className="quran-player-box">
                {/* Scrubber timeline */}
                <div className="player-box-scrubber flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-secondary font-mono">
                    <span>{formatTime(playbackTime, (playbackDuration >= 3600 || playbackTime >= 3600))}</span>
                    <span>{formatTime(playbackDuration, (playbackDuration >= 3600 || playbackTime >= 3600))}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={playbackDuration || 100}
                    step={0.5}
                    value={playbackTime}
                    onChange={(e) => seekAudio(parseFloat(e.target.value))}
                    className="quran-scrubber-slider"
                    style={{
                      background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${playbackDuration > 0 ? Math.min(100, Math.max(0, (playbackTime / playbackDuration) * 100)) : 0}%, var(--border-default) ${playbackDuration > 0 ? Math.min(100, Math.max(0, (playbackTime / playbackDuration) * 100)) : 0}%, var(--border-default) 100%)`,
                    }}
                    aria-label="Audio Timeline"
                  />
                </div>

                {/* Controls Bar inside the Player Box */}
                <div className="player-box-controls-row">
                  {/* Playback Controls Group: Prev, Play/Pause, Stop, Next */}
                  <div className="player-playback-group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary player-nav-btn"
                      onClick={playPrevSurahAudio}
                      title="Previous Surah"
                    >
                      <SkipBack size={15} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-primary player-main-play-btn"
                      onClick={toggleAudioPlay}
                      title={isPlaying ? 'Pause Recitation' : 'Play Recitation'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={16} /> <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} /> <span>Play</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary player-stop-btn"
                      onClick={stopAudio}
                      title="Stop Recitation"
                    >
                      <Square size={14} /> <span>Stop</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary player-nav-btn"
                      onClick={playNextSurahAudio}
                      title="Next Surah"
                    >
                      <SkipForward size={15} />
                    </button>
                  </div>

                  {/* Auxiliary Controls Group: Repeat, Speed, Sound / Volume */}
                  <div className="player-aux-group">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`btn btn-xs ${isLooping ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setIsLooping(!isLooping)}
                        title={isLooping ? 'Repeat Enabled' : 'Repeat Surah'}
                      >
                        <Repeat size={13} />
                        <span>Repeat</span>
                      </button>

                      <select
                        className="mushaf-select-dropdown player-speed-select"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        aria-label="Speed"
                      >
                        <option value={0.75}>0.75x</option>
                        <option value={1.0}>1.0x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                      </select>
                    </div>

                    {/* Sound / Volume Control Box */}
                    <div className="player-volume-control-box">
                      <button
                        type="button"
                        className="volume-icon-btn"
                        onClick={handleToggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
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
                        className="player-volume-slider"
                        aria-label="Volume Slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Sticky Surah + Para / Juz + Direct Page Horizontal Selector Bar (3 Controls) */}
          <div className="quran-sticky-selector-wrapper">
            <div className="surah-para-selector-bar">
              {/* 1. Surah Dropdown Slot */}
              <div className="selector-control-slot">
                <div className="selector-slot-header">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen size={13} className="text-emerald-500" />
                    <label htmlFor="surah-select" className="selector-slot-label">Select Surah</label>
                  </div>
                  <button
                    type="button"
                    className={`selector-bookmark-action-btn ${isSurahBookmarked ? 'is-active' : ''}`}
                    onClick={handleToggleSurahBookmark}
                    title={isSurahBookmarked ? 'Bookmarked Surah (Click to remove)' : 'Bookmark This Surah'}
                    aria-label={isSurahBookmarked ? 'Bookmarked Surah' : 'Bookmark Surah'}
                  >
                    <Bookmark size={13} fill={isSurahBookmarked ? 'var(--brand-gold)' : 'none'} className={isSurahBookmarked ? 'text-amber-400' : 'text-amber-400/80'} />
                    <span>{isSurahBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                </div>
                <select
                  id="surah-select"
                  className="selector-select-input"
                  value={currentSurahNumber}
                  onChange={handleSurahSelect}
                  aria-label="Select Surah"
                >
                  {SURAHS_LIST.map((s) => {
                    const arabicName = s.arabicName.startsWith('سورۃ') || s.arabicName.startsWith('سورة') || s.arabicName.startsWith('سُورَةُ')
                      ? s.arabicName
                      : `سورۃ ${s.arabicName}`;
                    const englishName = s.name.startsWith('Surah ') ? s.name : `Surah ${s.name}`;
                    return (
                      <option key={s.number} value={s.number}>
                        {arabicName} — {englishName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Para / Juz Dropdown Slot */}
              <div className="selector-control-slot">
                <div className="selector-slot-header">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Compass size={13} className="text-amber-500" />
                    <label htmlFor="para-select" className="selector-slot-label">Select Para / Juz</label>
                  </div>
                  <button
                    type="button"
                    className={`selector-bookmark-action-btn ${isParaBookmarked ? 'is-active' : ''}`}
                    onClick={handleToggleParaBookmark}
                    title={isParaBookmarked ? 'Bookmarked Para (Click to remove)' : 'Bookmark This Para'}
                    aria-label={isParaBookmarked ? 'Bookmarked Para' : 'Bookmark Para'}
                  >
                    <Bookmark size={13} fill={isParaBookmarked ? 'var(--brand-gold)' : 'none'} className={isParaBookmarked ? 'text-amber-400' : 'text-amber-400/80'} />
                    <span>{isParaBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                </div>
                <select
                  id="para-select"
                  className="selector-select-input"
                  value={selectedPara}
                  onChange={handleParaSelect}
                  aria-label="Select Para / Juz"
                >
                  {JUZ_LIST.map((j) => (
                    <option key={j.number} value={j.number}>
                      {j.number}   {j.arabicName} — {j.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Direct Page Search / Jump Slot */}
              <div className="selector-control-slot selector-page-jump-slot">
                <div className="selector-slot-header">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Search size={13} className="text-emerald-500" />
                    <label htmlFor="direct-page-search" className="selector-slot-label">
                      Go To Page <span className="selector-range-hint">(1–{MAX_MUSHAF_PAGE})</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    className={`selector-bookmark-action-btn ${isPageBookmarked ? 'is-active' : ''}`}
                    onClick={handleTogglePageBookmark}
                    title={isPageBookmarked ? `Page ${mushafPage} Bookmarked (Click to remove)` : `Bookmark Page ${mushafPage}`}
                    aria-label={isPageBookmarked ? 'Bookmarked Page' : 'Bookmark Page'}
                  >
                    <Bookmark size={13} fill={isPageBookmarked ? 'var(--brand-gold)' : 'none'} className={isPageBookmarked ? 'text-amber-400' : 'text-amber-400/80'} />
                    <span>{isPageBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                </div>
                <form onSubmit={handleDirectPageSubmit} className="selector-page-form">
                  <input
                    id="direct-page-search"
                    type="number"
                    min={1}
                    max={MAX_MUSHAF_PAGE}
                    value={directPageInput}
                    onChange={(e) => setDirectPageInput(e.target.value)}
                    placeholder="Page No."
                    className="selector-page-input"
                    aria-label="Direct Page Search"
                  />
                  <button type="submit" className="selector-page-go-btn" title="Jump to Page">
                    Go
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Main Mushaf API Page Viewer */}
          <div className="w-full">
            <QuranApiPageViewer
              currentPage={mushafPage}
              onPageChange={setMushafPage}
              surahNumber={currentSurahNumber}
            />
          </div>
        </div>
      )}



      {/* ========================================================
          MODE 2: QURAN AUDIO STUDIO & CATALOG
          ======================================================== */}
      {mode === 'listen' && (
        <div className="quran-listen-container flex flex-col gap-6">
          {/* Main Audio Player Card */}
          <Card className="audio-studio-hero-card" style={{ padding: 'var(--space-6)', position: 'relative' }}>
            <div className="audio-studio-layout flex flex-col gap-6">
              {/* Selected Surah Showcase Header (Centered, Generous Spacing, No Overlap) */}
              <div
                className="surah-audio-showcase"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-1) var(--space-2) 0',
                  width: '100%',
                }}
              >
                {/* Intro Phase Badge (Ta'awwuz / Bismillah) only when active */}
                {isPlaying && (audioPlaybackPhase === 'taawwuz' || audioPlaybackPhase === 'bismillah') && (
                  <div className="flex items-center justify-center gap-2 flex-wrap" style={{ width: '100%', marginBottom: 'var(--space-1)' }}>
                    {audioPlaybackPhase === 'taawwuz' && (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.25)',
                          color: 'var(--brand-gold)',
                          fontSize: '12px',
                          padding: '3px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 'bold',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                        }}
                      >
                        Ta'awwuz • أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
                      </span>
                    )}
                    {audioPlaybackPhase === 'bismillah' && (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.25)',
                          color: 'var(--brand-primary)',
                          fontSize: '12px',
                          padding: '3px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 'bold',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        Bismillah • بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </span>
                    )}
                  </div>
                )}

                {/* Main Arabic Calligraphy Surah / Juz Name */}
                <div
                  className="mushaf-text"
                  dir="rtl"
                  style={{
                    fontSize: 'clamp(2rem, 4.5vw, 2.75rem)',
                    color: 'var(--brand-gold)',
                    lineHeight: 1.35,
                    padding: '0',
                    margin: '0 0 18px 0',
                    textShadow: '0 2px 14px rgba(245, 158, 11, 0.2)',
                    overflow: 'visible',
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                  }}
                >
                  {playbackType === 'juz' && activeAudioJuzMeta
                    ? activeAudioJuzMeta.arabicName
                    : (activeAudioSurahMeta.arabicName.startsWith('سورۃ') || activeAudioSurahMeta.arabicName.startsWith('سورة') || activeAudioSurahMeta.arabicName.startsWith('سُورَةُ')
                        ? activeAudioSurahMeta.arabicName
                        : `سورۃ ${activeAudioSurahMeta.arabicName}`)}
                </div>

                {/* English Surah/Juz Title & Details */}
                <div style={{ maxWidth: '100%', marginTop: '6px' }}>
                  <h2
                    style={{
                      fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      margin: '0 0 4px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {playbackType === 'juz' && activeAudioJuzMeta
                      ? `${activeAudioJuzMeta.name} — Surah ${activeAudioSurahMeta.name}`
                      : (activeAudioSurahMeta.name.startsWith('Surah ') ? activeAudioSurahMeta.name : `Surah ${activeAudioSurahMeta.name}`)}
                  </h2>
                  {playbackType !== 'juz' && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      {activeAudioSurahMeta.versesCount} Ayahs • Para {activeAudioSurahMeta.juzStart}
                    </p>
                  )}
                </div>
              </div>

              {/* Reciter Selector Box */}
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
                  marginTop: 'var(--space-1)',
                  width: '100%',
                }}
              >
                <div className="flex items-center gap-2">
                  <Headphones size={18} className="text-emerald-400" />
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                    }}
                  >
                    SELECT QARI / RECITER:
                  </span>
                </div>
                <select
                  className="mushaf-select-dropdown"
                  value={selectedReciterId}
                  onChange={(e) => {
                    const recId = parseInt(e.target.value, 10);
                    setSelectedReciterId(recId);
                  }}
                  style={{ minWidth: '260px', flex: '1 1 260px', maxWidth: '100%' }}
                  aria-label="Select Qari / Reciter"
                >
                  {QURAN_COM_RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.style})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dedicated Clean Audio Player Box */}
              <div className="quran-player-box studio-player-box">
                {/* 1. Audio Scrubber & Timers at TOP */}
                <div className="player-box-scrubber flex flex-col gap-2">
                  <div className="player-time-row flex items-center justify-between text-xs text-secondary font-mono">
                    <span>{formatTime(playbackTime, (playbackDuration >= 3600 || playbackTime >= 3600))}</span>
                    <span>{formatTime(playbackDuration, (playbackDuration >= 3600 || playbackTime >= 3600))}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={playbackDuration || 100}
                    step={0.5}
                    value={playbackTime}
                    onChange={(e) => seekAudio(parseFloat(e.target.value))}
                    className="quran-scrubber-slider"
                    style={{
                      background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${playbackDuration > 0 ? Math.min(100, Math.max(0, (playbackTime / playbackDuration) * 100)) : 0}%, var(--border-default) ${playbackDuration > 0 ? Math.min(100, Math.max(0, (playbackTime / playbackDuration) * 100)) : 0}%, var(--border-default) 100%)`,
                    }}
                    aria-label="Audio Playback Progress"
                  />
                </div>

                {/* 2. Main Playback Controls: DIRECTLY BELOW Progress Bar */}
                <div className="studio-main-playback-container">
                  <div className="player-playback-group studio-playback-row">
                    <button
                      type="button"
                      className="btn btn-outline-secondary studio-circle-btn"
                      onClick={playPrevSurahAudio}
                      title="Previous Surah"
                      aria-label="Previous Surah"
                    >
                      <SkipBack size={18} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary studio-circle-btn"
                      onClick={() => seekAudio(Math.max(0, playbackTime - 10))}
                      title="Rewind 10 seconds"
                      aria-label="Rewind 10 seconds"
                    >
                      <RotateCcw size={18} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary studio-main-play-btn"
                      onClick={toggleAudioPlay}
                      title={isPlaying ? 'Pause' : 'Play'}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '3px' }} />}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary studio-circle-btn"
                      onClick={stopAudio}
                      title="Stop Recitation"
                      aria-label="Stop Recitation"
                    >
                      <Square size={16} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary studio-circle-btn"
                      onClick={() => seekAudio(Math.min(playbackDuration, playbackTime + 10))}
                      title="Forward 10 seconds"
                      aria-label="Forward 10 seconds"
                    >
                      <RotateCw size={18} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary studio-circle-btn"
                      onClick={playNextSurahAudio}
                      title="Next Surah"
                      aria-label="Next Surah"
                    >
                      <SkipForward size={18} />
                    </button>
                  </div>
                </div>

                {/* 3. Secondary Controls & Volume: BELOW Main Playback Row */}
                <div className="studio-bottom-controls-row">
                  {/* Left / Center: Repeat, Auto-Next, Speed */}
                  <div className="player-aux-left studio-aux-group">
                    <button
                      type="button"
                      className={`btn btn-sm ${isLooping ? 'btn-primary' : 'btn-outline-secondary'} studio-aux-btn`}
                      onClick={() => setIsLooping(!isLooping)}
                      title={isLooping ? 'Looping Enabled' : 'Enable Repeat Surah'}
                    >
                      <Repeat size={14} />
                      <span>Repeat</span>
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${autoPlayNext ? 'btn-primary' : 'btn-outline-secondary'} studio-aux-btn`}
                      onClick={() => setAutoPlayNext(!autoPlayNext)}
                      title={autoPlayNext ? 'Auto-play Next Surah Enabled' : 'Enable Auto-play Next'}
                    >
                      <span>Auto-Next</span>
                    </button>

                    {/* Playback Speed Switcher */}
                    <select
                      className="mushaf-select-dropdown player-speed-select"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      aria-label="Playback Speed"
                    >
                      <option value={0.75}>0.75x</option>
                      <option value={1.0}>1.0x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                    </select>
                  </div>

                  {/* Right / Side: Sound / Volume Control Box */}
                  <div className="player-volume-control-box studio-volume-box">
                    <button
                      type="button"
                      className="volume-icon-btn"
                      onClick={handleToggleMute}
                      title={isMuted ? 'Unmute' : 'Mute'}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
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
                      className="player-volume-slider"
                      aria-label="Volume Slider"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Surahs & Juz Catalog Tabs */}
          <Card style={{ padding: 'var(--space-6)' }}>
            <div className="flex flex-col gap-4">
              {/* Search Bar & Tabs */}
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
                    const isSelected = playbackType === 'surah' && s.number === activeAudioSurah;
                    return (
                      <div
                        key={s.number}
                        onClick={() => playSurahAudio(s.number, selectedReciterId)}
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
                        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                          <span
                            style={{
                              width: '32px',
                              height: '32px',
                              minWidth: '32px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface)',
                              color: isSelected ? '#061c14' : 'var(--brand-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              fontFamily: 'var(--font-mono)',
                              flexShrink: 0,
                            }}
                          >
                            {s.number}
                          </span>
                          <div
                            style={{
                              fontWeight: 'var(--weight-semibold)',
                              fontSize: 'var(--text-sm)',
                              color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minWidth: 0,
                            }}
                          >
                            {s.name.startsWith('Surah ') ? s.name : `Surah ${s.name}`}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '8px' }}>
                          <span
                            className="mushaf-text"
                            dir="rtl"
                            style={{
                              fontSize: '1.25rem',
                              color: isSelected ? 'var(--brand-gold)' : 'var(--text-secondary)',
                              lineHeight: 1.2,
                              display: 'block',
                            }}
                          >
                            {s.arabicName.startsWith('سورۃ') || s.arabicName.startsWith('سورة') || s.arabicName.startsWith('سُورَةُ')
                              ? s.arabicName
                              : `سورۃ ${s.arabicName}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Juz List (Clean Para Cards with Fixed Number Box & Visible Arabic Text) */}
              {activeTab === 'juz' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                    gap: 'var(--space-3)',
                    maxHeight: '520px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                  }}
                >
                  {filteredJuz.map((j) => {
                    const isSelected = playbackType === 'juz' && selectedPara === j.number;
                    return (
                      <div
                        key={j.number}
                        onClick={() => playJuzAudio(j.number, selectedReciterId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          minHeight: '54px',
                          padding: '8px 14px',
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-lg)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          boxSizing: 'border-box',
                          gap: '10px',
                        }}
                      >
                        {/* Fixed Equal-Sized Number Box */}
                        <span
                          style={{
                            width: '36px',
                            minWidth: '36px',
                            maxWidth: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface)',
                            color: isSelected ? '#061c14' : 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            fontFamily: 'var(--font-mono)',
                            flexShrink: 0,
                          }}
                        >
                          {j.number}
                        </span>

                        {/* Arabic Para/Juz Name on the Right (Completely visible, no clipping) */}
                        <span
                          className="mushaf-text"
                          dir="rtl"
                          style={{
                            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                            color: isSelected ? 'var(--brand-gold)' : 'var(--brand-gold)',
                            lineHeight: 1.4,
                            textAlign: 'right',
                            flex: 1,
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            wordBreak: 'normal',
                          }}
                        >
                          {j.arabicName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bookmarks Tab */}
              {activeTab === 'bookmarks' && (
                <div className="flex flex-col gap-3">
                  {bookmarks.length === 0 ? (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Bookmark size={32} style={{ margin: '0 auto 12px', opacity: 0.35, color: 'var(--brand-gold)' }} />
                      <p style={{ fontWeight: 'bold', fontSize: 'var(--text-base)', marginBottom: '4px' }}>No bookmarks saved yet.</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Save any Page, Para, or Surah while reading to quickly return to it here.
                      </p>
                    </div>
                  ) : (
                    bookmarks.map((bm, index) => {
                      const isPage = bm.type === 'page';
                      const isJuz = bm.type === 'juz';
                      const isSurah = bm.type === 'surah' || (!bm.type && !bm.ayahNumber);

                      let title = '';
                      let badge = '';
                      let subtitle = '';
                      let arabic = '';

                      if (isPage) {
                        title = `Page ${bm.pageNumber}`;
                        badge = 'Page';
                        const sMeta = bm.surahName ? bm.surahName : (bm.surahNumber ? SURAHS_LIST[bm.surahNumber - 1]?.name : '');
                        subtitle = sMeta ? `Surah ${sMeta} • Hafiz Mushaf` : `Hafiz Quran Page ${bm.pageNumber}`;
                        arabic = bm.surahArabicName || '';
                      } else if (isJuz) {
                        title = `Para: ${bm.juzName || `Juz ${bm.juzNumber}`}`;
                        badge = 'Para';
                        subtitle = `Starts at Page ${bm.pageNumber || (bm.juzNumber ? JUZ_LIST[bm.juzNumber - 1]?.pageStart : '')}`;
                        arabic = bm.juzArabicName || '';
                      } else if (isSurah) {
                        title = `Surah: ${bm.surahName || (bm.surahNumber ? SURAHS_LIST[bm.surahNumber - 1]?.name : '')}`;
                        badge = 'Surah';
                        subtitle = `Starts at Page ${bm.pageNumber || (bm.surahNumber ? SURAHS_LIST[bm.surahNumber - 1]?.pageStart : '')}`;
                        arabic = bm.surahArabicName || '';
                      } else {
                        title = `Ayah: Surah ${bm.surahName} (${bm.surahNumber}:${bm.ayahNumber})`;
                        badge = 'Ayah';
                        subtitle = `Page ${bm.pageNumber || (bm.surahNumber ? SURAHS_LIST[bm.surahNumber - 1]?.pageStart : '')}`;
                        arabic = bm.arabicText || '';
                      }

                      return (
                        <div
                          key={index}
                          onClick={() => handleOpenBookmark(bm)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            gap: '12px',
                          }}
                          className="bookmark-item-row"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: 'var(--brand-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Bookmark size={18} fill="currentColor" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                  {title}
                                </strong>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: isPage ? 'rgba(16, 185, 129, 0.2)' : isJuz ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                    color: isPage ? 'var(--brand-primary)' : isJuz ? 'var(--brand-gold)' : '#60a5fa',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {badge}
                                </span>
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {subtitle}
                              </div>
                            </div>
                            {arabic && (
                              <div
                                className="mushaf-text"
                                dir="rtl"
                                style={{
                                  fontSize: '1.15rem',
                                  color: 'var(--brand-gold)',
                                  marginLeft: 'auto',
                                  flexShrink: 0,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {arabic}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                            <Button size="sm" variant="outline" style={{ borderRadius: 'var(--radius-md)' }}>
                              Open Reader
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              style={{ color: 'var(--text-muted)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookmarkItem(bm);
                              }}
                              title="Delete bookmark"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })
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
