import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ThemeToggle } from '../../components/ThemeToggle';
import { UserAvatar } from '../../components/UserAvatar';
import { useUserProfile } from '../../context/UserProfileContext';
import { CUBIT_LOGO } from '../../cubit/subjects';

type StudioTopBarProps = {
  title: string;
  published: boolean;
  onPreview?: () => void;
};

export function StudioTopBar({ title, published, onPreview }: StudioTopBarProps) {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  return (
    <header className="studio-top">
      <button
        type="button"
        className="studio-icon-btn"
        aria-label="Back to My courses"
        onClick={() => navigate('/educator-courses')}
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
      </button>
      <img src={CUBIT_LOGO} alt="Cubit" width={28} height={28} className="studio-logo size-7 shrink-0 object-contain" />
      <div className="min-w-0">
        <p className="text-label text-[10px] text-[var(--ink-soft)]">Create · Cubit Studio</p>
        <div className="flex min-w-0 items-center gap-2">
          <h1 data-testid="studio-course-title" className="truncate text-[14px] font-semibold text-[var(--ink)]">
            {title}
          </h1>
          <span data-testid="studio-status-slot" className="shrink-0">
            {published ? (
              <span
                data-accent="status"
                className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--accent)]"
              >
                Published
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button type="button" data-testid="preview-open" className="studio-preview-btn" onClick={onPreview}>
          Preview
        </button>
        <ThemeToggle
          className="studio-theme size-11 border-[var(--border)] bg-transparent text-[var(--ink-soft)] hover:bg-[var(--fill)] hover:text-[var(--ink)]"
        />
        <span className="studio-avatar" aria-hidden="true">
          <UserAvatar profile={profile} size="md" />
        </span>
      </div>
    </header>
  );
}
