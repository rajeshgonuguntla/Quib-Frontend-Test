import { useEffect, useState } from 'react';
import { DarkLayout } from './DarkLayout';
import { User } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';
import { useUserProfile } from '../context/UserProfileContext';
import { updateUserProfile } from '../api/userApi';
import { UserAvatar } from './UserAvatar';
import { getDisplayName } from '../utils/userDisplay';
import type { UserProfile } from '../types/userProfile';

export function Settings() {
  const { isDark } = useTheme();
  const C = getC(isDark);
  const { profile, loading, setProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState('profile');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      bio: profile.bio ?? '',
    });
  }, [profile]);

  const tabs = [{ id: 'profile', label: 'Profile', icon: User }];

  const inputStyle = (fieldName: string) => ({
    background: C.bg,
    border: `1px solid ${focusedField === fieldName ? C.border2 : C.border}`,
    color: C.text,
    boxShadow: focusedField === fieldName ? '0 0 0 3px rgba(225,6,0,0.06)' : 'none',
    transition: 'all 0.2s ease',
  });

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
    } catch {
      // keep form as-is on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      email: profile.email ?? '',
      bio: profile.bio ?? '',
    });
  };

  const displayName = getDisplayName(profile);

  return (
    <DarkLayout activeNav="settings" showSearch={false} sectionLabel="SETTINGS" title="Settings" subtitle="Manage your account and preferences">
      <div className="dash-fade-up grid lg:grid-cols-4 gap-8 max-w-5xl">
        <aside>
          <div
            className="rounded-xl p-2"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${C.border}`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <p
              className="px-4 pt-2 pb-2"
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                color: C.text3,
                fontWeight: 500,
              }}
            >
              MENU
            </p>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-[500] transition-all duration-200 cursor-pointer"
                    style={{
                      background: isActive ? C.redDim : 'transparent',
                      color: isActive ? C.red : C.text2,
                      border: isActive ? '1px solid rgba(225,6,0,0.15)' : '1px solid transparent',
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-sm"
                        style={{ width: 3, height: 16, background: C.red, borderRadius: 2 }}
                      />
                    )}
                    <tab.icon className="w-[18px] h-[18px]" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div
              className="dash-fade-up rounded-xl p-6 md:p-8"
              style={{ background: C.bg1, border: `1px solid ${C.border}` }}
            >
              <p
                className="mb-1"
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.65rem',
                  color: C.text3,
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                }}
              >
                ACCOUNT
              </p>
              <h2
                className="mb-6"
                style={{
                  fontFamily: 'var(--serif)',
                  fontWeight: 400,
                  fontSize: '1.3rem',
                  color: C.text,
                  letterSpacing: '-0.01em',
                }}
              >
                Profile Information
              </h2>

              {loading && !profile ? (
                <p className="text-sm" style={{ color: C.text2 }}>
                  Loading profile…
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <UserAvatar profile={profile} size="lg" />
                    <div>
                      <div className="text-sm font-[600] mb-0.5" style={{ color: C.text }}>
                        {displayName}
                      </div>
                      <div className="text-xs mb-3" style={{ color: C.text3 }}>
                        {profile?.email ?? ''}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block mb-2"
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '0.78rem',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase' as const,
                          color: C.text2,
                          fontWeight: 500,
                        }}
                      >
                        First Name
                      </label>
                      <input
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
                        style={inputStyle('firstName')}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                    <div>
                      <label
                        className="block mb-2"
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '0.78rem',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase' as const,
                          color: C.text2,
                          fontWeight: 500,
                        }}
                      >
                        Last Name
                      </label>
                      <input
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
                        style={inputStyle('lastName')}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block mb-2"
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '0.78rem',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase' as const,
                        color: C.text2,
                        fontWeight: 500,
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 opacity-70 cursor-not-allowed"
                      style={inputStyle('email')}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-2"
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '0.78rem',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase' as const,
                        color: C.text2,
                        fontWeight: 500,
                      }}
                    >
                      Bio
                    </label>
                    <input
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-200"
                      style={inputStyle('bio')}
                      onFocus={() => setFocusedField('bio')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>

                  <div className="pt-6">
                    <div
                      style={{
                        height: 1,
                        background: `linear-gradient(90deg, transparent, ${C.border2}, transparent)`,
                        marginBottom: 24,
                      }}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-5 py-2 rounded-lg text-sm font-[500] transition-all duration-200"
                        style={{ color: C.text2, border: `1px solid ${C.border}` }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={saving || !profile}
                        className="px-5 py-2 rounded-lg text-sm font-[600] text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                        style={{ background: C.red, boxShadow: '0 4px 14px rgba(225,6,0,0.2)' }}
                      >
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DarkLayout>
  );
}
