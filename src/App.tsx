import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Upload, 
  Minimize2, 
  Sparkles, 
  FileText, 
  Cpu, 
  Undo2 
} from "lucide-react";
import { UploadView } from "./components/UploadView";
import { Flipbook } from "./components/Flipbook";
import { Toolbar } from "./components/Toolbar";
import { ThumbnailSidebar } from "./components/ThumbnailSidebar";
import { EmbedCard } from "./components/EmbedCard";
import { Logo } from "./components/Logo";
import { WELCOME_PAGES_COUNT, WELCOME_ASPECT_RATIO } from "./components/WelcomeBooklet";
import { PDFFileState } from "./types";
import { playClickSound, playPageTurnSound, setSoundMuted } from "./components/AudioEngine";

// Dynamically load PDFJS from CDN if not already available
const getPdfJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window context not available"));
      return;
    }
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    
    const scriptId = "pdfjs-dynamic-script-loader";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      document.head.appendChild(script);
    }
    
    const handleLoad = () => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
      } else {
        reject(new Error("pdfjsLib was loaded but the global object was not found."));
      }
    };
    
    const handleError = () => {
      reject(new Error("Failed to load PDF library from CDN. Please check your network connection."));
    };
    
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
  });
};

export default function App() {
  // Navigation: screen state
  const [activeScreen, setActiveScreen] = useState<"upload" | "viewer">("upload");

  // File Upload states
  const [currentFile, setCurrentFile] = useState<PDFFileState | null>(null);
  const [isExampleBooklet, setIsExampleBooklet] = useState<boolean>(true);

  // PDF.js parsed document object
  const [pdfDocument, setPdfDocument] = useState<any | null>(null);
  const [totalPages, setTotalPages] = useState<number>(WELCOME_PAGES_COUNT);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);

  // Toolbar & view preference states
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState<boolean>(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(3000); // 3 seconds interval
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [forceSinglePage, setForceSinglePage] = useState<boolean>(false);

  // Helper: Format file sizes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Parsing dynamic URL parameter on mount to load arbitrary PDFs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pdfUrl = params.get("pdf") || params.get("file") || params.get("src");

    if (pdfUrl) {
      setPdfLoadError(null);
      setPdfLoading(true);
      setActiveScreen("viewer");
      setIsExampleBooklet(false);

      const fileName = pdfUrl.substring(pdfUrl.lastIndexOf("/") + 1) || "Document.pdf";

      getPdfJS()
        .then((pdfjsLib) => {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

          fetch(pdfUrl)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to download resource (${res.status} ${res.statusText})`);
              }
              return res.arrayBuffer();
            })
            .then((arrayBuffer) => {
              const newFileState: PDFFileState = {
                file: null,
                name: fileName,
                size: formatBytes(arrayBuffer.byteLength),
                url: pdfUrl,
              };
              setCurrentFile(newFileState);

              const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
              loadingTask.promise.then(
                (pdf: any) => {
                  setPdfDocument(pdf);
                  setTotalPages(pdf.numPages);
                  setCurrentPage(1);
                  setPdfLoading(false);
                },
                (err: any) => {
                  console.error("PDF.js remote document error:", err);
                  setPdfLoadError("Unable to render the target PDF correctly. It may be corrupted or blocked.");
                  setPdfLoading(false);
                }
              );
            })
            .catch((err) => {
              console.error("Fetch arrayBuffer failure:", err);
              setPdfLoadError(`Unable to fetch PDF asset (${err.message}). Ensure the file exists at this path.`);
              setPdfLoading(false);
            });
        })
        .catch((err) => {
          console.error("Core engine initialize error:", err);
          setPdfLoadError(err.message || "Failed to load PDF engine.");
          setPdfLoading(false);
        });
    }
  }, []);

  // State trigger: Selected sample booklet
  const handleSelectExample = () => {
    setIsExampleBooklet(true);
    setPdfDocument(null);
    setTotalPages(WELCOME_PAGES_COUNT);
    setCurrentPage(1);
    setActiveScreen("viewer");
  };

  // State trigger: Selected real custom PDF
  const handleFileSelect = (file: File) => {
    setPdfLoadError(null);
    setPdfLoading(true);

    // Free previous object URL to prevent leaks
    if (currentFile?.url) {
      URL.revokeObjectURL(currentFile.url);
    }

    const objectUrl = URL.createObjectURL(file);
    const newFileState: PDFFileState = {
      file: file,
      name: file.name,
      size: formatBytes(file.size),
      url: objectUrl,
    };

    setCurrentFile(newFileState);
    setIsExampleBooklet(false);

    getPdfJS()
      .then((pdfjsLib) => {
        // Set worker sources explicitly
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        // Read file as ArrayBuffer for reliable iframe and local load without blob URL fetch blocks
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            setPdfLoadError("Failed to parse the PDF file data pointer.");
            setPdfLoading(false);
            setCurrentFile(null);
            return;
          }

          try {
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            loadingTask.promise.then(
              (pdf: any) => {
                setPdfDocument(pdf);
                setTotalPages(pdf.numPages);
                setCurrentPage(1);
                setPdfLoading(false);
                // Auto open the viewer upon successful parse
                setActiveScreen("viewer");
              },
              (err: any) => {
                console.error("PDF.js loading task rejected:", err);
                setPdfLoadError("Could not render this PDF. The file might be corrupted, password protected, or restricted.");
                setPdfLoading(false);
                setCurrentFile(null);
              }
            );
          } catch (err) {
            console.error("PDF.js getDocument initialization error:", err);
            setPdfLoadError("The PDF rendering engine failed to initialize the file.");
            setPdfLoading(false);
            setCurrentFile(null);
          }
        };

        reader.onerror = (err) => {
          console.error("FileReader error:", err);
          setPdfLoadError("Failed to read the file from your disk storage.");
          setPdfLoading(false);
          setCurrentFile(null);
        };

        reader.readAsArrayBuffer(file);
      })
      .catch((err) => {
        console.error("Dynamic PDFJS loading error:", err);
        setPdfLoadError(err.message || "Could not load the core PDF processing engine.");
        setPdfLoading(false);
        setCurrentFile(null);
      });
  };

  // Clear PDF upload reference
  const handleClearFile = () => {
    if (currentFile?.url) {
      URL.revokeObjectURL(currentFile.url);
    }
    setCurrentFile(null);
    setPdfDocument(null);
    setIsExampleBooklet(true);
    setTotalPages(WELCOME_PAGES_COUNT);
    setCurrentPage(1);
  };

  // Automated slideshow player
  useEffect(() => {
    if (!isSlideshowPlaying) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => {
        // Double spreadsheet step if applicable
        const isSingleMode = forceSinglePage || window.innerWidth < 768;
        const step = isSingleMode ? 1 : 2;
        const target = prev === 1 && step > 1 ? 2 : prev + step;

        if (target > totalPages) {
          setIsSlideshowPlaying(false);
          return prev;
        }

        playPageTurnSound();
        return target;
      });
    }, slideshowSpeed);

    return () => clearInterval(interval);
  }, [isSlideshowPlaying, totalPages, slideshowSpeed, forceSinglePage]);

  // Clean-up active Object URLs on unmount
  useEffect(() => {
    return () => {
      if (currentFile?.url) {
        URL.revokeObjectURL(currentFile.url);
      }
    };
  }, [currentFile]);

  // Handle Mute actions
  const handleMuteToggle = () => {
    const nextMuteValue = !isMuted;
    setIsMuted(nextMuteValue);
    setSoundMuted(nextMuteValue);
  };

  // Immersive Reading Fullscreen triggers with frame fallbacks
  const handleFullscreenToggle = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handlePageChange = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const resetInteractiveConfig = () => {
    setZoom(1.0);
    setIsSlideshowPlaying(false);
    setSidebarOpen(true);
    setCurrentPage(1);
    setForceSinglePage(false);
  };

  return (
    <div
      id="flipbook-app-root"
      className={`min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 ${
        isFullscreen ? "fixed inset-0 z-50 bg-slate-900" : ""
      }`}
    >
      {/* Dynamic Navigation Header Panel (Hidden if immersive fullscreen is active) */}
      {!isFullscreen && (
        <header
          id="app-header"
          className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 select-none py-4 px-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Logo and meta of sleek theme */}
            <div className="flex items-center gap-3">
              <Logo />
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/50">
              <button
                id="tab-upload"
                onClick={() => {
                  playClickSound();
                  setActiveScreen("upload");
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeScreen === "upload"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>PDF Upload Screen</span>
              </button>

              <button
                id="tab-viewer"
                onClick={() => {
                  playClickSound();
                  setActiveScreen("viewer");
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeScreen === "viewer"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Digital Flipbook Viewer</span>
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Main viewport canvas layout */}
      <main className={`flex-1 flex flex-col relative ${isFullscreen ? "bg-[#141517] p-2" : ""}`}>
        
        {/* Fullscreen Overlay Close back to window header (Only visible when isFullscreen) */}
        {isFullscreen && (
          <div className="absolute top-4 left-4 z-40 bg-black/40 backdrop-blur border border-white/10 rounded-full p-2 flex items-center gap-2">
            <button
              id="fullscreen-close-pill"
              onClick={handleFullscreenToggle}
              className="text-white/80 hover:text-white transition-all flex items-center justify-center p-1.5 bg-blue-600/40 hover:bg-blue-600 rounded-full"
              title="Exit Immersive Presentation View"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <span className="text-white/60 text-[10px] font-mono tracking-wider pr-2">
              IMMERSIVE FIELD MODE
            </span>
          </div>
        )}

        {/* Dynamic Screen Routing */}
        {activeScreen === "upload" ? (
          /* SCREEN 1: PDF UPLOAD SCREEN */
          <div className="flex-1 flex items-center justify-center py-12 bg-gradient-to-b from-white to-slate-50">
            {pdfLoading ? (
              <div className="text-center space-y-3 animate-pulse">
                <Cpu className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Analyzing Document Matrix...</p>
                <p className="text-xs text-slate-400 font-mono">Initializing vector map offsets</p>
              </div>
            ) : (
              <UploadView
                onFileSelect={handleFileSelect}
                onSelectExample={handleSelectExample}
                currentFile={currentFile}
                onClearFile={handleClearFile}
                onViewFlipbook={() => setActiveScreen("viewer")}
                loadError={pdfLoadError}
              />
            )}
          </div>
        ) : (
          /* SCREEN 2: PDF FLIPBOOK VIEWER SCREEN */
          <div className={`flex-1 flex flex-col ${isFullscreen ? "h-screen overflow-hidden" : "max-w-none w-full p-4 md:p-6 md:px-8 pb-16"} gap-6`}>
            
            {/* Upper interactive workstation container */}
            <div className={`flex flex-col gap-4 ${isFullscreen ? "flex-1" : "flex-1 min-h-[440px] md:min-h-[580px] h-auto lg:h-[78vh]"}`}>

              {/* Core flipbook stage workspace */}
              <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                {/* Central 3D Flip Canvas viewport */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col overflow-hidden relative shadow-inner">
                  <Flipbook
                    pdfDocument={pdfDocument}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    isExample={isExampleBooklet}
                    zoom={zoom}
                    forceSinglePage={forceSinglePage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>

              {/* Bottom floating control bar */}
              <Toolbar
                currentPage={currentPage}
                totalPages={totalPages}
                isMuted={isMuted}
                isSlideshowPlaying={isSlideshowPlaying}
                sidebarOpen={sidebarOpen}
                zoom={zoom}
                slideshowSpeed={slideshowSpeed}
                isFullscreen={isFullscreen}
                forceSinglePage={forceSinglePage}
                onPageChange={handlePageChange}
                onSidebarToggle={() => setSidebarOpen((p) => !p)}
                onMuteToggle={handleMuteToggle}
                onSlideshowToggle={() => setIsSlideshowPlaying((p) => !p)}
                onSlideshowSpeedChange={setSlideshowSpeed}
                onZoomChange={setZoom}
                onFullscreenToggle={handleFullscreenToggle}
                onReset={resetInteractiveConfig}
                onToggleViewMode={() => setForceSinglePage((prev) => !prev)}
              />
            </div>

            {/* Seamless Embed Config & HTML Iframe Code Downloader */}
            {!isFullscreen && (
              <EmbedCard currentFile={currentFile} />
            )}

          </div>
        )}
      </main>
    </div>
  );
}
