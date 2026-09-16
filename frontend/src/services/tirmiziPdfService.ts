// ============================================================================
// JAMI' AT-TIRMIZI PDF SERVICE: High-Resolution Multi-Page Canvas Rendering Engine
// Renders authentic scanned pages of Jami' at-Tirmidhi in Urdu
// with High-DPI typography & page caching.
// ============================================================================

import * as pdfjsLib from 'pdfjs-dist';
import { getTirmiziVolume } from '../data/tirmiziData';

// Configure Web Worker in browser environment using static public worker file
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const cachedDocPromises = new Map<number, Promise<pdfjsLib.PDFDocumentProxy>>();
const pageCache = new Map<string, Promise<pdfjsLib.PDFPageProxy>>();
const pageRotationCache = new Map<string, number>();

// Concurrency queue to ensure orderly, high-performance canvas rendering across all pages
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

export class TirmiziPdfService {
  /**
   * Load and cache the PDF document instance for a specific volume with automatic retry on failure
   */
  public static getDocument(volumeNumber: number = 1): Promise<pdfjsLib.PDFDocumentProxy> {
    const volMeta = getTirmiziVolume(volumeNumber);
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
        // Clear cached promise on failure so subsequent requests can retry
        cachedDocPromises.delete(vol);
        for (const key of Array.from(pageCache.keys())) {
          if (key.startsWith(`${vol}_`)) pageCache.delete(key);
        }
        for (const key of Array.from(pageRotationCache.keys())) {
          if (key.startsWith(`${vol}_`)) pageRotationCache.delete(key);
        }
        console.error(`Failed to load Jami' at-Tirmidhi Vol ${vol} PDF document:`, err);
        throw err;
      });

      cachedDocPromises.set(vol, promise);
    }
    return cachedDocPromises.get(vol)!;
  }

  /**
   * Get cached PDFPageProxy for a specific page number and volume.
   */
  public static async getPage(pageNumber: number, volumeNumber: number = 1): Promise<pdfjsLib.PDFPageProxy> {
    const volMeta = getTirmiziVolume(volumeNumber);
    const vol = volMeta.volumeNumber;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const cacheKey = `${vol}_${validPage}`;

    if (pageCache.has(cacheKey)) {
      return pageCache.get(cacheKey)!;
    }

    const doc = await this.getDocument(vol);
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
  public static async getPageRotation(pageNumber: number, volumeNumber: number = 1): Promise<number> {
    const volMeta = getTirmiziVolume(volumeNumber);
    const vol = volMeta.volumeNumber;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const cacheKey = `${vol}_${validPage}`;

    if (pageRotationCache.has(cacheKey)) {
      return pageRotationCache.get(cacheKey)!;
    }

    try {
      const page = await this.getPage(validPage, vol);
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
  public static setPageRotation(pageNumber: number, rotation: number, volumeNumber: number = 1): void {
    const volMeta = getTirmiziVolume(volumeNumber);
    const vol = volMeta.volumeNumber;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    pageRotationCache.set(`${vol}_${validPage}`, (rotation % 360 + 360) % 360);
  }

  /**
   * Get direct URL to pre-rendered high-resolution WebP image for a specific page.
   * Delivers instantaneous rendering and smooth 60fps scrolling.
   */
  public static getPageImageUrl(pageNumber: number, volumeNumber: number = 1): string {
    const volMeta = getTirmiziVolume(volumeNumber);
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    if (volMeta.volumeNumber === 1) {
      return `/tirmizi/vol1/pages/page_${validPage}.webp`;
    }
    return `/tirmizi/vol${volMeta.volumeNumber}/pages/page_${validPage}.webp`;
  }

  /**
   * Fallback image URL
   */
  public static getFallbackPageImageUrl(pageNumber: number, volumeNumber: number = 1): string {
    return this.getPageImageUrl(pageNumber, volumeNumber);
  }

  /**
   * Render a specific Jami' at-Tirmidhi page to a canvas element with High-DPI,
   * correct orientation, and custom scale.
   * Uses concurrency queue for smooth, non-blocking scrolling.
   */
  public static async renderPageToCanvas(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5,
    onRenderTaskCreated?: (task: pdfjsLib.RenderTask) => void,
    rotationOverride?: number,
    volumeNumber: number = 1
  ): Promise<{ width: number; height: number }> {
    const volMeta = getTirmiziVolume(volumeNumber);
    const vol = volMeta.volumeNumber;
    const validPage = Math.max(1, Math.min(volMeta.totalPages, pageNumber));
    const page = await this.getPage(validPage, vol);

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
    const baseRotation = await this.getPageRotation(validPage, vol);
    const effectiveRotation =
      rotationOverride !== undefined
        ? ((baseRotation + rotationOverride) % 360 + 360) % 360
        : baseRotation;

    const viewport = page.getViewport({
      scale: scale * dpr,
      rotation: effectiveRotation,
    });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
    canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await enqueueRender(async () => {
      const renderTask = page.render({
        canvasContext: ctx,
        canvas: canvas,
        viewport,
        intent: 'display',
      });

      if (onRenderTaskCreated) {
        onRenderTaskCreated(renderTask);
      }

      await renderTask.promise;
    });

    return {
      width: Math.floor(viewport.width / dpr),
      height: Math.floor(viewport.height / dpr),
    };
  }
}
