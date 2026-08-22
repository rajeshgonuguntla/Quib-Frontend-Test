import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { HelpCircle, User, CreditCard, Gift } from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminAccount } from '../utils/signInIntent';
import { updateUserProfile } from '../api/userApi';
import { UserAvatar } from './UserAvatar';
import { getDisplayName } from '../utils/userDisplay';
import type { UserProfile } from '../types/userProfile';
import { PageHeader } from '../shell/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  createBillingPortal,
  fetchBillingMe,
  fetchReferrals,
  requestAnnualRefund,
  type BillingStatus,
  type ReferralStatus,
} from '../api/billingApi';

export function Settings() {
  const navigate = useNavigate();
  const { profile, error, refreshProfile, setProfile } = useUserProfile();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'help' || tab === 'billing' || tab === 'referrals') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      bio: profile.bio ?? '',
    });
  }, [profile]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

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
    } catch {
      setStatusMessage('Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!isDirty) {
      navigate('/dashboard');
      return;
    }
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      bio: profile.bio ?? '',
    });
    setStatusMessage('Changes discarded.');
  };

  const displayName = getDisplayName(profile);

  return (
    <div>
      <PageHeader label="Account" title="Settings" description="Manage your account and preferences." />

      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          setActiveTab(tab);
          navigate(tab === 'profile' ? '/settings' : `/settings?tab=${tab}`);
        }}
        className="max-w-3xl"
      >
        <TabsList className="mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
              <tab.icon size={14} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif-display text-lg font-normal">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && !profile ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button type="button" variant="outline" onClick={() => void refreshProfile()}>
                    Retry
                  </Button>
                </div>
              ) : !profile ? (
                <p className="text-sm text-muted-foreground">Loading profile…</p>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <UserAvatar profile={profile} size="lg" />
                    <div>
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email ?? ''}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} readOnly className="opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
                    {statusMessage && <p className="text-xs text-muted-foreground sm:mr-auto">{statusMessage}</p>}
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                      {isDirty ? 'Discard changes' : 'Back to dashboard'}
                    </Button>
                    <Button type="button" onClick={() => void handleSave()} disabled={saving || !profile || !isDirty}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif-display text-lg font-normal">Help & support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">Need help with courses, Studio, or your account?</p>
              <a href="mailto:support@cuib.ai" className="block text-foreground underline-offset-4 hover:underline">support@cuib.ai</a>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <BillingPanel />
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralsPanel />
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif-display text-lg font-normal">Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <a href="/#create" className="block text-muted-foreground hover:text-foreground">How Educator Studio works</a>
              <a href="/discover?tab=courses" className="block text-muted-foreground hover:text-foreground">Browse courses</a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function BillingPanel() {
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
    <Card>
      <CardHeader>
        <CardTitle className="font-serif-display text-lg font-normal">Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {error && <p className="text-destructive">{error}</p>}
        {isAdmin ? (
          <p className="text-muted-foreground">
            Platform admin — Unlimited generation with no payment restrictions.
          </p>
        ) : !status ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <p>
              Plan:{' '}
              <span className="font-medium">
                {status.plan === 'annual' ? 'Unlimited Annual' : status.plan === 'monthly' ? 'Unlimited Monthly' : 'None'}
              </span>
            </p>
            <p className="text-muted-foreground">
              Status: {status.status ?? 'no subscription'}
              {status.cancelAtPeriodEnd ? ' · cancels at period end' : ''}
            </p>
            <p className="text-muted-foreground">
              Current period ends {fmtDate(status.currentPeriodEnd)}
            </p>
            <p className="text-muted-foreground">
              Trial: {status.trialCoursesUsed}/{status.trialLimit} generated courses used
              {status.complimentaryUntil ? ` · complimentary through ${fmtDate(status.complimentaryUntil)}` : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void manage()} disabled={busy}>
                {busy ? 'Opening…' : 'Manage billing'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/upgrade">Change plan</Link>
              </Button>
              {status.refundEligible && (
                <Button type="button" variant="outline" onClick={() => void refund()} disabled={busy}>
                  Request 14-day refund
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cancel, resume, switch Annual/Monthly, and update your payment method in the Stripe billing portal.
              Annual refunds within 14 days of first payment are requested here, not in the portal.
            </p>
            {refundMsg && <p className="text-sm">{refundMsg}</p>}
          </>
        )}
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="font-serif-display text-lg font-normal">Referrals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {error && <p className="text-destructive">{error}</p>}
        {!data ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <p>Share your code. When someone creates an account with it, you both get one free month of Unlimited (up to 3 months earned).</p>
            <p className="font-mono text-lg tracking-wide">{data.code}</p>
            <p className="break-all text-muted-foreground">{data.shareUrl}</p>
            <Button type="button" variant="outline" onClick={() => void copy()}>
              {copied ? 'Copied' : 'Copy invite link'}
            </Button>
            <p className="text-muted-foreground">Months earned: {data.monthsEarned} / {data.maxMonths}</p>
            <div>
              <p className="mb-2 font-medium">People you referred</p>
              {data.referred.length === 0 ? (
                <p className="text-muted-foreground">No one yet.</p>
              ) : (
                <ul className="space-y-1 text-muted-foreground">
                  {data.referred.map((row) => (
                    <li key={`${row.displayName}-${row.createdAt}`}>
                      {row.displayName} · joined {fmtDate(row.createdAt)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
