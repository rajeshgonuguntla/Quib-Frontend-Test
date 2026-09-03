import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminAccount, clearSignInIntent } from '../utils/signInIntent';
import { updateUserProfile } from '../api/userApi';
import { getDisplayName } from '../utils/userDisplay';
import { UserAvatar } from './UserAvatar';
import type { UserProfile } from '../types/userProfile';
import { useShell } from '../shell/ShellContext';
import { clearToken } from '../auth';
import {
  billingPlanLabel,
  createBillingPortal,
  fetchBillingMe,
  fetchReferrals,
  hidesUpgradeCta,
  requestAnnualRefund,
  type BillingStatus,
  type ReferralStatus,
} from '../api/billingApi';

export function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const extra = searchParams.get('tab');
  const { profile, error, refreshProfile, setProfile } = useUserProfile();
  const { billing, refreshBilling } = useShell();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', bio: '' });

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      bio: profile.bio ?? '',
    });
  }, [profile]);

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return (
      (form.firstName.trim() || '') !== (profile.firstName ?? '')
      || (form.lastName.trim() || '') !== (profile.lastName ?? '')
      || (form.bio.trim() || '') !== (profile.bio ?? '')
    );
  }, [form, profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const payload: UserProfile = {
        ...profile,
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        bio: form.bio.trim() || undefined,
      };
      const updated = await updateUserProfile(payload);
      setProfile(updated);
      setStatusMessage('Profile saved.');
      setEditing(false);
    } catch {
      setStatusMessage('Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    clearToken();
    clearSignInIntent();
    setProfile(null);
    navigate('/signin');
  };

  const displayName = getDisplayName(profile);
  const isAdmin = isAdminAccount(profile);
  const planLabel = billingPlanLabel(billing, isAdmin);
  const showUpgrade = !!profile && !isAdmin && !(billing && hidesUpgradeCta(billing));

  return (
    <section className="browse-hero">
      <div className="eyebrow eyebrow-heading">Settings</div>
      <div className="card-divider" />

      <div className="settings-section">
        <div className="settings-section-title">Profile</div>
        {error && !profile ? (
          <div className="settings-row">
            <p className="settings-row-sub">{error}</p>
            <button type="button" className="settings-btn" onClick={() => void refreshProfile()}>Retry</button>
          </div>
        ) : !profile ? (
          <p className="settings-row-sub">Loading profile…</p>
        ) : (
          <>
            <div className="settings-row">
              <div className="settings-row-left">
                <UserAvatar
                  profile={profile}
                  size="md"
                  variant="mono"
                  className="settings-avatar"
                  style={{ width: 40, height: 40 }}
                />
                <div className="user-info">
                  <div className="uname">{displayName || 'Account'}</div>
                  <div className="plan-free">{profile.email}</div>
                </div>
              </div>
              <button type="button" className="settings-btn" onClick={() => setEditing((v) => !v)}>
                {editing ? 'Close' : 'Edit profile'}
              </button>
            </div>
            {editing && (
              <div className="settings-edit">
                <div>
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} readOnly />
                </div>
                <div>
                  <label htmlFor="bio">Bio</label>
                  <input id="bio" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                </div>
                {statusMessage && <p className="settings-row-sub">{statusMessage}</p>}
                <div className="settings-edit-actions">
                  <button type="button" className="settings-btn" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                  <button type="button" className="settings-btn" onClick={() => void handleSave()} disabled={saving || !isDirty}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card-divider" />

      <div className="settings-section">
        <div className="settings-section-title">Plan</div>
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-row-text">
              <div className="settings-row-label">{planLabel}</div>
              <div className="settings-row-sub">
                {showUpgrade
                  ? 'Upgrade for unlimited courses and offline downloads'
                  : isAdmin
                    ? 'Platform admin — Unlimited with no payment restrictions.'
                    : 'Your plan is active.'}
              </div>
            </div>
          </div>
          {showUpgrade && (
            <button type="button" className="upgrade-fab-cta" onClick={() => navigate('/upgrade')}>
              Upgrade
            </button>
          )}
        </div>
      </div>

      <div className="card-divider" />

      <div className="settings-section">
        <div className="settings-section-title">Account</div>
        <button type="button" className="settings-link" onClick={handleSignOut}>Sign out</button>
      </div>

      {extra === 'help' && (
        <>
          <div className="card-divider" />
          <div className="settings-section">
            <div className="settings-section-title">Help</div>
            <a className="settings-link" href="mailto:support@cuib.ai">support@cuib.ai</a>
            <Link className="settings-link" to="/discover?tab=courses">Browse courses</Link>
          </div>
        </>
      )}
      {extra === 'billing' && (
        <>
          <div className="card-divider" />
          <BillingPanel onChanged={refreshBilling} />
        </>
      )}
      {extra === 'referrals' && (
        <>
          <div className="card-divider" />
          <ReferralsPanel />
        </>
      )}
    </section>
  );
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function BillingPanel({ onChanged }: { onChanged: () => void }) {
  const { profile } = useUserProfile();
  const isAdmin = isAdminAccount(profile);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refundMsg, setRefundMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) return;
    fetchBillingMe()
      .then(setStatus)
      .catch(() => setError('Could not load billing status.'));
  }, [isAdmin]);

  const manage = async () => {
    setBusy(true);
    setError(null);
    try {
      window.location.href = await createBillingPortal();
    } catch (err) {
      setError((err as Error).message || 'Billing portal is unavailable.');
      setBusy(false);
    }
  };

  const refund = async () => {
    if (!window.confirm('Request a full refund and cancel Unlimited immediately?')) return;
    setBusy(true);
    setRefundMsg(null);
    try {
      const result = await requestAnnualRefund();
      if (result.status === 'approved') {
        setRefundMsg('Refund processed. Unlimited access has ended.');
        setStatus(await fetchBillingMe());
        onChanged();
      } else {
        setRefundMsg(result.reason || 'Refund declined.');
      }
    } catch (err) {
      setRefundMsg((err as Error).message || 'Could not submit refund request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section-title">Billing</div>
      {error && <p className="settings-row-sub">{error}</p>}
      {isAdmin ? (
        <p className="settings-row-sub">Platform admin — Unlimited generation with no payment restrictions.</p>
      ) : !status ? (
        <p className="settings-row-sub">Loading…</p>
      ) : (
        <>
          <p className="settings-row-sub">
            {status.plan === 'annual' ? 'Unlimited Annual' : status.plan === 'monthly' ? 'Unlimited Monthly' : 'None'}
            {status.status ? ` · ${status.status}` : ''}
            {status.cancelAtPeriodEnd ? ' · cancels at period end' : ''}
          </p>
          <p className="settings-row-sub">Current period ends {fmtDate(status.currentPeriodEnd)}</p>
          <p className="settings-row-sub">
            Trial: {status.trialCoursesUsed}/{status.trialLimit} generated courses used
          </p>
          <div className="settings-row">
            <button type="button" className="settings-btn" onClick={() => void manage()} disabled={busy}>
              {busy ? 'Opening…' : 'Manage billing'}
            </button>
            <Link className="settings-btn" to="/upgrade">Change plan</Link>
            {status.refundEligible && (
              <button type="button" className="settings-btn" onClick={() => void refund()} disabled={busy}>
                Request 14-day refund
              </button>
            )}
          </div>
          {refundMsg && <p className="settings-row-sub">{refundMsg}</p>}
        </>
      )}
    </div>
  );
}

function ReferralsPanel() {
  const [data, setData] = useState<ReferralStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReferrals()
      .then(setData)
      .catch(() => setError('Could not load referrals.'));
  }, []);

  const copy = async () => {
    if (!data?.shareUrl) return;
    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="settings-section">
      <div className="settings-section-title">Referrals</div>
      {error && <p className="settings-row-sub">{error}</p>}
      {!data ? (
        <p className="settings-row-sub">Loading…</p>
      ) : (
        <>
          <p className="settings-row-sub">Share your code. You both get one free month of Unlimited (up to 3 months earned).</p>
          <p className="settings-row-label" style={{ fontFamily: 'var(--mono)' }}>{data.code}</p>
          <button type="button" className="settings-btn" onClick={() => void copy()}>
            {copied ? 'Copied' : 'Copy invite link'}
          </button>
          <p className="settings-row-sub">Months earned: {data.monthsEarned} / {data.maxMonths}</p>
        </>
      )}
    </div>
  );
}
