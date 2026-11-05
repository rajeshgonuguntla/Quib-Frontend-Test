import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme, getC } from './ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { Check, ArrowRight } from 'lucide-react';
import { QuibLogo } from './QuibLogo';
import { fetchInterests, saveOnboarding } from '../api/catalogApi';
import type { CatalogInterest } from '../types/catalog';

export const INTERESTS_KEY = 'quib_interests';
export const EDUCATORS_KEY = 'quib_educators';

interface Interest {
  id: string;
  label: string;
  description: string;
  color: string;
  categories: string[];
}

const FALLBACK_INTERESTS: Interest[] = [
  { id: 'ai', label: 'AI & Machine Learning', description: 'Neural networks, deep learning, LLMs', color: '#6366f1', categories: ['AI / Machine Learning'] },
  { id: 'programming', label: 'Programming', description: 'Python, JavaScript, algorithms', color: '#22c55e', categories: ['Programming'] },
  { id: 'webdev', label: 'Web Development', description: 'React, CSS, backend APIs', color: '#06b6d4', categories: ['Web Development'] },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getC(isDark);

  const [step, setStep] = useState<'interests' | 'done'>('interests');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [interests, setInterests] = useState<Interest[]>(FALLBACK_INTERESTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInterests()
      .then((list: CatalogInterest[]) => {
        if (list.length > 0) {
          setInterests(
            list.map((i) => ({
              id: i.id,
              label: i.label,
              description: i.description,
              color: i.color,
              categories: i.categories ?? [],
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const finishOnboarding = async () => {
    setSaving(true);
    const interestIds = [...selectedInterests];
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(interestIds));
    localStorage.setItem(EDUCATORS_KEY, JSON.stringify([]));
    try {
      await saveOnboarding({
        interestIds,
        followedCreatorIds: [],
        completed: true,
      });
    } catch {
      /* still allow local flow */
    } finally {
      setSaving(false);
    }
    setStep('done');
    setTimeout(() => navigate('/dashboard'), 800);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-12 px-4"
      style={{ background: C.bg, color: C.text, fontFamily: 'var(--display)' }}
    >
      <div className="fixed top-5 right-5 z-20">
        <ThemeToggle size="sm" />
      </div>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(225,6,0,0.07) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-10" style={{ color: C.text }}>
          <QuibLogo
            size={22}
            wordmarkClassName="text-[1.4rem] font-[700] tracking-tight"
            variant={isDark ? 'dark' : 'light'}
          />
        </div>

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: C.redDim, border: `2px solid ${C.red}` }}>
              <Check className="w-8 h-8" style={{ color: C.red }} />
            </div>
            <p className="text-lg font-[500]" style={{ color: C.text }}>All set! Taking you to your feed...</p>
          </div>
        )}

        {step === 'interests' && (
          <>
            <div className="text-center mb-10">
              <p className="mb-2" style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: C.red, letterSpacing: '0.14em', fontWeight: 500 }}>
                PERSONALISE YOUR FEED
              </p>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: C.text, marginBottom: 10 }}>
                What would you like to learn?
              </h1>
              <p className="text-sm font-[300]" style={{ color: C.text2, maxWidth: 480, margin: '0 auto' }}>
                Select at least 2 topics to curate your feed.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
              {interests.map((interest) => {
                const isSelected = selectedInterests.has(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className="relative flex flex-col items-start gap-1.5 p-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: isSelected ? `${interest.color}14` : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1.5px solid ${isSelected ? interest.color : C.border}`,
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isSelected ? `0 4px 16px ${interest.color}22` : 'none',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = C.border2; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: interest.color }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-[0.82rem] font-[600] leading-snug" style={{ color: isSelected ? interest.color : C.text }}>
                      {interest.label}
                    </span>
                    <span className="text-[0.7rem] font-[300] leading-snug" style={{ color: C.text3 }}>
                      {interest.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="sticky bottom-6 flex items-center justify-between px-5 py-3.5 rounded-2xl"
              style={{ background: isDark ? 'rgba(17,17,21,0.9)' : 'rgba(255,255,255,0.95)', border: `1px solid ${C.border2}`, backdropFilter: 'blur(20px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)' }}
            >
              <div>
                {selectedInterests.size < 2 ? (
                  <p className="text-sm" style={{ color: C.text3 }}>
                    Select at least 2 topics to continue
                    {selectedInterests.size === 1 && <span style={{ color: C.red }}> · 1 more to go</span>}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: C.text2 }}>
                    <span className="font-[600]" style={{ color: C.text }}>{selectedInterests.size}</span>
                    {' '}topic{selectedInterests.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              <button
                onClick={() => void finishOnboarding()}
                disabled={selectedInterests.size < 2 || saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-[600] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: C.red, boxShadow: selectedInterests.size >= 2 ? '0 4px 14px rgba(225,6,0,0.3)' : 'none' }}
              >
                {saving ? 'Saving…' : 'Get started'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
