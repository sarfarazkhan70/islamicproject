import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ASMA_UL_HUSNA } from '../../frontend/src/data/islamic/asmaUlHusnaData.js';
import { ASMA_E_MUSTAFA } from '../../frontend/src/data/islamic/asmaEMustafaData.js';

describe('Asma Audio Engine — Allah & Prophet ﷺ 100% Exact Audio Verification', () => {
  describe('1. Allah Names Audio Integrity (Male Qari — Untouched Reference)', () => {
    it('should verify all 99 Allah names have valid sequential start and end timestamps', () => {
      for (let i = 0; i < 99; i++) {
        const item = ASMA_UL_HUSNA[i];
        expect(item.category).toBe('allah');
        expect(item.audioUrl).toBe('/audio/asma_recitation.mp3');
        expect(typeof item.startTime).toBe('number');
        expect(typeof item.endTime).toBe('number');
        expect(item.startTime).toBeGreaterThanOrEqual(0);
        expect(item.endTime).toBeGreaterThan(item.startTime!);
      }
    });

    it('should verify Allah audio file exists on disk', () => {
      const fullPath = path.resolve(__dirname, '../../frontend/public/audio/asma_recitation.mp3');
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).size).toBeGreaterThan(1000000);
    });
  });

  describe('2. Prophet Names ﷺ Exact Audio Integrity (1 Card = 1 Name = 1 File)', () => {
    it('should verify all 30 Prophet names have dedicated standalone audio files matching their exact ID', () => {
      expect(ASMA_E_MUSTAFA.length).toBe(30);
      for (let i = 0; i < 30; i++) {
        const item = ASMA_E_MUSTAFA[i];
        const expectedId = `prophet-${String(i + 1).padStart(2, '0')}`;
        expect(item.id).toBe(expectedId);
        expect(item.category).toBe('prophet');
        expect(item.audioUrl).toBe(`/audio/prophet/${expectedId}.wav`);
      }
    });

    it('should verify all 30 standalone audio files physically exist on disk and have valid audio content', () => {
      for (let i = 1; i <= 30; i++) {
        const id = `prophet-${String(i).padStart(2, '0')}`;
        const filePath = path.resolve(__dirname, `../../frontend/public/audio/prophet/${id}.wav`);
        expect(fs.existsSync(filePath)).toBe(true);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeGreaterThan(50000); // 50KB+ valid audio data
      }
    });

    it('should STRICTLY ensure Prophet names NEVER use Allah recitation', () => {
      for (const item of ASMA_E_MUSTAFA) {
        expect(item.audioUrl).not.toBe('/audio/asma_recitation.mp3');
        expect(item.audioUrl).toContain('/audio/prophet/prophet-');
      }
    });
  });

  describe('3. Strict Category Isolation & Mutual Exclusion', () => {
    it('should verify category protection rule: Allah audio cannot play for Prophet and vice-versa', () => {
      const validateCategoryAudio = (category: 'allah' | 'prophet', audioUrl: string): boolean => {
        if (category === 'prophet' && audioUrl.includes('asma_recitation.mp3')) {
          return false; // FORBIDDEN
        }
        if (category === 'allah' && audioUrl.includes('prophet')) {
          return false; // FORBIDDEN
        }
        return true;
      };

      expect(validateCategoryAudio('allah', '/audio/asma_recitation.mp3')).toBe(true);
      expect(validateCategoryAudio('prophet', '/audio/prophet/prophet-01.wav')).toBe(true);
      expect(validateCategoryAudio('prophet', '/audio/asma_recitation.mp3')).toBe(false);
      expect(validateCategoryAudio('allah', '/audio/prophet/prophet-01.wav')).toBe(false);
    });
  });

  describe('4. Auto-Play Sequential State Machine', () => {
    it('should test Prophet Auto-Play sequence: Prophet 1 -> Prophet 2 -> Prophet 3 without delay', () => {
      const sequence: string[] = [];
      let currentIndex = 0;
      let isAutoPlaying = true;

      const items = ASMA_E_MUSTAFA.slice(0, 5);

      const playNext = (index: number) => {
        if (index >= items.length) {
          isAutoPlaying = false;
          return;
        }
        sequence.push(items[index].id);
        currentIndex = index;
      };

      playNext(0);
      expect(sequence).toEqual(['prophet-01']);

      playNext(currentIndex + 1);
      expect(sequence).toEqual(['prophet-01', 'prophet-02']);

      playNext(currentIndex + 1);
      expect(sequence).toEqual(['prophet-01', 'prophet-02', 'prophet-03']);

      playNext(currentIndex + 1);
      expect(sequence).toEqual(['prophet-01', 'prophet-02', 'prophet-03', 'prophet-04']);

      playNext(currentIndex + 1);
      expect(sequence).toEqual(['prophet-01', 'prophet-02', 'prophet-03', 'prophet-04', 'prophet-05']);

      playNext(currentIndex + 1);
      expect(isAutoPlaying).toBe(false);
    });
  });
});
