import React from "react";
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  Layers, 
  Smartphone, 
  Zap, 
  CheckCircle, 
  FileText 
} from "lucide-react";

interface WelcomePageProps {
  pageNum: number;
}

export const WELCOME_PAGES_COUNT = 8;
export const WELCOME_ASPECT_RATIO = 0.707; // Standard A4 ratio

export const WelcomePage: React.FC<WelcomePageProps> = ({ pageNum }) => {
  // Page 1: Outer Front Cover
  if (pageNum === 1) {
    return (
      <div id="page-1" className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden select-none border border-slate-800 rounded-r-lg shadow-2xl">
        {/* Abstract background decorative elements */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-teal-500/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl"></div>
        
        {/* Soft elegant frame */}
        <div className="absolute inset-4 border border-white/5 rounded-md pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono text-teal-400 bg-teal-950/40 border border-teal-500/25 rounded">
            LITERAL INTERFACE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
        </div>

        <div className="my-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">Interactive Showcase</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-teal-200 bg-clip-text text-transparent leading-none">
            The Art of the Flipbook
          </h1>
          <p className="text-sm text-slate-300 font-light max-w-sm leading-relaxed">
            A masterclass in editorial mechanics, fluid 3D animations, and responsive canvas rendering.
          </p>
        </div>

        <div className="flex justify-between items-end border-t border-white/5 pt-6 text-slate-400 text-xs font-mono">
          <div>
            <p className="text-[10px] text-slate-500">CREATOR</p>
            <p className="text-slate-300">Google AI Studio</p>
          </div>
          <div class="text-right">
            <p className="text-[10px] text-slate-500">EDITION</p>
            <p className="text-slate-300">2026 Release</p>
          </div>
        </div>
      </div>
    );
  }

  // Page 2: Table of Contents / Left Editorial
  if (pageNum === 2) {
    return (
      <div id="page-2" className="w-full h-full bg-white text-slate-800 flex flex-col justify-between p-8 sm:p-12 border-r border-slate-100 rounded-l-lg shadow-inner relative">
        <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono border-b border-slate-100 pb-3">
          <span>THE ART OF THE FLIPBOOK</span>
          <span>CHAPTER 1</span>
        </div>

        <div className="my-auto space-y-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Table of Contents</h2>
          <div className="space-y-3 font-sans text-sm">
            <div className="flex justify-between items-end border-b border-dotted border-slate-200 pb-1">
              <span className="font-medium text-slate-700">01. Dynamic 3D Curvature</span>
              <span className="font-mono text-xs text-indigo-600">Page 3</span>
            </div>
            <div className="flex justify-between items-end border-b border-dotted border-slate-200 pb-1">
              <span className="font-medium text-slate-700">02. Tactile Sound Engineering</span>
              <span className="font-mono text-xs text-indigo-600">Page 4</span>
            </div>
            <div className="flex justify-between items-end border-b border-dotted border-slate-200 pb-1">
              <span className="font-medium text-slate-700">03. Responsive Canvas Scaling</span>
              <span className="font-mono text-xs text-indigo-600">Page 5</span>
            </div>
            <div className="flex justify-between items-end border-b border-dotted border-slate-200 pb-1">
              <span className="font-medium text-slate-700">04. Mobile Touch Mechanics</span>
              <span className="font-mono text-xs text-indigo-600">Page 6</span>
            </div>
            <div className="flex justify-between items-end border-b border-dotted border-slate-200 pb-1">
              <span className="font-medium text-slate-700">05. Business Case & Strategy</span>
              <span className="font-mono text-xs text-indigo-600">Page 7</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/40 text-xs text-indigo-950/80 leading-relaxed">
            <strong>Getting Started Hint:</strong> Turn pages by clicking the bottom controls, using your keyboard <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-sm">Left</kbd>/<kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-sm">Right</kbd> arrow keys, or swiping directly across the page.
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-center">
          02
        </div>
      </div>
    );
  }

  // Page 3: 3D Curvature
  if (pageNum === 3) {
    return (
      <div id="page-3" className="w-full h-full bg-white text-slate-800 flex flex-col justify-between p-8 sm:p-12 border-l border-slate-100 rounded-r-lg shadow-sm relative">
        <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono border-b border-slate-100 pb-3">
          <span>01. DYNAMIC 3D CURVATURE</span>
          <span>THE ART OF THE FLIPBOOK</span>
        </div>

        <div className="my-auto space-y-5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">The Illusion of Reality</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            By shifting from rigid sliding carousels to CSS 3D perspectives, the application simulates natural paper curvatures. The viewport utilizes a high <code>perspective(2000px)</code> property, allowing layers to tilt on an active hinge axis.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>Realistic leaf-turn trajectories</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>Backface-hiding for double-sided sheets</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>Middle fold spine shading and drop shadows</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-center">
          03
        </div>
      </div>
    );
  }

  // Page 4: Audio Synthesis
  if (pageNum === 4) {
    return (
      <div id="page-4" className="w-full h-full bg-white text-slate-800 flex flex-col justify-between p-8 sm:p-12 border-r border-slate-100 rounded-l-lg shadow-inner relative">
        <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono border-b border-slate-100 pb-3">
          <span>THE ART OF THE FLIPBOOK</span>
          <span>02. AUDIO SYNTHESIS</span>
        </div>

        <div className="my-auto space-y-5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Volume2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tactile Sensory Sound</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            A soft paper rustle/swoosh is dynamically synthesized in your browser. Utilizing the Web Audio API, we combine white noise sweeps, bandpass filters, and exponential envelope curves, recreating a physical page turn on demand.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] text-slate-400 uppercase">SYNTH STATUS</p>
              <p className="text-xs font-semibold text-slate-700">Ready in Memory</p>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-650"></span>
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-center">
          04
        </div>
      </div>
    );
  }

  // Page 5: High Resolution Canvases
  if (pageNum === 5) {
    return (
      <div id="page-5" className="w-full h-full bg-white text-slate-800 flex flex-col justify-between p-8 sm:p-12 border-l border-slate-100 rounded-r-lg shadow-sm relative">
        <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono border-b border-slate-100 pb-3">
          <span>03. HIGH-RES CANVASES</span>
          <span>THE ART OF THE FLIPBOOK</span>
        </div>

        <div className="my-auto space-y-5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Perfect Detail Scaling</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traditional image slider approaches degrade text clarity when zoomed. Our viewer takes actual PDF page structures and renders them directly onto <code>&lt;canvas&gt;</code> viewports, maintaining deep clarity for charts, vector graphics, and typography.
          </p>
          <div className="relative bg-teal-900 text-teal-50 p-3 rounded-lg overflow-hidden flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-mono uppercase tracking-widest text-teal-300">Device Pixel Scaling Check</p>
              <p className="text-xs font-semibold">Adaptive Canvas Multiplier Enabled</p>
            </div>
            <Zap className="text-teal-300 w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-center">
          05
        </div>
      </div>
    );
  }

  // Page 6: Mobile Swipe Mechanics
  if (pageNum === 6) {
    return (
      <div id="page-6" className="w-full h-full bg-white text-slate-800 flex flex-col justify-between p-8 sm:p-12 border-r border-slate-100 rounded-l-lg shadow-inner relative">
        <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono border-b border-slate-100 pb-3">
          <span>THE ART OF THE FLIPBOOK</span>
          <span>04. TOUCH CAPACITANCE</span>
        </div>

        <div className="my-auto space-y-5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Smartphone className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Swipe Mechanics on Touch</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            On smaller handheld viewports where a double-page spread would look cramped, the container transitions smoothly into single-page layout. Pages can be flipped using natural left and right swipe gestures, with visual feedback for touch thresholds.
          </p>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
            <div className="bg-indigo-50 border border-indigo-100/30 p-2 rounded">
              <p className="text-indigo-600 font-bold">SINGLE PAGE</p>
              <p className="text-slate-400 text-[8px] mt-0.5">Mobile Portability</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/50 p-2 rounded">
              <p className="text-slate-600 font-bold">SPREAD MODE</p>
              <p className="text-slate-400 text-[8px] mt-0.5">Desktop Immersion</p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-center">
          06
        </div>
      </div>
    );
  }

  // Page 7: Real-world Applications
  if (pageNum === 7) {
    return (
      <div id="page-7" className="w-full h-full bg-white text-slate-800 flex flex-col justify-between p-8 sm:p-12 border-l border-slate-100 rounded-r-lg shadow-sm relative">
        <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono border-b border-slate-100 pb-3">
          <span>05. APPLICATIONS</span>
          <span>THE ART OF THE FLIPBOOK</span>
        </div>

        <div className="my-auto space-y-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tailored for Business</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Beautiful portfolios, educational magazines, high-end design showcases, and reports. By converting dry, flat PDF scrolling into an immersive digital reading object, communication retention surges.
          </p>
          <div className="border-l-2 border-indigo-500 pl-3 py-1 bg-white/70 rounded-r text-[11px] text-slate-600 italic">
            "A gorgeous way to present visual materials in interactive portfolios, keeping audience attention locked with crisp rendering."
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-center">
          07
        </div>
      </div>
    );
  }

  // Page 8: Outer Back Cover
  return (
    <div id="page-8" className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden select-none border border-slate-800 rounded-l-lg shadow-2xl">
      <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-indigo-500/15 blur-3xl"></div>
      
      {/* Soft elegant frame */}
      <div className="absolute inset-4 border border-white/5 rounded-md pointer-events-none"></div>

      <div className="text-slate-400 text-[10px] font-mono tracking-widest uppercase">
        End of Showcase
      </div>

      <div className="my-auto text-center space-y-3">
        <BookOpen className="w-12 h-12 text-teal-400 mx-auto opacity-80 animate-pulse" />
        <h2 className="text-xl font-bold tracking-tight text-white">Flipbook Viewer</h2>
        <p className="text-[11px] text-slate-400 font-mono">
          Ready for your own papers.
        </p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          Click the "PDF Upload Screen" tab above to drop your custom documents and experience full-scale offline canvas parsing!
        </p>
      </div>

      <div className="text-[9px] text-slate-500 text-center font-mono border-t border-white/5 pt-4">
        &copy; 2026 Interactive Systems. All rights reserved.
      </div>
    </div>
  );
};
