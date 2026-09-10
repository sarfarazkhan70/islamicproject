// ============================================================================
// BUKHARI PDF SERVICE: High-Resolution Page Canvas Engine
// Renders the exact scanned pages of the Google Drive Bukhari Shareef PDF
// at large scale (125%, 150%, 175%, 200%) with crisp High-DPI typography.
// ============================================================================

import * as pdfjsLib from 'pdfjs-dist';
import { LOCAL_BUKHARI_PDF_PATH } from '../data/bukhariData';

// Configure Web Worker in browser environment
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

let cachedDocPromise: Promise<pdfjsLib.PDFDocumentProxy> | null = null;

export class BukhariPdfService {
  /**
   * Load and cache the PDF document instance
   */
  public static getDocument(): Promise<pdfjsLib.PDFDocumentProxy> {
    if (!cachedDocPromise) {
      const loadingTask = pdfjsLib.getDocument({
        url: LOCAL_BUKHARI_PDF_PATH,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
        cMapPacked: true,
      });
      cachedDocPromise = loadingTask.promise;
    }
    return cachedDocPromise;
  }

  /**
   * Render a specific page to a canvas element with High-DPI and custom scale.
   * Preserves exact proportions without distortion.
   */
  public static async renderPageToCanvas(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5,
    onRenderTaskCreated?: (task: pdfjsLib.RenderTask) => void
  ): Promise<{ width: number; height: number }> {
    const doc = await this.getDocument();
    const page = await doc.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Canvas 2D context not supported');
    }

    // High quality crisp text rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear background to clean white before rendering page
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const renderTask = page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    });

    if (onRenderTaskCreated) {
      onRenderTaskCreated(renderTask);
    }

    await renderTask.promise;
    return { width: viewport.width, height: viewport.height };
  }
}
