import type { ReactNode } from 'react';
import { cn } from '../../components/ui/utils';
import { EdgeToggle } from './EdgeToggle';

type StudioLayoutProps = {
  isEmpty: boolean;
  collapsed: boolean;
  showToggle: boolean;
  onToggle: () => void;
  onExpand: () => void;
  children?: ReactNode;
};

export function StudioLayout({ isEmpty, collapsed, showToggle, onToggle, onExpand, children }: StudioLayoutProps) {
  return (
    <div
      data-testid="studio-body"
      className={cn('studio-body', isEmpty && 'is-empty', !isEmpty && collapsed && 'chat-collapsed')}
    >
      <div
        id="studio-chat"
        data-testid="chat"
        className="studio-chat"
        onClick={() => {
          if (!isEmpty && collapsed) onExpand();
        }}
      >
        {showToggle ? <EdgeToggle collapsed={collapsed} onToggle={onToggle} /> : null}
        <div className="studio-chat-inner">{children}</div>
      </div>
      <section data-testid="preview" className="studio-preview" aria-label="Live preview">
        <p className="text-[13px] text-[var(--ink-faint)]">Live preview</p>
      </section>
    </div>
  );
}
