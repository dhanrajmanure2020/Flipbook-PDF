import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

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
          setLoading(false);
        }
      } catch (err: any) {
        if (active && err?.name !== "RenderingCancelledException" && err?.name !== "WorkerDragCancelled") {
          console.error("PDF page render error:", err);
          setError("Failed to render page");
          setLoading(false);
        }
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
      className="relative flex items-center justify-center w-full h-full bg-stone-100 select-none overflow-hidden rounded shadow-sm"
    >
      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        id={`canvas-page-${pageNumber}`}
        className={`bg-white transition-opacity duration-300 max-w-full max-h-full ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Loading overlay */}
      {loading && (
        <div id="loading-overlay" className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100/90 text-slate-500 font-sans gap-2 animate-pulse">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-[11px] font-mono tracking-wider">LOADING PAGE {pageNumber}...</span>
        </div>
      )}

      {/* Error Boundary display */}
      {error && !loading && (
        <div id="error-overlay" className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-stone-100 text-red-500 gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-xs font-semibold">{error}</p>
          <p className="text-[10px] text-slate-400 font-mono">Page {pageNumber}</p>
        </div>
      )}
    </div>
  );
};
