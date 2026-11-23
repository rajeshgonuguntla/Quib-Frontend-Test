import { ChevronLeft, ChevronRight } from 'lucide-react';

type EdgeToggleProps = {
  collapsed: boolean;
  onToggle: () => void;
};

/** Divider control for the studio chat pane. Ink-soft, not the orange app-sidebar chevron. */
export function EdgeToggle({ collapsed, onToggle }: EdgeToggleProps) {
  return (
    <button
      type="button"
      data-testid="chat-toggle"
      className="cuib-edge-toggle studio-chat-toggle"
      aria-expanded={!collapsed}
      aria-controls="studio-chat"
      aria-label={collapsed ? 'Expand chat' : 'Collapse chat'}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {collapsed ? (
        <ChevronRight size={14} strokeWidth={2.2} />
      ) : (
        <ChevronLeft size={14} strokeWidth={2.2} />
      )}
    </button>
  );
}
