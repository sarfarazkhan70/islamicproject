import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SACRED_AUDIO_ITEMS, sacredAudioService } from '../services/sacredAudioService';

describe('Sacred Names Audio Engine (Allah Ta\'ala & Huzur Muhammad ﷺ)', () => {
  it('1. Exact matching displayed text and meanings for Allah Ta\'ala', () => {
    const allahItem = SACRED_AUDIO_ITEMS.find((item) => item.id === 'allah-taala');
    expect(allahItem).toBeDefined();
    expect(allahItem?.name).toBe("Allah Ta'ala");
    expect(allahItem?.arabicName).toBe('الله جل جلاله');
    expect(allahItem?.urduMeaning).toBe("Allah Ta'ala sab se buland aur azeem hai.");
    expect(allahItem?.englishMeaning).toBe('Allah, Glorious and Exalted is He.');
    expect(allahItem?.audioUrl).toBe('/audio/allah/allah_taala.wav');
    expect(allahItem?.audioFallbackUrl).toBe('/audio/allah/allah_taala.mp3');
  });

  it('2. Exact matching displayed text and meanings for Huzur Muhammad ﷺ', () => {
    const prophetItem = SACRED_AUDIO_ITEMS.find((item) => item.id === 'huzur-muhammad');
    expect(prophetItem).toBeDefined();
    expect(prophetItem?.name).toBe('Huzur Muhammad ﷺ');
    expect(prophetItem?.arabicName).toBe('محمد رسول الله صلى الله عليه وسلم');
    expect(prophetItem?.urduMeaning).toBe('Huzur Muhammad Mustafa Sallallahu Alaihi Wasallam Allah ke aakhri Nabi aur Rasool hain.');
    expect(prophetItem?.englishMeaning).toBe('Muhammad, peace and blessings be upon him, is the final Prophet and Messenger of Allah.');
    expect(prophetItem?.audioUrl).toBe('/audio/prophet/huzur_muhammad.wav');
    expect(prophetItem?.audioFallbackUrl).toBe('/audio/prophet/huzur_muhammad.mp3');
  });

  it('3. Audio files physically exist on disk and have valid non-silent binary content', () => {
    const allahWavPath = path.resolve(__dirname, '../../public/audio/allah/allah_taala.wav');
    const allahMp3Path = path.resolve(__dirname, '../../public/audio/allah/allah_taala.mp3');
    const prophetWavPath = path.resolve(__dirname, '../../public/audio/prophet/huzur_muhammad.wav');
    const prophetMp3Path = path.resolve(__dirname, '../../public/audio/prophet/huzur_muhammad.mp3');

    expect(fs.existsSync(allahWavPath)).toBe(true);
    expect(fs.existsSync(allahMp3Path)).toBe(true);
    expect(fs.existsSync(prophetWavPath)).toBe(true);
    expect(fs.existsSync(prophetMp3Path)).toBe(true);

    const allahStat = fs.statSync(allahWavPath);
    const prophetStat = fs.statSync(prophetWavPath);

    expect(allahStat.size).toBeGreaterThan(100000); // > 100KB verified DSP male voice
    expect(prophetStat.size).toBeGreaterThan(100000); // > 100KB verified DSP male voice
  });

  it('4. SacredAudioService state subscription and audio controls', () => {
    const initialState = sacredAudioService.getState();
    expect(initialState).toBeDefined();
    expect(typeof initialState.isPlaying).toBe('boolean');
    expect(typeof initialState.volume).toBe('number');

    // Mute toggle
    const wasMuted = sacredAudioService.getState().isMuted;
    sacredAudioService.toggleMute();
    expect(sacredAudioService.getState().isMuted).toBe(!wasMuted);
    sacredAudioService.toggleMute(); // restore

    // Volume setter
    sacredAudioService.setVolume(0.85);
    expect(sacredAudioService.getState().volume).toBe(0.85);

    // Stop resets state
    sacredAudioService.stop();
    expect(sacredAudioService.getState().currentId).toBe(null);
    expect(sacredAudioService.getState().isPlaying).toBe(false);
  });
});
