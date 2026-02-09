"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PageLoader() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showOverlay, setShowOverlay] = React.useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Reset loading state when the path or search params change
  React.useEffect(() => {
    setIsLoading(false);
    setShowOverlay(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname, searchParams]);

  // Handle showing the overlay with a smart delay
  React.useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setShowOverlay(true);
      }, 200); // 200ms delay to prevent flashing on cached routes
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setShowOverlay(false);
    }
  }, [isLoading]);

  // Global click listener for internal links
  React.useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        !anchor.hasAttribute("download") &&
        anchor.target !== "_blank" &&
        anchor.href !== window.location.href // Don't trigger for same page anchor links or re-clicks
      ) {
        // Only trigger if it's a real navigation to a different internal URL
        const url = new URL(anchor.href);
        if (
          url.pathname !== pathname ||
          url.search !== searchParams.toString()
        ) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="h-10 w-10 text-primary animate-spin relative" />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground animate-pulse">
                Payrail
              </span>
              <span className="text-xs text-muted-foreground/60">
                Loading secure environment...
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
