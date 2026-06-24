import { motion } from 'framer-motion';

const JSON_LINES = [
  '{',
  '  "title": "Neural Networks",',
  '  "modules": 8,',
  '  "quizzes": 24,',
  '  "published": true',
  '}',
];

export function TeachMock() {
  return (
    <div className="p-5 md:p-6">
      <div className="overflow-hidden rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--landing-border)] px-3 py-2">
          <span className="size-2 rounded-full bg-red-500/80" />
          <span className="size-2 rounded-full bg-yellow-500/80" />
          <span className="size-2 rounded-full bg-green-500/80" />
          <span className="ml-1 font-mono text-[10px] text-[var(--landing-muted)]">course.json</span>
        </div>
        <div className="flex gap-4 p-4">
          <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-md border border-[var(--landing-border)] bg-[var(--landing-card)]">
            <div className="grid grid-cols-4 gap-1 p-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-sm bg-[var(--brand,#e10600)] opacity-80"
                />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 font-mono text-[11px] leading-relaxed">
            {JSON_LINES.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="text-[var(--landing-muted)]"
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
