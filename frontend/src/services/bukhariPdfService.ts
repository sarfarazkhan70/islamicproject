// ============================================================================
// BUKHARI PDF SERVICE: High-Resolution Multi-Volume Multi-Page Canvas Rendering Engine
// Renders authentic scanned pages of Bukhari Shareef (Jild 1: 699 Pages, Jild 2: 691 Pages)
// with crisp High-DPI typography, caching & concurrency queue.
// ============================================================================

import * as pdfjsLib from 'pdfjs-dist';
import { getBukhariVolume } from '../data/bukhariData';

// Configure Web Worker in browser environment using static public worker file
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const cachedDocPromises = new Map<number, Promise<pdfjsLib.PDFDocumentProxy>>();
const pageCache = new Map<string, Promise<pdfjsLib.PDFPageProxy>>();

// Concurrency queue to ensure orderly, high-performance canvas rendering
type RenderQueueItem = () => Promise<void>;
const renderQueue: RenderQueueItem[] = [];
let activeRendersCount = 0;
const MAX_CONCURRENT_RENDERS = 3;

function processQueue(): void {
  while (activeRendersCount < MAX_CONCURRENT_RENDERS && renderQueue.length > 0) {
    const nextTask = renderQueue.shift();
    if (nextTask) {
      activeRendersCount++;
      nextTask().finally(() => {
        activeRendersCount--;
        processQueue();
      });
    }
  }
}

function enqueueRender(task: () => Promise<void>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const wrappedTask = async () => {
      try {
        await task();
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    renderQueue.push(wrappedTask);
    processQueue();
  });
}

export class BukhariPdfService {
  /**
   * Resolve volume local PDF path
   */
  public static getPdfUrl(volumeNumber: number = 1): string {
    const volMeta = getBukhariVolume(volumeNumber);
    return volMeta.localPdfUrl;
  }

  /**
   * Resolve volume cover image URL
   */
  public static getCoverImageUrl(volumeNumber: number = 1): string {
    return `/bukhari/covers/cover_${volumeNumber}.webp`;
  }

  /**
   * Resolve high-resolution pre-rendered page image URL
   */
  public static getPageImageUrl(pageNumber: number, volumeNumber: number = 1): string {
    if (volumeNumber === 1) {
      return `/bukhari/pages/page_${pageNumber}.webp`;
    }
    return `/bukhari/vol2/pages/page_${pageNumber}.webp`;
  }

  /**
   * Resolve secondary fallback page image URL
   */
  public static getPageFallbackUrl(pageNumber: number, volumeNumber: number = 1): string {
    if (volumeNumber === 1) {
      return `/bukhari/pages/page_${pageNumber}.jpg`;
    }
    return `/bukhari/vol2/pages/page_${pageNumber}.webp`;
  }

  /**
   * Load and cache the PDF document instance with automatic retry on failure
   */
  public static getDocument(volumeNumber: number = 1): Promise<pdfjsLib.PDFDocumentProxy> {
    const volMeta = getBukhariVolume(volumeNumber);
    const vol = volMeta.volumeNumber;

    if (!cachedDocPromises.has(vol)) {
      const loadingTask = pdfjsLib.getDocument({
        url: volMeta.localPdfUrl,
        wasmUrl: '/wasm/',
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/standard_fonts/',
        enableXfa: false,
      });

      const promise = loadingTask.promise.catch((err) => {
        cachedDocPromises.delete(vol);
        for (const key of Array.from(pageCache.keys())) {
          if (key.startsWith(`${vol}_`)) pageCache.delete(key);
        }
        console.error(`Failed to load Bukhari Vol ${vol} PDF document:`, err);
        throw err;
      });

      cachedDocPromises.set(vol, promise);
    }
    return cachedDocPromises.get(vol)!;
  }

  /**
   * Get cached PDFPageProxy for a specific page number and volume
   */
  public static async getPage(pageNumber: number, volumeNumber: number = 1): Promise<pdfjsLib.PDFPageProxy> {
    const volMeta = getBukhariVolume(volumeNumber);
    const vol = volMeta.volumeNumber;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const cacheKey = `${vol}_${validPage}`;

    if (pageCache.has(cacheKey)) {
      return pageCache.get(cacheKey)!;
    }

    const doc = await this.getDocument(vol);
    const pagePromise = doc.getPage(validPage).catch((err) => {
      pageCache.delete(cacheKey);
      throw err;
    });

    pageCache.set(cacheKey, pagePromise);
    return pagePromise;
  }

  /**
   * Render a specific Bukhari page to a canvas element with High-DPI and custom scale.
   */
  public static async renderPageToCanvas(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5,
    onRenderTaskCreated?: (task: pdfjsLib.RenderTask) => void,
    volumeNumber: number = 1
  ): Promise<{ width: number; height: number }> {
    const volMeta = getBukhariVolume(volumeNumber);
    const vol = volMeta.volumeNumber;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const page = await this.getPage(validPage, vol);

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
    const viewport = page.getViewport({ scale: scale * dpr, rotation: page.rotate || 0 });

    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      enqueueRender(async () => {
        if (!canvas) {
          resolve({ width: viewport.width, height: viewport.height });
          return;
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = '100%';
        canvas.style.display = 'block';

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          throw new Error('Canvas 2D context not supported');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          canvas: canvas,
          viewport: viewport,
        });

        if (onRenderTaskCreated) {
          onRenderTaskCreated(renderTask);
        }

        try {
          await renderTask.promise;
          resolve({ width: viewport.width, height: viewport.height });
        } catch (err: unknown) {
          const error = err as { name?: string; message?: string };
          if (
            error?.name === 'RenderingCancelledException' ||
            error?.message?.includes('cancelled')
          ) {
            resolve({ width: viewport.width, height: viewport.height });
            return;
          }
          reject(err);
        }
      }).catch(reject);
    });
  }
}
