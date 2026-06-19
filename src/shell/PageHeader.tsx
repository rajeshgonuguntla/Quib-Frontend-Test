import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type PageHeaderProps = {
  label?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ label, title, description, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {label && <p className="text-label mb-2 text-muted-foreground">{label}</p>}
        <h1 className="font-serif-display text-2xl tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
