import { Link } from 'react-router';

export function TrialUpgradePrompt({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <h2 className="font-serif-display text-xl">You’ve used your 3 free courses</h2>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/upgrade"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Upgrade to Unlimited
          </Link>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
