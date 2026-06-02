import React, { useState, useRef } from "react";
import { FileUp, FileText, Sparkles, BookOpen, Trash2, ArrowRight } from "lucide-react";
import { playClickSound } from "./AudioEngine";
import { PDFFileState } from "../types";

interface UploadViewProps {
  onFileSelect: (file: File) => void;
  onSelectExample: () => void;
  currentFile: PDFFileState | null;
  onClearFile: () => void;
  onViewFlipbook: () => void;
  loadError?: string | null;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onFileSelect,
  onSelectExample,
  currentFile,
  onClearFile,
  onViewFlipbook,
  loadError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSelectFile = (file: File | null) => {
    if (!file) return;
    setErrorMessage(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Unsupported file type. Please select a valid PDF document.");
      return;
    }

    // Limit maximum size to 100MB to avoid frame crash
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File exceeds 100MB. Please choose a smaller document.");
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    playClickSound();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div id="upload-screen-container" className="w-full max-w-xl mx-auto space-y-8 font-sans px-4 select-none">
      
      {/* Header and subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 rounded-full font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Editorial Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          3D Digital Leaflet Creator
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Convert flat documents and brochures into tactile 3D books with authentic paper swipe animations.
        </p>
      </div>

      {/* Main Drag-and-drop workspace */}
      <div
        id="drag-and-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragging
            ? "border-blue-500 bg-blue-50/40 ring-4 ring-blue-50"
            : "border-slate-200 bg-white hover:border-blue-400/80 shadow-sm"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-file-selector"
        />

        {!currentFile ? (
          /* Blank state ready click upload */
          <div className="space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <FileUp className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={triggerBrowse}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 outline-none hover:underline focus:underline"
              >
                Upload PDF
              </button>
              <p className="text-xs text-slate-400">or drag & drop your file here</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] uppercase font-mono tracking-widest text-slate-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Supported format: PDF</span>
            </div>
          </div>
        ) : (
          /* File Preview active card state */
          <div className="space-y-6">
            <div className="mx-auto max-w-sm bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 relative text-left">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50" />
              <div className="w-10 h-12 bg-red-50 text-red-600 rounded flex items-center justify-center border border-red-100 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate" title={currentFile.name}>
                  {currentFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {currentFile.size}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  onClearFile();
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white border border-transparent hover:border-red-100 transition-all"
                title="Remove Selected File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  playClickSound();
                  onViewFlipbook();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
                title="Open 3D Magazine"
              >
                <span>View PDF Flipbook</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Absolute error overlay display */}
        {(errorMessage || loadError) && (
          <p className="mt-3 text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-center justify-center gap-1.5 animate-shake">
            <span>{errorMessage || loadError}</span>
          </p>
        )}
      </div>

      {/* Skipping / preset guide bypass */}
      {!currentFile && (
        <div id="example-booklet-bypass-panel" className="bg-slate-100/60 rounded-2xl p-5 border border-slate-200 text-center space-y-3 shadow-inner">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Don't have a PDF ready?</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Skip uploads and immediately try out our gorgeous pre-compiled Editorial Design guidelines guide.
          </p>
          <button
            onClick={() => {
              playClickSound();
              onSelectExample();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 shadow-sm active:scale-[0.98] transition-all"
          >
            <span>Explore Sample Booklet</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          </button>
        </div>
      )}

      {/* Footnote requirements */}
      <div id="footer-footnote" className="text-center text-[10px] text-slate-400 font-mono">
        All processings happen client-side in browser memory.
      </div>

    </div>
  );
};
