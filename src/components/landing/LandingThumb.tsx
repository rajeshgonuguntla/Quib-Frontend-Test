import { Play } from 'lucide-react';
import {
  LANDING_THUMB_COMPONENTS,
  type LandingThumbTopic,
} from './landingThumbnails';

type LandingThumbProps = {
  topic: LandingThumbTopic;
  label?: string;
  className?: string;
  showPlay?: boolean;
  selected?: boolean;
  duration?: string;
};

export function LandingThumb({
  topic,
  label,
  className = '',
  showPlay = true,
  selected = false,
  duration,
}: LandingThumbProps) {
  const Illustration = LANDING_THUMB_COMPONENTS[topic];

  return (
    <div className={`landing-mock-thumb group/thumb relative overflow-hidden bg-[var(--landing-bg)] ${className}`}>
      <Illustration className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-[1.03]" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

      {label && (
        <span className="pointer-events-none absolute bottom-2 left-2 right-8 truncate font-mono text-[8px] font-medium uppercase tracking-wider text-white/75 opacity-0 transition-opacity group-hover/thumb:opacity-100">
          {label}
        </span>
      )}

      {showPlay && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90 transition-opacity group-hover/thumb:opacity-100">
          <div className="flex size-7 items-center justify-center rounded-full border border-white/25 bg-black/40 backdrop-blur-sm transition-transform group-hover/thumb:scale-110">
            <Play size={11} className="ml-0.5 fill-white text-white" />
          </div>
        </div>
      )}

      {duration && (
        <span className="absolute bottom-1.5 right-1.5 rounded px-1 py-0.5 font-mono text-[7px] text-white/90 bg-black/55">
          {duration}
        </span>
      )}

      {selected && (
        <div className="absolute left-1 top-1 flex size-4 items-center justify-center rounded-sm border border-[var(--brand,#e10600)] bg-[var(--brand,#e10600)] text-[8px] font-bold text-white shadow-sm">
          ✓
        </div>
      )}
    </div>
  );
}
