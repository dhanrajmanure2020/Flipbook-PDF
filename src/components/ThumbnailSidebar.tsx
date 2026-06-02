import React from "react";
import { BookOpen, Eye } from "lucide-react";
import { PDFPageCanvas } from "./PDFPageCanvas";

interface ThumbnailSidebarProps {
  currentPage: number;
  totalPages: number;
  pdfDocument: any; // Checked and resolved as PDFJS document
  isExample: boolean;
  onPageChange: (pageNum: number) => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  currentPage,
  totalPages,
  pdfDocument,
  isExample,
  onPageChange,
}) => {
  const getPageTitle = (index: number) => {
    switch (index) {
      case 1: return "Front Cover";
      case 2: return "Contents";
      case 3: return "3D Curvature";
      case 4: return "Sound Synth";
      case 5: return "Ref-Scaling";
      case 6: return "Touch Space";
      case 7: return "Business Case";
      case 8: return "Back Cover";
      default: return `Page ${index}`;
    }
  };

  return (
    <div
      id="thumbnail-sidebar"
      className="w-full md:w-48 bg-white border border-slate-200/70 rounded-xl shadow-xs p-2.5 flex flex-col h-full font-sans select-none overflow-hidden"
    >
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 flex-shrink-0">
        <BookOpen className="w-4 h-4 text-indigo-500" />
        <h3 className="text-xs font-bold text-slate-700 tracking-tight">Pages</h3>
        <span className="ml-auto text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
          {totalPages} Sheets
        </span>
      </div>

      {/* Scroller Area */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5 custom-scrollbar">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              id={`btn-thumb-p${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`w-full text-left p-1.5 rounded-lg border transition-all flex gap-2 items-center group relative overflow-hidden ${
                isActive
                  ? "bg-indigo-50/60 border-indigo-200/80 shadow-xs"
                  : "bg-slate-50/50 border-slate-100 hover:border-slate-350 hover:bg-slate-50"
              }`}
            >
              {/* Spine effect */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                isActive ? "bg-indigo-500" : "bg-slate-200 group-hover:bg-indigo-300"
              }`} />

              {/* Page Number Sphere indicator */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 border transition-all ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-500 border-slate-200 group-hover:border-slate-300"
              }`}>
                {pageNum}
              </div>

              {/* Thumbnail Mini-Preview Canvas (if real PDF, else beautiful placeholder text) */}
              <div className="flex-1 min-w-0">
                {isExample ? (
                  <div className="space-y-0.5">
                    <p className={`text-[11px] font-medium truncate ${isActive ? "text-indigo-950 font-semibold" : "text-slate-700"}`}>
                      {getPageTitle(pageNum)}
                    </p>
                    <p className="text-[8px] text-slate-400 font-mono">Guide</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-11 rounded overflow-hidden border border-slate-200/60 bg-stone-100 flex-shrink-0 flex items-center justify-center relative shadow-xs">
                      {pdfDocument ? (
                        <PDFPageCanvas
                          pdfDocument={pdfDocument}
                          pageNumber={pageNum}
                          zoom={0.12}
                          containerWidth={32}
                          containerHeight={44}
                        />
                      ) : (
                        <div className="text-[7px] font-mono text-slate-300 font-bold">PDF</div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className={`text-[11px] font-medium truncate ${isActive ? "text-indigo-950 font-semibold" : "text-slate-700"}`}>
                        Page {pageNum}
                      </p>
                      <p className="text-[8px] text-slate-400 font-mono">PDF</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mini visual active eye indicator */}
              {isActive && (
                <div className="flex-shrink-0 text-indigo-500 opacity-80 mr-0.5 animate-pulse">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
