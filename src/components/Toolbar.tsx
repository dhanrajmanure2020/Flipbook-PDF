import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Volume2, 
  VolumeX, 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Plus,
  Minus,
  Book,
  BookOpen
} from "lucide-react";
import { playClickSound } from "./AudioEngine";

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  isMuted: boolean;
  isSlideshowPlaying: boolean;
  sidebarOpen: boolean;
  zoom: number;
  slideshowSpeed: number; // millisecond intervals
  isFullscreen: boolean;
  forceSinglePage: boolean;
  onPageChange: (pageNum: number) => void;
  onSidebarToggle: () => void;
  onMuteToggle: () => void;
  onSlideshowToggle: () => void;
  onSlideshowSpeedChange: (speedMs: number) => void;
  onZoomChange: (newZoom: number) => void;
  onFullscreenToggle: () => void;
  onReset: () => void;
  onToggleViewMode: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPage,
  totalPages,
  isMuted,
  isSlideshowPlaying,
  sidebarOpen,
  zoom,
  slideshowSpeed,
  isFullscreen,
  forceSinglePage,
  onPageChange,
  onSidebarToggle,
  onMuteToggle,
  onSlideshowToggle,
  onSlideshowSpeedChange,
  onZoomChange,
  onFullscreenToggle,
  onReset,
  onToggleViewMode,
}) => {
  const [inputVal, setInputVal] = useState<string>(String(currentPage));

  useEffect(() => {
    setInputVal(String(currentPage));
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      playClickSound();
      onPageChange(parsed);
    } else {
      setInputVal(String(currentPage));
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed);
    } else {
      setInputVal(String(currentPage));
    }
  };

  const stepZoom = (dir: "in" | "out") => {
    playClickSound();
    let updated = zoom;
    if (dir === "in") {
      updated = Math.min(2.5, zoom + 0.25);
    } else {
      updated = Math.max(0.75, zoom - 0.25);
    }
    onZoomChange(updated);
  };

  return (
    <div
      id="flipbook-toolbar"
      className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-2.5 py-2 sm:px-4 sm:py-2.5 shadow-md flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between gap-3 sm:gap-4 font-sans select-none z-30"
    >
      {/* 1. Left Action Section: Reset Book */}
      <div className="flex items-center gap-2">
        <button
          id="btn-reset-book"
          onClick={() => {
            playClickSound();
            onReset();
          }}
          className="p-2 text-slate-600 hover:text-indigo-650 hover:bg-slate-50 rounded-lg border border-transparent transition-all"
          title="Reset Flipbook Settings"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

        {/* Zoom Engine */}
        <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-lg p-0.5">
          <button
            id="btn-zoom-out"
            onClick={() => stepZoom("out")}
            disabled={zoom <= 0.75}
            className="p-1.5 text-slate-500 hover:text-blue-600 disabled:opacity-30 rounded transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-medium text-slate-600 min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            id="btn-zoom-in"
            onClick={() => stepZoom("in")}
            disabled={zoom >= 2.5}
            className="p-1.5 text-slate-500 hover:text-blue-600 disabled:opacity-30 rounded transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

        {/* Dynamic Responsive View Mode Toggler */}
        <button
          id="btn-toggle-viewmode"
          onClick={() => {
            playClickSound();
            onToggleViewMode();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
            forceSinglePage
              ? "bg-indigo-50 border-indigo-100 text-indigo-650 shadow-sm"
              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
          }`}
          title={forceSinglePage ? "Switch to Double Spread Spreadsheets" : "Force Single Page Sheets View"}
        >
          {forceSinglePage ? (
            <>
              <Book className="w-4 h-4 text-indigo-500" />
              <span className="text-[11px] font-medium text-indigo-600">Single Page</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-medium text-slate-600">Double Spread</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Center Section: Navigation Trigger Sweeps */}
      <div className="flex items-center gap-2">
        {/* Double Arrow First */}
        <button
          id="btn-nav-first"
          onClick={() => {
            if (currentPage > 1) {
              playClickSound();
              onPageChange(1);
            }
          }}
          disabled={currentPage <= 1}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 disabled:opacity-35 disabled:hover:bg-transparent rounded-lg transition-all"
          title="First Page"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        {/* Previous Arrow */}
        <button
          id="btn-nav-prev"
          onClick={() => {
            if (currentPage > 1) {
              playClickSound();
              onPageChange(currentPage - 1);
            }
          }}
          disabled={currentPage <= 1}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 disabled:opacity-35 disabled:hover:bg-transparent rounded-lg transition-all"
          title="Previous Page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Modern Interactive Page Input & Quick + / - increment/decrement */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 shadow-inner">
          <button
            id="btn-quick-minus"
            onClick={() => {
              if (currentPage > 1) {
                playClickSound();
                onPageChange(currentPage - 1);
              }
            }}
            disabled={currentPage <= 1}
            className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 rounded transition-all"
            title="Slight Decrement"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <form onSubmit={handleInputSubmit} className="flex items-center">
            <span className="text-xs text-slate-400 font-serif mr-1 selection:bg-blue-100">Page</span>
            <input
              id="input-page-jump"
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-10 text-center font-mono text-xs font-semibold bg-white border border-slate-200 rounded py-0.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-slate-800"
            />
            <span className="text-xs text-slate-400 font-mono ml-1.5">/ {totalPages}</span>
          </form>

          <button
            id="btn-quick-plus"
            onClick={() => {
              if (currentPage < totalPages) {
                playClickSound();
                onPageChange(currentPage + 1);
              }
            }}
            disabled={currentPage >= totalPages}
            className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 rounded transition-all"
            title="Slight Increment"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Next Arrow */}
        <button
          id="btn-nav-next"
          onClick={() => {
            if (currentPage < totalPages) {
              playClickSound();
              onPageChange(currentPage + 1);
            }
          }}
          disabled={currentPage >= totalPages}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 disabled:opacity-35 disabled:hover:bg-transparent rounded-lg transition-all"
          title="Next Page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Double Arrow Last */}
        <button
          id="btn-nav-last"
          onClick={() => {
            if (currentPage < totalPages) {
              playClickSound();
              onPageChange(totalPages);
            }
          }}
          disabled={currentPage >= totalPages}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 disabled:opacity-35 disabled:hover:bg-transparent rounded-lg transition-all"
          title="Last Page"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Right Action Section: Sound, Auto Slideshow, and Fullscreen */}
      <div className="flex items-center gap-3">
        {/* Slideshow Module */}
        <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-lg p-0.5">
          <button
            id="btn-toggle-slideshow"
            onClick={() => {
              playClickSound();
              onSlideshowToggle();
            }}
            className={`p-1.5 rounded transition-all flex items-center justify-center ${
              isSlideshowPlaying 
                ? "bg-blue-50 text-blue-600" 
                : "text-slate-500 hover:text-blue-600"
            }`}
            title={isSlideshowPlaying ? "Pause Presentation" : "Play Presentation Slideshow"}
          >
            {isSlideshowPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <div className="flex flex-col ml-1 mr-1.5">
            <label className="text-[7.5px] font-mono uppercase text-slate-400 leading-tight">Slideshow Interval</label>
            <select
              id="select-slideshow-duration"
              value={slideshowSpeed}
              onChange={(e) => {
                playClickSound();
                onSlideshowSpeedChange(parseInt(e.target.value, 10));
              }}
              className="text-[9.5px] font-serif bg-transparent focus:outline-none border-none text-slate-600 py-0"
              title="Slide Duration Page Rate"
            >
              <option value="2000">2s Interval</option>
              <option value="3000">3s Interval</option>
              <option value="4000">4s Interval</option>
              <option value="6000">6s Interval</option>
              <option value="8000">8s Interval</option>
            </select>
          </div>
        </div>

        {/* Audio Speaker Mute Toggle */}
        <button
          id="btn-toggle-mute"
          onClick={() => {
            playClickSound();
            onMuteToggle();
          }}
          className={`p-2 rounded-lg transition-all ${
            isMuted
              ? "bg-red-50 text-red-500 border border-red-100"
              : "text-slate-600 hover:bg-slate-50 border border-transparent"
          }`}
          title={isMuted ? "Unmute Sound FX" : "Mute Sound FX"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-0.5 hidden md:block"></div>

        {/* Fullscreen Button */}
        <button
          id="btn-fullscreen-toggle"
          onClick={() => {
            playClickSound();
            onFullscreenToggle();
          }}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg border border-transparent transition-all"
          title="Toggle Fullscreen Arena"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
