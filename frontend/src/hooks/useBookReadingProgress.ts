import { useEffect, useRef, useCallback } from 'react';
import {
  ReadingProgressService,
  BookReadingProgress,
} from '../services/readingProgressService';

interface UseBookReadingProgressOptions {
  bookId: string;
  volumeKey: string | number;
  currentPage: number;
  totalPages?: number;
  chapterId?: string;
  sectionId?: string;
  enabled?: boolean;
}

export function useBookReadingProgress({
  bookId,
  volumeKey,
  currentPage,
  totalPages,
  chapterId,
  sectionId,
  enabled = true,
}: UseBookReadingProgressOptions) {
  const latestPageRef = useRef<number>(currentPage);
  const latestTotalRef = useRef<number | undefined>(totalPages);
  const latestChapterRef = useRef<string | undefined>(chapterId);
  const latestSectionRef = useRef<string | undefined>(sectionId);

  latestPageRef.current = currentPage;
  latestTotalRef.current = totalPages;
  latestChapterRef.current = chapterId;
  latestSectionRef.current = sectionId;

  // Auto-save on page change (debounced)
  useEffect(() => {
    if (!enabled || !bookId || currentPage < 1) return;

    ReadingProgressService.saveProgress(bookId, volumeKey, currentPage, totalPages, {
      chapterId,
      sectionId,
      immediate: false,
    });
  }, [bookId, volumeKey, currentPage, totalPages, chapterId, sectionId, enabled]);

  // Immediate save on unmount and beforeunload
  useEffect(() => {
    if (!enabled || !bookId) return;

    const handleBeforeUnload = () => {
      ReadingProgressService.saveProgress(
        bookId,
        volumeKey,
        latestPageRef.current,
        latestTotalRef.current,
        {
          chapterId: latestChapterRef.current,
          sectionId: latestSectionRef.current,
          immediate: true,
        }
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [bookId, volumeKey, enabled]);

  const saveNow = useCallback(
    (page?: number) => {
      const p = page ?? latestPageRef.current;
      ReadingProgressService.saveProgress(
        bookId,
        volumeKey,
        p,
        latestTotalRef.current,
        {
          chapterId: latestChapterRef.current,
          sectionId: latestSectionRef.current,
          immediate: true,
        }
      );
    },
    [bookId, volumeKey]
  );

  const getSavedProgress = useCallback((): BookReadingProgress | undefined => {
    return ReadingProgressService.getProgress(bookId, volumeKey);
  }, [bookId, volumeKey]);

  return {
    saveNow,
    getSavedProgress,
  };
}
