import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  LandingFeaturesContent,
  LandingLearnContent,
  type LandingPanelId,
} from './LandingSimpleBelow';
import { LandingPricingContent } from './LandingPricing';

export function useLandingPanel() {
  const [panel, setPanel] = useState<LandingPanelId | null>(null);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  return { panel, setPanel };
}

type LandingPanelOverlayProps = {
  panel: LandingPanelId | null;
  onClose: () => void;
};

export function LandingPanelOverlay({ panel, onClose }: LandingPanelOverlayProps) {
  return (
    <AnimatePresence>
      {panel ? (
        <motion.div
          key={panel}
          role="dialog"
          aria-modal="true"
          aria-label={panel === 'features' ? 'Features' : panel === 'learn' ? 'Learn' : 'Pricing'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex flex-col bg-[var(--landing-bg)] pt-14"
        >
          <div className="landing-grid-bg pointer-events-none absolute inset-0" />
          <div className="relative flex shrink-0 items-center justify-end px-5 py-3 md:px-8">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-11 items-center justify-center rounded-lg text-[var(--landing-muted)] transition-colors hover:bg-[var(--landing-card)] hover:text-[var(--landing-fg)]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-16 md:px-8">
            {panel === 'features' ? (
              <LandingFeaturesContent onGetStarted={onClose} />
            ) : panel === 'learn' ? (
              <LandingLearnContent onGetStarted={onClose} />
            ) : (
              <LandingPricingContent onGetStarted={onClose} />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
