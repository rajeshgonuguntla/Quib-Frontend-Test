import type { ReactNode } from 'react';
import { cn } from '../../components/ui/utils';
import { EdgeToggle } from './EdgeToggle';

type StudioLayoutProps = {
  isEmpty: boolean;
  drafting?: boolean;
  previewOpen?: boolean;
  collapsed: boolean;
  showToggle: boolean;
  onToggle: () => void;
  onExpand: () => void;
  preview?: ReactNode;
  previewClassName?: string;
  children?: ReactNode;
};

export function StudioLayout({ isEmpty, drafting, previewOpen, collapsed, showToggle, onToggle, onExpand, preview, previewClassName, children }: StudioLayoutProps) {
  return (
    <div
      data-testid="studio-body"
      className={cn('studio-body', isEmpty && 'is-empty', drafting && 'is-draft', !isEmpty && collapsed && 'chat-collapsed')}
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
      <section data-testid="preview" className={cn('studio-preview', previewOpen && 'is-sheet', previewClassName)} aria-label="Live preview">
        {preview ?? <p className="p-5 text-[13px] text-[var(--ink-faint)]">Live preview</p>}
      </section>
    </div>
  );
}
