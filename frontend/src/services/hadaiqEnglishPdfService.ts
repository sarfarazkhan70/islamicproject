// ============================================================================
// HADAIQ-E-BAKHSHISH ENGLISH PDF SERVICE: High-Resolution Canvas Rendering Engine
// Renders authentic scanned pages of Hadaiq-e-Bakhshish English Edition (All 319 Pages)
// with crisp High-DPI typography, caching & concurrency queue.
// ============================================================================

import * as pdfjsLib from 'pdfjs-dist';
import { LOCAL_HADAIQ_ENGLISH_PDF_PATH } from '../data/hadaiqEnglishData';

// Configure Web Worker in browser environment using static public worker file
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

let cachedDocPromise: Promise<pdfjsLib.PDFDocumentProxy> | null = null;
const pageCache = new Map<number, Promise<pdfjsLib.PDFPageProxy>>();

// Concurrency queue to ensure orderly, high-performance canvas rendering across all 319 pages
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

export class HadaiqEnglishPdfService {
  /**
   * Load and cache the PDF document instance with automatic retry on failure
   */
  public static getDocument(): Promise<pdfjsLib.PDFDocumentProxy> {
    if (!cachedDocPromise) {
      const loadingTask = pdfjsLib.getDocument({
        url: LOCAL_HADAIQ_ENGLISH_PDF_PATH,
        wasmUrl: '/wasm/',
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/standard_fonts/',
        enableXfa: false,
      });

      cachedDocPromise = loadingTask.promise.catch((err) => {
        // Clear cached promise on failure so subsequent requests can retry
        cachedDocPromise = null;
        pageCache.clear();
        console.error('Failed to load Hadaiq-e-Bakhshish English PDF document:', err);
        throw err;
      });
    }
    return cachedDocPromise;
  }

  /**
   * Get cached PDFPageProxy for a specific page number (1 to 319)
   */
  public static async getPage(pageNumber: number): Promise<pdfjsLib.PDFPageProxy> {
    if (pageCache.has(pageNumber)) {
      return pageCache.get(pageNumber)!;
    }

    const doc = await this.getDocument();
    const pagePromise = doc.getPage(pageNumber).catch((err) => {
      pageCache.delete(pageNumber);
      throw err;
    });

    pageCache.set(pageNumber, pagePromise);
    return pagePromise;
  }

  /**
   * Render a specific Hadaiq-e-Bakhshish English page to a canvas element with High-DPI and custom scale.
   * Uses concurrency queue for smooth, non-blocking scrolling across all 319 pages.
   */
  public static async renderPageToCanvas(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5,
    onRenderTaskCreated?: (task: pdfjsLib.RenderTask) => void
  ): Promise<{ width: number; height: number }> {
    const page = await this.getPage(pageNumber);

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;
    // Calculate viewport directly with DPR scale for crisp typography
    const viewport = page.getViewport({ scale: scale * dpr });

    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      enqueueRender(async () => {
        if (!canvas) {
          resolve({ width: viewport.width, height: viewport.height });
          return;
        }

        // Set internal canvas pixel dimensions for crisp rendering
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

        // White background
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
