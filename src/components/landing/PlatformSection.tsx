import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useRef, type ReactNode, type MouseEvent } from 'react';

type PlatformSectionProps = {
  id: string;
  title: string;
  description: string;
  stat: string;
  features: string[];
  mock: ReactNode;
  reverse?: boolean;
};

export function PlatformSection({ id, title, description, stat, features, mock, reverse }: PlatformSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mockRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 200, damping: 25 });
  const springTiltY = useSpring(tiltY, { stiffness: 200, damping: 25 });

  const handleMockMove = (e: MouseEvent) => {
    const rect = mockRef.current?.getBoundingClientRect();
    if (!rect) return;
    tiltX.set(((e.clientY - rect.top) / rect.height - 0.5) * -8);
    tiltY.set(((e.clientX - rect.left) / rect.width - 0.5) * 8);
  };

  const handleMockLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <section id={id} ref={ref} className="border-t border-[var(--landing-border)] px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className={`lg:col-span-3 ${reverse ? 'lg:order-3' : ''}`}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-4xl">{title}</h2>
          <p className="landing-mono-label mt-4 max-w-xs leading-relaxed">{description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className={`relative lg:col-span-6 ${reverse ? 'lg:order-2' : ''}`}
          style={{ perspective: 1200 }}
        >
          <div className="landing-glow pointer-events-none absolute inset-0 -z-10" />
          <motion.div
            ref={mockRef}
            onMouseMove={handleMockMove}
            onMouseLeave={handleMockLeave}
            style={{ rotateX: springTiltX, rotateY: springTiltY, transformStyle: 'preserve-3d' }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="landing-bento-card shadow-2xl"
          >
            {mock}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`lg:col-span-3 ${reverse ? 'lg:order-1' : ''}`}
        >
          <p className="text-lg font-medium leading-snug tracking-tight text-[var(--landing-fg)] md:text-xl">{stat}</p>
          <div className="mt-8 space-y-3">
            <p className="landing-mono-label">Features</p>
            {features.map((f, i) => (
              <motion.p
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="landing-feature-item"
              >
                {f}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
