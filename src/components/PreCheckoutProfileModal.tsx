import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { updateUserProfile } from '../api/userApi';
import type { UserProfile } from '../types/userProfile';

type PreCheckoutProfileModalProps = {
  profile: UserProfile;
  onComplete: (updated: UserProfile) => void;
  onCancel: () => void;
  theme: {
    bg1: string;
    border: string;
    text: string;
    text2: string;
    text3: string;
    red: string;
  };
};

export function PreCheckoutProfileModal({
  profile,
  onComplete,
  onCancel,
  theme: C,
}: PreCheckoutProfileModalProps) {
  const [mobile, setMobile] = useState(profile.mobilePhone ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = mobile.trim();
    if (trimmed.length < 10) {
      setError('Enter a valid mobile number (at least 10 digits).');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        ...profile,
        mobilePhone: trimmed,
      });
      onComplete(updated);
    } catch {
      setError('Could not save your mobile number. Check the format and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="precheckout-title"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{ background: C.bg1, border: `1px solid ${C.border}` }}
      >
        <h2 id="precheckout-title" className="text-lg font-semibold" style={{ color: C.text }}>
          Before you checkout
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.text2 }}>
          We need your contact details for purchase records and support. Your email comes from your
          sign-in account.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: C.text3 }}>
              Email
            </label>
            <p className="mt-1 text-sm" style={{ color: C.text2 }}>{profile.email ?? '—'}</p>
          </div>
          <div>
            <label htmlFor="checkout-mobile" className="text-xs font-medium uppercase tracking-wide" style={{ color: C.text3 }}>
              Mobile number
            </label>
            <input
              id="checkout-mobile"
              type="tel"
              autoComplete="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+1 555 123 4567"
              className="mt-1 w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
            />
          </div>
        </div>

        <p className="mt-3 text-xs" style={{ color: C.text3 }}>
          All sales are final. One-time purchase includes lifetime access to this course.
        </p>

        {error && (
          <p className="mt-3 text-sm" style={{ color: C.red }}>{error}</p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm"
            style={{ border: `1px solid ${C.border}`, color: C.text2, background: 'transparent' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSubmit()}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
            style={{ background: C.red, color: '#fff', border: 'none' }}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Continue to payment
          </button>
        </div>
      </div>
    </div>
  );
}
