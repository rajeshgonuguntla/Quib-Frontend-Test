import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { HelpCircle, Moon, Sun, User } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useUserProfile } from '../context/UserProfileContext';
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

export function Settings() {
  const navigate = useNavigate();
  const { isDark, setDark } = useTheme();
  const { profile, loading, setProfile } = useUserProfile();
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
    if (tab === 'help' || tab === 'appearance') {
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
    { id: 'appearance', label: 'Appearance', icon: Sun },
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl">
        <TabsList className="mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
              <tab.icon size={14} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif-display text-lg font-normal">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && !profile ? (
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
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif-display text-lg font-normal">Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Choose light or dark mode. Saved on this device.</p>
              <div className="flex gap-2">
                <Button variant={!isDark ? 'default' : 'outline'} onClick={() => setDark(false)} className="gap-2">
                  <Sun size={16} /> Light
                </Button>
                <Button variant={isDark ? 'default' : 'outline'} onClick={() => setDark(true)} className="gap-2">
                  <Moon size={16} /> Dark
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif-display text-lg font-normal">Help & support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">Need help with courses, Studio, or your account?</p>
              <a href="mailto:support@quibb.ai" className="block text-foreground underline-offset-4 hover:underline">support@quibb.ai</a>
              <a href="/educators#how-it-works" className="block text-muted-foreground hover:text-foreground">How Educator Studio works</a>
              <a href="/browse-courses" className="block text-muted-foreground hover:text-foreground">Browse courses</a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
