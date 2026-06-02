import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WelcomePage } from "./WelcomeBooklet";
import { PDFPageCanvas } from "./PDFPageCanvas";
import { playPageTurnSound } from "./AudioEngine";
import { ArrowLeft, ArrowRight, CornerDownRight } from "lucide-react";

interface FlipbookProps {
  pdfDocument: any; 
  totalPages: number;
  currentPage: number;
  isExample: boolean;
  zoom: number;
  onPageChange: (pageNum: number) => void;
}

export const Flipbook: React.FC<FlipbookProps> = ({
  pdfDocument,
  totalPages,
  currentPage,
  isExample,
  zoom,
  onPageChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerDims, setContainerDims] = useState({ width: 700, height: 500 });
  const [isMobile, setIsMobile] = useState(false);
  const [pdfPageAspect, setPdfPageAspect] = useState<number>(0.707); // dynamic aspect ratio load
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  
  // Touch tracking for swiping and dragging curling effects
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Track flip animation state
  const [prevPage, setPrevPage] = useState<number>(currentPage);
  const [flippingState, setFlippingState] = useState<{
    isActive: boolean;
    direction: "next" | "prev";
    fromPage: number;
    toPage: number;
  } | null>(null);

  useEffect(() => {
    if (currentPage !== prevPage) {
      const dir = currentPage > prevPage ? "next" : "prev";
      setFlippingState({
        isActive: true,
        direction: dir,
        fromPage: prevPage,
        toPage: currentPage,
      });
      const timer = setTimeout(() => {
        setFlippingState(null);
        setPrevPage(currentPage);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentPage, prevPage]);

  // ResizeObserver for modern fluid sizing (Canvas Stage rule guidelines)
  useEffect(() => {
    if (!containerRef.current) return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      // Safeguard against tiny hidden tabs
      if (width > 50 && height > 50) {
        setContainerDims({ width, height });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", checkMobile);
      observer.disconnect();
    };
  }, []);

  // Update dynamic page aspect ratio if a real PDF is loaded
  const handlePageSizeLoaded = (nativeWidth: number, nativeHeight: number) => {
    if (nativeWidth > 0 && nativeHeight > 0) {
      const aspect = nativeWidth / nativeHeight;
      // Guard against abnormal ratios
      if (aspect > 0.2 && aspect < 2.5) {
        setPdfPageAspect(aspect);
      }
    }
  };

  // Turn triggers
  const handleNext = () => {
    if (currentPage < totalPages) {
      setDirection("next");
      playPageTurnSound();
      // In double screen view mode, we flip by 2 pages except on cover page transitions
      if (!isMobile && currentPage > 1 && currentPage + 2 <= totalPages) {
        onPageChange(currentPage + 2);
      } else if (!isMobile && currentPage === 1) {
        onPageChange(2);
      } else {
        onPageChange(currentPage + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setDirection("prev");
      playPageTurnSound();
      if (!isMobile && currentPage > 2) {
        // If current page is even, we go down by 2 to align with spreadsheet flips
        const target = currentPage % 2 === 0 ? currentPage - 2 : currentPage - 1;
        onPageChange(Math.max(1, target));
      } else {
        onPageChange(currentPage - 1);
      }
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") {
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, isMobile]);

  // Touch Swipe Handlers (Swipe left -> next page; Swipe right -> previous page)
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;
    const t = e.touches[0];
    const diffX = t.clientX - touchStart.x;
    setDragOffset(diffX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setIsDragging(false);
    
    // Swipe thresholds
    const swipeThreshold = 60;
    if (dragOffset < -swipeThreshold) {
      handleNext();
    } else if (dragOffset > swipeThreshold) {
      handlePrev();
    } else {
      // Tap handler: If didn't swipe/drag far, treat as click on the page
      const dragDistance = Math.abs(dragOffset);
      if (dragDistance < 15) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const endX = e.changedTouches[0]?.clientX ?? touchStart.x;
          const clickXPercent = (endX - rect.left) / rect.width;
          if (clickXPercent > 0.5) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    }
    
    // Reset offset with beautiful bounce recoil
    setDragOffset(0);
    setTouchStart(null);
  };

  // Mouse drag fallback for PC desktop (for interactive curly feel)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid triggering dragging if they click buttons
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
    setTouchStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStart || !isDragging) return;
    const diffX = e.clientX - touchStart.x;
    setDragOffset(diffX);
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent) => {
    if (!touchStart) return;
    setIsDragging(false);
    const swipeThreshold = 80;
    
    const diffX = e.clientX - touchStart.x;
    const diffY = e.clientY - touchStart.y;
    
    if (diffX < -swipeThreshold) {
      handleNext();
    } else if (diffX > swipeThreshold) {
      handlePrev();
    } else {
      // Click handler: If didn't drag far, click left/right half to turn
      const dragDistanceX = Math.abs(diffX);
      const dragDistanceY = Math.abs(diffY);
      if (dragDistanceX < 15 && dragDistanceY < 15) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const clickXPercent = (e.clientX - rect.left) / rect.width;
          if (clickXPercent > 0.5) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    }
    setDragOffset(0);
    setTouchStart(null);
  };

  // Check if first or last page is displaying as single centered cover on desktop
  const isSinglePage = isMobile || currentPage === 1 || currentPage === totalPages;

  // Fit sizing aspects
  const pageAspect = isExample ? 0.707 : pdfPageAspect;
  const spreadAspect = pageAspect * 2; // Always design constraints for the double spread so page height is perfectly consistent

  // Calculate boundary caps
  const maxW = containerDims.width * 0.96 * zoom;
  const maxH = containerDims.height * 0.94 * zoom;

  // Fit the double spread into available area boundaries (contain logic)
  let spreadH = maxH;
  let spreadW = maxH * spreadAspect;

  if (spreadW > maxW) {
    spreadW = maxW;
    spreadH = spreadW / spreadAspect;
  }

  // Consistent page height for both single and double spread views
  const idealH = spreadH;
  // If single page view (covers or mobile), wrapper width is half of spread width, otherwise it's the full spread width
  const idealW = isSinglePage ? (spreadW / 2) : spreadW;

  // Double-Spread page allocations
  // Left side shows even page numbers (2, 4, 6...)
  // Right side shows odd page numbers (3, 5, 7...)
  const leftPageNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
  const rightPageNum = leftPageNum + 1;

  const isLeftVisible = !isMobile && leftPageNum > 1 && leftPageNum < totalPages;
  const isRightVisible = !isMobile && rightPageNum > 1 && rightPageNum < totalPages;

  // Single page mode is simple
  const singlePageNum = currentPage;

  // Generate rotation degrees for responsive curl preview
  const curlRotation = Math.min(25, Math.max(-25, (dragOffset / idealW) * 45));

  return (
    <div
      id="flipbook-viewport"
      className="flex-1 flex flex-col p-4 md:p-6 min-h-[400px] select-none relative overflow-auto custom-scrollbar"
    >
      {/* Absolute hint overlays for hover space */}
      {currentPage > 1 && (
        <button
          id="hover-nav-prev"
          onClick={handlePrev}
          className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 w-12 h-20 bg-slate-100/50 hover:bg-white/80 active:scale-95 border border-slate-200/50 rounded-xl flex items-center justify-center text-slate-500 shadow hover:text-indigo-600 transition-all z-20"
          title="Previous Page (A / ArrowLeft)"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {currentPage < totalPages && (
        <button
          id="hover-nav-next"
          onClick={handleNext}
          className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 w-12 h-20 bg-slate-100/50 hover:bg-white/80 active:scale-95 border border-slate-200/50 rounded-xl flex items-center justify-center text-slate-500 shadow hover:text-indigo-600 transition-all z-20"
          title="Next Page (D / ArrowRight)"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {/* Main interactive Book Stage Wrapper */}
      <div
        ref={containerRef}
        className="w-full h-full max-w-6xl flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing outline-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {/* Physical Shadow under the entire book structure */}
        <div
          id="book-3d-wrapper"
          style={{ width: `${idealW}px`, height: `${idealH}px` }}
          className="relative rounded-2xl transition-all duration-300 m-auto flex-shrink-0"
        >
          <div className="absolute inset-0 bg-black/10 blur-2xl rounded-2xl transform scale-y-[1.02] scale-x-[1.04] translate-y-2 pointer-events-none z-0" />

          {/* Book physical structure: Spine cover and pages alignment */}
          <div className="absolute inset-0 bg-neutral-200/70 p-[3px] rounded-xl flex overflow-hidden z-10 border border-slate-300/40 shadow-sm">
            {/* The Book Spine line in Center (Only if desktop double-page mode is rendered) */}
            {!isMobile && !isSinglePage && (
              <div
                id="spine-crease"
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[16px] bg-gradient-to-r from-stone-500/35 via-stone-700/60 to-stone-500/35 border-l border-r border-black/10 z-20 pointer-events-none"
              >
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/20" />
              </div>
            )}

            {/* Left and Right sheets background stack effect */}
            {!isMobile && !isSinglePage && (
              <>
                <div className="absolute left-[3px] top-[14px] bottom-[14px] w-[6px] bg-slate-300 border-r border-slate-400 rounded-l shadow z-0 pointer-events-none" />
                <div className="absolute right-[3px] top-[14px] bottom-[14px] w-[6px] bg-slate-300 border-l border-slate-400 rounded-r shadow z-0 pointer-events-none" />
              </>
            )}

            {/* Core pages display area using 3D Flipping Animation */}
            <div className="w-full h-full flex relative rounded-lg overflow-hidden bg-stone-100" style={{ perspective: "2200px" }}>
              {(() => {
                const renderPageInBook = (pageNum: number) => {
                  if (pageNum < 1 || pageNum > totalPages) {
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-stone-300 flex flex-col justify-between p-8 text-stone-500 font-sans border-r border-stone-400/40 shadow-inner rounded-l-lg select-none">
                        <div className="flex items-center gap-1 opacity-25">
                          <CornerDownRight className="w-4 h-4" />
                          <span className="text-[10px] uppercase tracking-widest font-mono">Inside Cover</span>
                        </div>
                        <div className="my-auto space-y-2 text-center opacity-40">
                          <p className="text-xl font-bold font-serif italic text-stone-600">PDF Flipbook</p>
                          <p className="text-[9px] font-mono">Designed for premium layouts</p>
                        </div>
                        <p className="text-[9px] font-mono text-center opacity-30">Interactive Reader</p>
                      </div>
                    );
                  }

                  return isExample ? (
                    <WelcomePage pageNum={pageNum} />
                  ) : (
                    <PDFPageCanvas
                      key={`canvas-p${pageNum}`}
                      pdfDocument={pdfDocument}
                      pageNumber={pageNum}
                      zoom={1}
                      containerWidth={isSinglePage ? (idealW - 16) : (idealW / 2 - 24)}
                      containerHeight={idealH - 24}
                      onPageSizeLoad={handlePageSizeLoaded}
                    />
                  );
                };

                if (flippingState && flippingState.isActive) {
                  const { direction, fromPage, toPage } = flippingState;
                  const isTransitionSingle = isMobile || fromPage === 1 || toPage === 1 || fromPage === totalPages || toPage === totalPages;

                  if (isTransitionSingle) {
                    /* MOBILE OR SINGLE SIDE PAGE 3D FLIP */
                    return (
                      <div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}>
                        {/* Static Target page underneath */}
                        <div className="absolute inset-0 z-10 bg-white">
                          {renderPageInBook(toPage)}
                        </div>

                        {/* Rotating Sheet */}
                        <motion.div
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: direction === "next" ? -180 : 180 }}
                          transition={{ duration: 0.65, ease: "easeInOut" }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            transformOrigin: direction === "next" ? "left center" : "right center",
                            transformStyle: "preserve-3d",
                            zIndex: 30,
                          }}
                        >
                          {/* Front Side */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              zIndex: 2,
                            }}
                          >
                            {renderPageInBook(fromPage)}
                            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                          </div>

                          {/* Back Side */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              transform: "rotateY(180deg)",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              zIndex: 1,
                            }}
                          >
                            {renderPageInBook(toPage)}
                            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                          </div>
                        </motion.div>
                      </div>
                    );
                  }

                  /* DESKTOP DOUBLE-SPREAD 3D FLIP */
                  const fromLeft = fromPage % 2 === 0 ? fromPage : fromPage - 1;
                  const fromRight = fromLeft + 1;

                  const toLeft = toPage % 2 === 0 ? toPage : toPage - 1;
                  const toRight = toLeft + 1;

                  if (direction === "next") {
                    return (
                      <div className="w-full h-full flex relative select-none" style={{ transformStyle: "preserve-3d" }}>
                        {/* Static Left page slot (Old Left page stays visible until flip covers it) */}
                        <div className="w-1/2 h-full bg-white relative border-r border-slate-200/90 overflow-hidden flex items-center justify-center p-3 select-none">
                          {renderPageInBook(fromLeft)}
                          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-transparent to-black/10 pointer-events-none" />
                        </div>

                        {/* Static Right page slot (Reveals the target Right page underneath early) */}
                        <div className="w-1/2 h-full bg-white relative overflow-hidden flex items-center justify-center p-3 select-none">
                          {renderPageInBook(toRight)}
                          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
                          <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-slate-300 pointer-events-none border-l border-slate-400/50" />
                        </div>

                        {/* Flipping 3D overlay page (Flips right to left) */}
                        <motion.div
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: -180 }}
                          transition={{ duration: 0.65, ease: "easeInOut" }}
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: "50%",
                            width: "50%",
                            transformOrigin: "left center",
                            transformStyle: "preserve-3d",
                            zIndex: 40,
                          }}
                        >
                          {/* Front Side: Old Right Page */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              zIndex: 2,
                              backgroundColor: "#fff",
                            }}
                            className="p-3"
                          >
                            {renderPageInBook(fromRight)}
                            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-black/15 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-slate-300 pointer-events-none border-l border-slate-400/50" />
                          </div>

                          {/* Back Side: New Left Page */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                              zIndex: 1,
                              backgroundColor: "#fff",
                            }}
                            className="p-3 border-r border-slate-200/90"
                          >
                            {renderPageInBook(toLeft)}
                            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-transparent to-black/15 pointer-events-none" />
                          </div>
                        </motion.div>
                      </div>
                    );
                  } else {
                    /* PREV DIRECTION DOUBLE-SPREAD 3D FLIP (Left page flips to right) */
                    return (
                      <div className="w-full h-full flex relative select-none" style={{ transformStyle: "preserve-3d" }}>
                        {/* Static Left page slot (Reveals target Left page underneath early) */}
                        <div className="w-1/2 h-full bg-white relative border-r border-slate-200/90 overflow-hidden flex items-center justify-center p-3 select-none">
                          {renderPageInBook(toLeft)}
                          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-transparent to-black/10 pointer-events-none" />
                        </div>

                        {/* Static Right page slot (Old Right page stays visible until flip covers it) */}
                        <div className="w-1/2 h-full bg-white relative overflow-hidden flex items-center justify-center p-3 select-none">
                          {renderPageInBook(fromRight)}
                          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
                          <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-slate-300 pointer-events-none border-l border-slate-400/50" />
                        </div>

                        {/* Flipping 3D overlay page (Flips left to right) */}
                        <motion.div
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: 180 }}
                          transition={{ duration: 0.65, ease: "easeInOut" }}
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: "50%",
                            transformOrigin: "right center",
                            transformStyle: "preserve-3d",
                            zIndex: 40,
                          }}
                        >
                          {/* Front Side: Old Left Page */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              zIndex: 2,
                              backgroundColor: "#fff",
                            }}
                            className="p-3 border-r border-slate-200/90"
                          >
                            {renderPageInBook(fromLeft)}
                            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-transparent to-black/15 pointer-events-none" />
                          </div>

                          {/* Back Side: New Right Page */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                              zIndex: 1,
                              backgroundColor: "#fff",
                            }}
                            className="p-3"
                          >
                            {renderPageInBook(toRight)}
                            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-black/15 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-slate-300 pointer-events-none border-l border-slate-400/50" />
                          </div>
                        </motion.div>
                      </div>
                    );
                  }
                }

                /* STANDARD STATIC VIEW (NO FLIP OR TRANSITION IS RUNNING) */
                return isSinglePage ? (
                  /* SINGLE CENTERED PAGE VIEW (Front Cover, Back Cover, or Mobile) */
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 relative bg-white">
                    {renderPageInBook(currentPage)}
                    {currentPage === 1 ? (
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                    ) : currentPage === totalPages ? (
                      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
                    ) : (
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
                    )}
                  </div>
                ) : (
                  /* DOUBLE PAGE VIEW */
                  <div className="w-full h-full flex">
                    {/* Left Page Column */}
                    <div className="w-1/2 h-full bg-white relative border-r border-slate-200/90 overflow-hidden flex items-center justify-center p-3 select-none">
                      {isLeftVisible ? renderPageInBook(leftPageNum) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-stone-300 flex flex-col justify-between p-8 text-stone-500 font-sans border-r border-stone-400/40 shadow-inner rounded-l-lg select-none">
                          <div className="flex items-center gap-1 opacity-25">
                            <CornerDownRight className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest font-mono">Inside Cover</span>
                          </div>
                          <div className="my-auto space-y-2 text-center opacity-40">
                            <p className="text-xl font-bold font-serif italic text-stone-600">PDF Flipbook</p>
                            <p className="text-[9px] font-mono">Designed for premium layouts</p>
                          </div>
                          <p className="text-[9px] font-mono text-center opacity-30">Interactive Reader</p>
                        </div>
                      )}
                      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-transparent to-black/10 pointer-events-none" />
                    </div>

                    {/* Right Page Column */}
                    <div className="w-1/2 h-full bg-white relative overflow-hidden flex items-center justify-center p-3 select-none">
                      {isRightVisible ? renderPageInBook(rightPageNum) : (
                        <div className="w-full h-full bg-stone-200 border-l border-stone-400/30 shadow-inner" />
                      )}
                      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
                      <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-slate-300 pointer-events-none border-l border-slate-400/50" />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Aesthetic quick status indicators */}
      <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-400 select-none">
        <span className="flex items-center gap-1">
          <kbd className="px-1 bg-slate-100 border border-slate-200 rounded text-[10px]">A</kbd> / 
          <kbd className="px-1 bg-slate-100 border border-slate-200 rounded text-[10px]">←</kbd>
          <span>Prev Sheet</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        <span className="flex items-center gap-1">
          <kbd className="px-1 bg-slate-100 border border-slate-200 rounded text-[10px]">D</kbd> / 
          <kbd className="px-1 bg-slate-100 border border-slate-200 rounded text-[10px]">→</kbd>
          <span>Next Sheet</span>
        </span>
      </div>
    </div>
  );
};
