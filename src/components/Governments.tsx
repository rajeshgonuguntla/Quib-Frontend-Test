import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Building2, CheckCircle2, Loader2, Mail, MapPin, Users } from 'lucide-react';
import { submitGovernmentInquiry } from '../api/governmentsApi';
import { useTheme, getC } from './ThemeContext';
import { QuibLogo } from './QuibLogo';
import { ThemeToggle } from './ThemeToggle';

export function Governments() {
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [countryRegion, setCountryRegion] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await submitGovernmentInquiry({
        organizationName,
        contactName,
        contactEmail,
        countryRegion: countryRegion || undefined,
        message,
      });
      setSuccess(result.message);
      setOrganizationName('');
      setContactName('');
      setContactEmail('');
      setCountryRegion('');
      setMessage('');
    } catch (err) {
      setError(axiosMessage(err) ?? 'Could not submit your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <header
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-5 md:px-8"
        style={{ background: C.bg1, borderColor: C.border }}
      >
        <Link to="/" className="no-underline" style={{ color: C.text }}>
          <QuibLogo size={18} wordmarkClassName="text-sm font-semibold" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <Link
            to="/signin"
            className="rounded-md px-3 py-1.5 text-sm font-medium no-underline"
            style={{ background: C.red, color: '#fff' }}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-label mb-2 text-sm font-medium uppercase tracking-wider" style={{ color: C.red }}>
          For governments
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
          Upskilling centers powered by Cuib
        </h1>
        <p className="mb-10 max-w-2xl text-base leading-relaxed" style={{ color: C.text2 }}>
          Partner with Cuib to deliver AI-assisted courses, measurable learner progress, and educator
          analytics for public workforce and upskilling programs.
        </p>

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Building2 className="size-5" style={{ color: C.red }} />}
            title="Regional programs"
            body="Deploy structured learning paths from trusted creator content and your own video libraries."
            C={C}
          />
          <FeatureCard
            icon={<Users className="size-5" style={{ color: C.red }} />}
            title="Learner outcomes"
            body="Track enrollments, completion, and quiz performance with educator dashboards."
            C={C}
          />
          <FeatureCard
            icon={<MapPin className="size-5" style={{ color: C.red }} />}
            title="Local context"
            body="Multilingual courses and category filters to match regional skills priorities."
            C={C}
          />
        </div>

        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ background: C.bg1, borderColor: C.border }}
        >
          <div className="mb-6 flex items-center gap-2">
            <Mail className="size-5" style={{ color: C.red }} />
            <h2 className="text-xl font-semibold">Contact our partnerships team</h2>
          </div>

          {success && (
            <div
              className="mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <p className="mb-4 text-sm" style={{ color: C.red }}>
              {error}
            </p>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 md:grid-cols-2">
            <Field label="Organization" C={C}>
              <input
                required
                minLength={2}
                maxLength={200}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle(C)}
                placeholder="Ministry of Skills / State workforce board"
              />
            </Field>
            <Field label="Contact name" C={C}>
              <input
                required
                minLength={2}
                maxLength={200}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle(C)}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Email" C={C}>
              <input
                required
                type="email"
                maxLength={320}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle(C)}
                placeholder="partnerships@gov.example"
              />
            </Field>
            <Field label="Country / region" C={C}>
              <input
                maxLength={120}
                value={countryRegion}
                onChange={(e) => setCountryRegion(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle(C)}
                placeholder="Optional"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="How can we help?" C={C}>
                <textarea
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-y rounded-lg px-3 py-2 text-sm outline-none"
                  style={inputStyle(C)}
                  placeholder="Tell us about your upskilling goals, learner volume, and timeline."
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                style={{ background: C.red, color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Submit inquiry
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  C,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  C: ReturnType<typeof getC>;
}) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: C.border, background: C.bg1 }}>
      <div className="mb-3">{icon}</div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: C.text2 }}>
        {body}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  C,
}: {
  label: string;
  children: ReactNode;
  C: ReturnType<typeof getC>;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium" style={{ color: C.text2 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle(C: ReturnType<typeof getC>) {
  return {
    background: C.bg2,
    border: `1px solid ${C.border}`,
    color: C.text,
  } as const;
}

function axiosMessage(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    return data?.message ?? null;
  }
  return null;
}
