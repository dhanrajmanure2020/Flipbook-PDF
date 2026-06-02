import React, { useState, useEffect } from "react";
import { Code, Copy, Check, Info, Settings, ShieldCheck, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playClickSound } from "./AudioEngine";

interface EmbedCardProps {
  currentFile?: { name: string; size: string } | null;
}

export const EmbedCard: React.FC<EmbedCardProps> = ({ currentFile }) => {
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState("650");
  const [width, setWidth] = useState("100");
  const [widthType, setWidthType] = useState<"%" | "px">("%");
  const [borderRadius, setBorderRadius] = useState("12");
  const [hasShadow, setHasShadow] = useState(true);
  const [allowFullscreen, setAllowFullscreen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Detect original or deployment URL safely
  const [appUrl, setAppUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://ais-pre-k43tblpggtzyyqlvppd6av-869775389424.asia-southeast1.run.app";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clean up index patterns or query states if appropriate
      let origin = window.location.origin;
      // Safeguard: If we are running in full local development, let's also remind them of the production shared URL.
      if (origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("3000")) {
        setAppUrl("https://ais-pre-k43tblpggtzyyqlvppd6av-869775389424.asia-southeast1.run.app");
      } else {
        setAppUrl(origin);
      }
    }
  }, []);

  // Compute the live preview embed code
  const shadowStyle = hasShadow ? "box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);" : "";
  const borderStyle = borderRadius !== "0" ? `border-radius: ${borderRadius}px;` : "";
  
  const iframeCode = `<iframe 
  src="${appUrl}" 
  width="${width}${widthType}" 
  height="${height}px" 
  style="border: 1px solid #e2e8f0; ${borderStyle} ${shadowStyle}" 
  allow="autoplay; clipboard-write; encrypted-media; fullscreen"
  ${allowFullscreen ? "allowfullscreen" : ""}
></iframe>`;

  const handleCopy = async () => {
    playClickSound();
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div
      id="flipbook-embed-panel"
      className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans text-left mt-6 animate-fade-in"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Code className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              Embed this Flipbook in Your Website
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Copy the copy-paste integration code below to seamlessy display this 3D presentation portal on your blog, portfolio, or landing page.
          </p>
        </div>
        
        <button
          onClick={() => {
            playClickSound();
            setShowAdvanced(!showAdvanced);
          }}
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Settings className={`w-3.5 h-3.5 ${showAdvanced ? "rotate-45" : ""} transition-transform duration-300`} />
          <span>{showAdvanced ? "Hide Controls" : "Customize Size & Frame"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 mb-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              {/* Width */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Frame Width</label>
                <div className="flex rounded-lg overflow-hidden border border-slate-200">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    min="10"
                    max="2000"
                    className="w-full px-2.5 py-1 bg-white outline-none text-slate-800 font-mono text-xs"
                  />
                  <select
                    value={widthType}
                    onChange={(e: any) => setWidthType(e.target.value)}
                    className="bg-slate-100 border-l border-slate-200 px-1 font-mono text-xs focus:outline-none"
                  >
                    <option value="%">%</option>
                    <option value="px">px</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400">100% fits perfectly on dynamic side-by-side grids.</p>
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Frame Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="200"
                  max="1600"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-800 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400">Recommended 650px to fit double spread pages comfortably.</p>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Corner Styling (px)</label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full accent-blue-600 mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Sharp (0px)</span>
                  <span>{borderRadius}px</span>
                </div>
              </div>

              {/* Toggle Toggles */}
              <div className="space-y-3 flex flex-col justify-center">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasShadow}
                    onChange={(e) => setHasShadow(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-700">Soft drop shadow</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowFullscreen}
                    onChange={(e) => setAllowFullscreen(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-700">Allow full-screen play</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Absolute header for format */}
        <div className="absolute right-3.5 top-3.5 z-20 flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200/50">
            HTML IFRAME CODE
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              copied
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-100"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 animate-pulse" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Embed Code</span>
              </>
            )}
          </button>
        </div>

        {/* Textured snippet container */}
        <div className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-950 p-4 pt-12">
          <pre className="text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all focus:outline-none pr-36">
            <code>{iframeCode}</code>
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-blue-50/40 p-4 border border-blue-100/50 rounded-xl">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-slate-700 leading-tight">Integration instructions</p>
            <p className="mt-1 text-slate-500 leading-normal text-[11px]">
              This is a standard sandboxed iFrame format. Simply paste it directly inside your <code className="bg-slate-100 font-bold px-1 rounded">.html</code> file or standard headless builder blocks (such as WordPress HTML editor, Webflow embed block, or Wix frame) to deploy your custom interactive booklet.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 font-semibold text-blue-600 text-[11px] bg-white border border-blue-100 rounded-lg px-2.5 py-1 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>HTTPS Secure Link</span>
        </div>
      </div>
    </div>
  );
};
