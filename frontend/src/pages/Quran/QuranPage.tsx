import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useQuranStore } from '../../stores/useQuranStore';
import {
  SURAHS_LIST,
  JUZ_LIST,
  TOTAL_MUSHAF_PDF_PAGES,
  QURAN_COM_RECITERS,
  getSurahByNumber,
} from '../../data/quranData';
import { QuranPdfCanvasViewer } from '../../components/quran/QuranPdfCanvasViewer';
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
  Hash,
} from 'lucide-react';

export const QuranPage: React.FC = () => {
  const {
    mode,
    mushafPage,
    currentSurahNumber,
    selectedPara,
    zoomLevel,
    activeAudioSurah,
    selectedReciterId,
    isPlaying,
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
    setZoomLevel,
    playSurahAudio,
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
    removeBookmark,
    setSearchTerm,
    setActiveTab,
  } = useQuranStore();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showAudioStrip, setShowAudioStrip] = useState<boolean>(false);
  const [directPageInput, setDirectPageInput] = useState<string>(String(mushafPage));

  // Sync direct page input with active mushaf page
  useEffect(() => {
    setDirectPageInput(String(mushafPage));
  }, [mushafPage]);

  // Metadata for active audio
  const activeAudioSurahMeta = getSurahByNumber(activeAudioSurah);
  const activeReciterObj =
    QURAN_COM_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_COM_RECITERS[0];

  // Search filtered surahs for listen tab
  const filteredSurahs = SURAHS_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toString() === searchTerm ||
      s.arabicName.includes(searchTerm)
  );

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

  const handleDirectPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(directPageInput, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PDF_PAGES, num));
      goToQuranPage(clamped);
      setDirectPageInput(String(clamped));
    } else {
      setDirectPageInput(String(mushafPage));
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
      {/* Clean Header */}
      <PageHeader
        title="Al-Quran Al-Kareem"
        arabicTitle="القرآن الكريم"
        subtitle="Read • Listen • Reflect"
        actions={
          <div className="flex items-center gap-2">
            {/* Audio Toggle Quick Button */}
            <button
              type="button"
              className={`btn btn-sm ${isPlaying ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setShowAudioStrip(!showAudioStrip)}
              title="Toggle Quran Audio Player"
            >
              <Headphones size={15} />
              <span className="hidden sm:inline">Audio Recitation</span>
              {isPlaying && <span className="animate-pulse text-xs ml-1">● Live</span>}
            </button>

            {/* Mode Switcher: Read | Listen */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                padding: '3px',
                gap: '3px',
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
                <BookOpen size={15} />
                <span>Read Mushaf</span>
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
                <Headphones size={15} />
                <span>Audio Studio</span>
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
          POLISHED NON-INTRUSIVE QURAN AUDIO PLAYER STRIP
          ======================================================== */}
      {(showAudioStrip || isPlaying) && (
        <div className="quran-audio-strip">
          <div className="quran-audio-strip-header">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Headphones size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>
                  🎧 Surah {activeAudioSurahMeta.number}. {activeAudioSurahMeta.name} ({activeAudioSurahMeta.arabicName})
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Reciter: {activeReciterObj.name} • {activeAudioSurahMeta.versesCount} Verses
                </div>
              </div>
            </div>

            {/* Reciter Dropdown */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                Qari:
              </span>
              <select
                className="mushaf-select-dropdown"
                value={selectedReciterId}
                onChange={(e) => setSelectedReciterId(parseInt(e.target.value, 10))}
                style={{ minWidth: '180px', padding: '4px 8px', fontSize: 'var(--text-xs)' }}
                aria-label="Select Reciter"
              >
                {QURAN_COM_RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrubber timeline */}
          <div className="flex flex-col gap-1">
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
              style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
              aria-label="Audio Timeline"
            />
          </div>

          {/* Controls Row */}
          <div className="quran-audio-controls-row">
            {/* Prev / Play / Stop / Next */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={playPrevSurahAudio}
                title="Previous Surah"
              >
                <SkipBack size={14} />
              </button>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={toggleAudioPlay}
                style={{ minWidth: '90px' }}
                title={isPlaying ? 'Pause Recitation' : 'Play Recitation'}
              >
                {isPlaying ? (
                  <>
                    <Pause size={14} /> <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={14} /> <span>Play</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={stopAudio}
                title="Stop Recitation"
              >
                <Square size={14} /> <span>Stop</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={playNextSurahAudio}
                title="Next Surah"
              >
                <SkipForward size={14} />
              </button>
            </div>

            {/* Loop, Speed & Volume */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                className={`btn btn-xs ${isLooping ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setIsLooping(!isLooping)}
                title={isLooping ? 'Repeat Enabled' : 'Repeat Surah'}
              >
                <Repeat size={12} />
                <span>Repeat</span>
              </button>

              <select
                className="mushaf-select-dropdown"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                style={{ padding: '2px 6px', fontSize: '0.75rem', minWidth: '60px' }}
                aria-label="Speed"
              >
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={handleToggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || audioVolume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
                  style={{ width: '60px', accentColor: 'var(--brand-primary)' }}
                  aria-label="Volume Slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 1: MAIN QURAN MUSHAF READING MODE (ARABIC ONLY)
          ======================================================== */}
      {mode === 'read' && (
        <div className="flex flex-col gap-4">
          {/* Surah + Para + Direct Page Horizontal Selector Bar (3 Controls) */}
          <div className="surah-para-selector-bar">
            {/* 1. Surah Dropdown Box */}
            <div className="selector-box-container">
              <label className="selector-label" htmlFor="surah-select">
                <BookOpen size={14} className="text-emerald-500" />
                <span>Select Surah</span>
              </label>
              <select
                id="surah-select"
                className="selector-select-input"
                value={currentSurahNumber}
                onChange={handleSurahSelect}
                aria-label="Select Surah"
              >
                {SURAHS_LIST.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name} ({s.arabicName}) - Page {s.pageStart}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Para / Juz Dropdown Box */}
            <div className="selector-box-container">
              <label className="selector-label" htmlFor="para-select">
                <Compass size={14} className="text-amber-500" />
                <span>Select Para / Juz</span>
              </label>
              <select
                id="para-select"
                className="selector-select-input"
                value={selectedPara}
                onChange={handleParaSelect}
                aria-label="Select Para / Juz"
              >
                {JUZ_LIST.map((j) => (
                  <option key={j.number} value={j.number}>
                    {j.number}. {j.name} ({j.arabicName}) - Page {j.pageStart}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Direct Page Jump Box */}
            <div className="selector-box-container">
              <label className="selector-label" htmlFor="top-page-jump-input">
                <Hash size={14} className="text-blue-500" />
                <span>Go to Page (1–{TOTAL_MUSHAF_PDF_PAGES})</span>
              </label>
              <form onSubmit={handleDirectPageSubmit} className="selector-page-form">
                <input
                  id="top-page-jump-input"
                  type="number"
                  min={1}
                  max={TOTAL_MUSHAF_PDF_PAGES}
                  value={directPageInput}
                  onChange={(e) => setDirectPageInput(e.target.value)}
                  placeholder={`1–${TOTAL_MUSHAF_PDF_PAGES}`}
                  className="selector-page-input"
                  aria-label={`Enter Quran PDF Page Number (1 to ${TOTAL_MUSHAF_PDF_PAGES})`}
                />
                <button
                  type="submit"
                  className="selector-page-go-btn"
                  aria-label="Navigate to entered page"
                >
                  Go
                </button>
              </form>
            </div>
          </div>

          {/* Main Mushaf PDF Canvas Viewer */}
          <div className="w-full">
            <QuranPdfCanvasViewer
              currentPage={mushafPage}
              onPageChange={setMushafPage}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
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
                      <Badge variant="gold">{activeAudioSurahMeta.revelationType}</Badge>
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
                  value={selectedReciterId}
                  onChange={(e) => {
                    const recId = parseInt(e.target.value, 10);
                    setSelectedReciterId(recId);
                  }}
                  style={{ minWidth: '260px' }}
                >
                  {QURAN_COM_RECITERS.map((r) => (
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
                {/* Left: Auto-next & Loop & Speed buttons */}
                <div className="flex items-center gap-2 flex-wrap">
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

                  {/* Playback Speed Switcher */}
                  <select
                    className="mushaf-select-dropdown"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: '70px' }}
                    aria-label="Playback Speed"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1.0}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
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
                    const isSelected = s.number === activeAudioSurah;
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

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              jumpToSurahPage(s.number);
                              setMode('read');
                            }}
                            title={`Read Surah ${s.name} on Page ${s.pageStart}`}
                          >
                            <BookOpen size={12} />
                            <span>Page {s.pageStart}</span>
                          </button>
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
                  {JUZ_LIST.map((j) => (
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
                      No bookmarks saved yet.
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
                        <div style={{ flex: 1 }}>
                          <strong>
                            Surah {bm.surahName} ({bm.surahNumber}:{bm.ayahNumber})
                          </strong>
                          {bm.arabicText && (
                            <div
                              className="mushaf-text"
                              dir="rtl"
                              style={{ fontSize: '1rem', color: 'var(--brand-gold)', margin: '4px 0' }}
                            >
                              {bm.arabicText.slice(0, 80)}...
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            Open Reader
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBookmark(bm.surahNumber, bm.ayahNumber);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
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
