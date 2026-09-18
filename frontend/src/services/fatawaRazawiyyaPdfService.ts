// ============================================================================
// FATAWA-E-RAZVIYA PDF SERVICE: High-Resolution Multi-Page Canvas Rendering Engine
// تصنيف: إمام أهل السنة المجدد أحمد رضا خان القادري البريلوي قدس سره
// Renders authentic scanned pages of all 31 volumes with High-DPI typography & caching.
// ============================================================================

import * as pdfjsLib from 'pdfjs-dist';
import { getFatawaVolume } from '../data/fatawaRazawiyyaData';

// Configure Web Worker in browser environment using static public worker file
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const cachedDocPromises = new Map<string, Promise<pdfjsLib.PDFDocumentProxy>>();
const pageCache = new Map<string, Promise<pdfjsLib.PDFPageProxy>>();
const pageRotationCache = new Map<string, number>();

// Concurrency queue to ensure orderly, high-performance canvas rendering across all 31 volumes
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

export class FatawaRazawiyyaPdfService {
  /**
   * Resolve volume local PDF path
   */
  public static getPdfUrl(volumeKey: string = '1.1'): string {
    const volMeta = getFatawaVolume(volumeKey);
    return volMeta.localPdfUrl;
  }

  /**
   * Load and cache the PDF document instance for a specific volume key with automatic retry
   */
  public static getDocument(volumeKey: string = '1.1'): Promise<pdfjsLib.PDFDocumentProxy> {
    const volMeta = getFatawaVolume(volumeKey);
    const key = volMeta.volumeKey;

    if (!cachedDocPromises.has(key)) {
      const loadingTask = pdfjsLib.getDocument({
        url: volMeta.localPdfUrl,
        wasmUrl: '/wasm/',
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/standard_fonts/',
        enableXfa: false,
      });

      const promise = loadingTask.promise.catch((err) => {
        cachedDocPromises.delete(key);
        for (const cacheKey of Array.from(pageCache.keys())) {
          if (cacheKey.startsWith(`${key}_`)) pageCache.delete(cacheKey);
        }
        for (const cacheKey of Array.from(pageRotationCache.keys())) {
          if (cacheKey.startsWith(`${key}_`)) pageRotationCache.delete(cacheKey);
        }
        console.error(`Failed to load Fatawa Razawiyya Vol ${key} PDF document:`, err);
        throw err;
      });

      cachedDocPromises.set(key, promise);
    }
    return cachedDocPromises.get(key)!;
  }

  /**
   * Get cached PDFPageProxy for a specific page number and volume key.
   */
  public static async getPage(pageNumber: number, volumeKey: string = '1.1'): Promise<pdfjsLib.PDFPageProxy> {
    const volMeta = getFatawaVolume(volumeKey);
    const key = volMeta.volumeKey;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const cacheKey = `${key}_${validPage}`;

    if (pageCache.has(cacheKey)) {
      return pageCache.get(cacheKey)!;
    }

    const doc = await this.getDocument(key);
    const pagePromise = doc
      .getPage(validPage)
      .catch((err) => {
        pageCache.delete(cacheKey);
        throw err;
      });

    pageCache.set(cacheKey, pagePromise);
    return pagePromise;
  }

  /**
   * Detect required orientation rotation for a given page.
   */
  public static async getPageRotation(pageNumber: number, volumeKey: string = '1.1'): Promise<number> {
    const volMeta = getFatawaVolume(volumeKey);
    const key = volMeta.volumeKey;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const cacheKey = `${key}_${validPage}`;

    if (pageRotationCache.has(cacheKey)) {
      return pageRotationCache.get(cacheKey)!;
    }

    try {
      const page = await this.getPage(validPage, key);
      const metaRotate = page.rotate || 0;
      const calculatedRotation = (metaRotate % 360 + 360) % 360;

      pageRotationCache.set(cacheKey, calculatedRotation);
      return calculatedRotation;
    } catch {
      return 0;
    }
  }

  /**
   * Set custom rotation override for a specific page (e.g. 0, 90, 180, 270)
   */
  public static setPageRotation(pageNumber: number, rotation: number, volumeKey: string = '1.1'): void {
    const volMeta = getFatawaVolume(volumeKey);
    const key = volMeta.volumeKey;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    pageRotationCache.set(`${key}_${validPage}`, (rotation % 360 + 360) % 360);
  }

  /**
   * Get direct URL to pre-rendered high-resolution WebP image for a specific page.
   * Delivers instantaneous rendering and smooth 60fps scrolling.
   */
  public static getPageImageUrl(pageNumber: number, volumeKey: string = '1.1'): string {
    const volMeta = getFatawaVolume(volumeKey);
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const normalizedVol = volMeta.volumeKey.replace('.', '_');
    return `/fatawa/vol_${normalizedVol}/pages/page_${validPage}.webp`;
  }

  /**
   * Get direct URL to the authentic first page cover image for a specific volume.
   */
  public static getCoverImageUrl(volumeKey: string = '1.1'): string {
    const volMeta = getFatawaVolume(volumeKey);
    const normKey = volMeta.volumeKey.replace('.', '_');
    return `/fatawa/covers/cover_${normKey}.webp`;
  }

  /**
   * Fallback image URL
   */
  public static getFallbackPageImageUrl(pageNumber: number, volumeKey: string = '1.1'): string {
    return this.getPageImageUrl(pageNumber, volumeKey);
  }

  /**
   * Render a specific Fatawa Razawiyya page to a canvas element with High-DPI, correct orientation,
   * custom scale, and crisp typography.
   * Uses concurrency queue for smooth, non-blocking scrolling.
   */
  public static async renderPageToCanvas(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5,
    onRenderTaskCreated?: (task: pdfjsLib.RenderTask) => void,
    rotationOverride?: number,
    volumeKey: string = '1.1'
  ): Promise<{ width: number; height: number }> {
    const volMeta = getFatawaVolume(volumeKey);
    const key = volMeta.volumeKey;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const page = await this.getPage(validPage, key);

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
    const baseRotation = await this.getPageRotation(validPage, key);
    const effectiveRotation =
      rotationOverride !== undefined
        ? ((baseRotation + rotationOverride) % 360 + 360) % 360
        : baseRotation;

    // Calculate viewport with scale, DPR, and proper rotation
    const viewport = page.getViewport({
      scale: scale * dpr,
      rotation: effectiveRotation,
    });

    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      enqueueRender(async () => {
        if (!canvas) {
          resolve({ width: viewport.width, height: viewport.height });
          return;
        }

        // Set internal canvas pixel dimensions for crisp High-DPI rendering
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // CSS display presentation
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = '100%';
        canvas.style.display = 'block';

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          throw new Error('Canvas 2D context not supported');
        }

        // Crisp smoothing settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Pure white background
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
            // Cancellation is an expected flow during rapid scrolling/zooming
            resolve({ width: viewport.width, height: viewport.height });
            return;
          }
          reject(err);
        }
      }).catch(reject);
    });
  }
}
