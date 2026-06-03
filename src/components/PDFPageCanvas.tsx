import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

// Global memory cache for rendered PDF pages to eliminate double loading and slow covers flipping
const pageRenderCache: { [key: string]: { dataUrl: string; width: number; height: number } } = {};
let cachedFingerprint = "";

const checkAndClearCache = (pdfDoc: any) => {
  if (!pdfDoc) return;
  const fp = pdfDoc.fingerprint || String(pdfDoc.numPages);
  if (cachedFingerprint !== fp) {
    cachedFingerprint = fp;
    // Clear all entries
    for (const key in pageRenderCache) {
      delete pageRenderCache[key];
    }
  }
};

interface PDFPageCanvasProps {
  pdfDocument: any; // Checked and resolved as pdfjs.PdfDocument
  pageNumber: number;
  zoom: number; // multiplier e.g. 1.0, 1.5, 2.0
  containerWidth: number;
  containerHeight: number;
  onPageSizeLoad?: (width: number, height: number) => void;
}

export const PDFPageCanvas: React.FC<PDFPageCanvasProps> = ({
  pdfDocument,
  pageNumber,
  zoom,
  containerWidth,
  containerHeight,
  onPageSizeLoad,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    // Fast guards
    if (!pdfDocument || pageNumber < 1 || pageNumber > pdfDocument.numPages) {
      setLoading(false);
      setError("Page out of bounds");
      return;
    }

    const renderPage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cancel previous render tasks if running
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // standard silent abort
          }
          renderTaskRef.current = null;
        }

        checkAndClearCache(pdfDocument);
        const cacheKey = `${pdfDocument.fingerprint || pdfDocument.numPages}_p${pageNumber}_z${zoom}_w${Math.round(containerWidth)}_h${Math.round(containerHeight)}`;
        const cached = pageRenderCache[cacheKey];

        if (cached) {
          const canvas = canvasRef.current;
          if (canvas) {
            const context = canvas.getContext("2d", { alpha: false });
            if (context) {
              const img = new Image();
              img.onload = () => {
                if (!active) return;
                const dpr = window.devicePixelRatio || 1;
                canvas.width = cached.width * dpr;
                canvas.height = cached.height * dpr;
                canvas.style.width = `${cached.width}px`;
                canvas.style.height = `${cached.height}px`;

                context.setTransform(dpr, 0, 0, dpr, 0, 0);
                
                // Explicitly fill canvas with solid white to cover any transparent spots
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, cached.width, cached.height);

                context.drawImage(img, 0, 0, cached.width, cached.height);
                setLoading(false);
              };
              img.onerror = () => {
                renderFullPage(cacheKey);
              };
              img.src = cached.dataUrl;
              return;
            }
          }
        }

        await renderFullPage(cacheKey);
      } catch (err: any) {
        if (active && err?.name !== "RenderingCancelledException" && err?.name !== "WorkerDragCancelled") {
          console.error("PDF page render error:", err);
          setError("Failed to render page");
          setLoading(false);
        }
      }
    };

    const renderFullPage = async (key: string) => {
      const page = await pdfDocument.getPage(pageNumber);
      if (!active) return;

      // Get native viewpoint aspect
      const originalViewport = page.getViewport({ scale: 1.0 });
      const nativeWidth = originalViewport.width;
      const nativeHeight = originalViewport.height;

      if (onPageSizeLoad) {
        onPageSizeLoad(nativeWidth, nativeHeight);
      }

      // Compute local viewport constraints
      const scaleX = containerWidth / nativeWidth;
      const scaleY = containerHeight / nativeHeight;
      
      // Fit within container while preserving proportion, then multiply by zoom
      const scaleToFit = Math.min(scaleX, scaleY);
      // Fallback to sensible scale if width/height is empty
      const finalScale = (scaleToFit > 0 ? scaleToFit : 1.0) * zoom;

      const viewport = page.getViewport({ scale: finalScale });

      const canvas = canvasRef.current;
      if (!canvas || !active) return;

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        setError("Could not acquire 2D context");
        setLoading(false);
        return;
      }

      // HD high DPI compensation
      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      // Scale context drawing
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Draw background white first to prevent dark backgrounds peeking
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, viewport.width, viewport.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;

      if (active) {
        // Save to cache
        try {
          if (Object.keys(pageRenderCache).length > 60) {
            // Keep memory footprint reasonable during extensive zooming/resizing
            for (const k in pageRenderCache) {
              delete pageRenderCache[k];
            }
          }
          const dataUrl = canvas.toDataURL("image/png");
          pageRenderCache[key] = {
            dataUrl,
            width: viewport.width,
            height: viewport.height
          };
        } catch (cacheError) {
          console.warn("Failed to save page to cache:", cacheError);
        }
        setLoading(false);
      }
    };

    // Use quick debounce delay to prevent intermediate rendering stutter when flipping super-fast
    const timer = setTimeout(() => {
      renderPage();
    }, 50);

    return () => {
      active = false;
      clearTimeout(timer);
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [pdfDocument, pageNumber, zoom, containerWidth, containerHeight]);

  return (
    <div
      ref={containerRef}
      id={`canvas-container-p${pageNumber}`}
      className="relative flex items-center justify-center w-full h-full bg-white select-none overflow-hidden rounded shadow-sm"
      style={{ backgroundColor: "#ffffff", background: "#ffffff" }}
    >
      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        id={`canvas-page-${pageNumber}`}
        className={`bg-white transition-opacity duration-300 max-w-full max-h-full ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: "#ffffff", background: "#ffffff" }}
      />

      {/* Loading overlay */}
      {loading && (
        <div id="loading-overlay" className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 text-slate-500 font-sans gap-2 animate-pulse">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-[11px] font-mono tracking-wider">LOADING PAGE {pageNumber}...</span>
        </div>
      )}

      {/* Error Boundary display */}
      {error && !loading && (
        <div id="error-overlay" className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-white text-red-500 gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-xs font-semibold">{error}</p>
          <p className="text-[10px] text-slate-400 font-mono">Page {pageNumber}</p>
        </div>
      )}
    </div>
  );
};
