import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTheme, getC } from './ThemeContext';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { ALL_CREATORS } from '../data/creators';
import { YTThumbnail } from './YTThumbnail';

export const INTERESTS_KEY  = 'quib_interests';
export const EDUCATORS_KEY  = 'quib_educators';

interface Interest {
  id: string;
  label: string;
  description: string;
  color: string;
  categories: string[];
}

const INTERESTS: Interest[] = [
  { id: 'ai',           label: 'AI & Machine Learning', description: 'Neural networks, deep learning, LLMs',    color: '#6366f1', categories: ['AI / Machine Learning'] },
  { id: 'programming',  label: 'Programming',           description: 'Python, JavaScript, algorithms',           color: '#22c55e', categories: ['Programming'] },
  { id: 'math',         label: 'Mathematics',           description: 'Calculus, linear algebra, proofs',         color: '#3b82f6', categories: ['Mathematics'] },
  { id: 'webdev',       label: 'Web Development',       description: 'React, CSS, backend APIs',                 color: '#06b6d4', categories: ['Web Development'] },
  { id: 'datascience',  label: 'Data Science',          description: 'Statistics, visualisation, pandas',       color: '#8b5cf6', categories: ['AI / Machine Learning', 'Programming'] },
  { id: 'physics',      label: 'Physics',               description: 'Mechanics, quantum, relativity',          color: '#f59e0b', categories: ['Mathematics'] },
  { id: 'biology',      label: 'Biology',               description: 'Genetics, cells, evolution',              color: '#10b981', categories: ['Biology'] },
  { id: 'chemistry',    label: 'Chemistry',             description: 'Organic, inorganic, reactions',           color: '#f97316', categories: ['Biology'] },
  { id: 'cybersecurity',label: 'Cybersecurity',         description: 'Ethical hacking, cryptography',           color: '#ef4444', categories: ['Web Development', 'Programming'] },
  { id: 'space',        label: 'Space & Astronomy',     description: 'Cosmology, planets, black holes',         color: '#a855f7', categories: ['Biology', 'Mathematics'] },
  { id: 'history',      label: 'History',               description: 'World events, civilisations',             color: '#84cc16', categories: [] },
  { id: 'economics',    label: 'Economics & Finance',   description: 'Markets, investing, micro/macro',         color: '#eab308', categories: [] },
  { id: 'psychology',   label: 'Psychology',            description: 'Cognition, behaviour, neuroscience',      color: '#ec4899', categories: ['Biology'] },
  { id: 'engineering',  label: 'Engineering',           description: 'Systems, circuits, mechanics',            color: '#64748b', categories: ['Mathematics', 'Programming'] },
  { id: 'medicine',     label: 'Medicine & Health',     description: 'Anatomy, pharmacology, clinical',         color: '#14b8a6', categories: ['Biology'] },
  { id: 'philosophy',   label: 'Philosophy',            description: 'Ethics, logic, epistemology',             color: '#f43f5e', categories: [] },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const C = getC(isDark);

  const [step, setStep] = useState<'interests' | 'educators' | 'done'>('interests');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [selectedEducators, setSelectedEducators] = useState<Set<string>>(new Set());

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleEducator = (id: string) => {
    setSelectedEducators(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Collect all categories for selected interests
  const relevantCategories = useMemo(() => {
    const cats = new Set<string>();
    INTERESTS.filter(i => selectedInterests.has(i.id)).forEach(i => i.categories.forEach(c => cats.add(c)));
    return cats;
  }, [selectedInterests]);

  // Educators that match selected interest categories
  const relevantEducators = useMemo(() => {
    if (relevantCategories.size === 0) return ALL_CREATORS;
    return ALL_CREATORS.filter(c => relevantCategories.has(c.category));
  }, [relevantCategories]);

  const handleInterestsContinue = () => {
    localStorage.setItem(INTERESTS_KEY, JSON.stringify([...selectedInterests]));
    setStep('educators');
  };

  const handleEducatorsContinue = () => {
    localStorage.setItem(EDUCATORS_KEY, JSON.stringify([...selectedEducators]));
    setStep('done');
    setTimeout(() => navigate('/home'), 800);
  };

  const handleSkipEducators = () => {
    localStorage.setItem(EDUCATORS_KEY, '[]');
    setStep('done');
    setTimeout(() => navigate('/home'), 800);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-12 px-4"
      style={{ background: C.bg, color: C.text, fontFamily: 'var(--display)' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(225,6,0,0.07) 0%, transparent 60%)` }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[1.4rem] font-[700] tracking-tight" style={{ color: C.text }}>Quib</span>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {(['interests', 'educators'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-[700] transition-all duration-300"
                  style={{
                    background: step === s ? C.red : (step === 'educators' && s === 'interests') ? C.red : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                    color: step === s ? '#fff' : (step === 'educators' && s === 'interests') ? '#fff' : C.text3,
                  }}
                >
                  {step === 'educators' && s === 'interests' ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-[0.72rem] font-[500]" style={{ color: step === s ? C.text : C.text3 }}>
                  {s === 'interests' ? 'Topics' : 'Educators'}
                </span>
                {i === 0 && (
                  <div className="w-8 h-px mx-1" style={{ background: step === 'educators' ? C.red : C.border }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: C.redDim, border: `2px solid ${C.red}` }}>
              <Check className="w-8 h-8" style={{ color: C.red }} />
            </div>
            <p className="text-lg font-[500]" style={{ color: C.text }}>All set! Taking you to your feed...</p>
          </div>
        )}

        {/* ── INTERESTS ── */}
        {step === 'interests' && (
          <>
            <div className="text-center mb-10">
              <p className="mb-2" style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: C.red, letterSpacing: '0.14em', fontWeight: 500 }}>
                STEP 1 OF 2 · PERSONALISE YOUR FEED
              </p>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: C.text, marginBottom: 10 }}>
                What would you like to learn?
              </h1>
              <p className="text-sm font-[300]" style={{ color: C.text2, maxWidth: 480, margin: '0 auto' }}>
                Select at least 2 areas to curate your feed.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
              {INTERESTS.map((interest) => {
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
                    Select at least 2 areas to continue
                    {selectedInterests.size === 1 && <span style={{ color: C.red }}> · 1 more to go</span>}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: C.text2 }}>
                    <span className="font-[600]" style={{ color: C.text }}>{selectedInterests.size}</span>
                    {' '}topic{selectedInterests.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleInterestsContinue}
                  disabled={selectedInterests.size < 2}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-[600] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: C.red, boxShadow: selectedInterests.size >= 2 ? '0 4px 14px rgba(225,6,0,0.3)' : 'none' }}
                  onMouseEnter={(e) => { if (selectedInterests.size >= 2) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── EDUCATORS ── */}
        {step === 'educators' && (
          <>
            <div className="text-center mb-10">
              <p className="mb-2" style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: C.red, letterSpacing: '0.14em', fontWeight: 500 }}>
                STEP 2 OF 2 · FOLLOW EDUCATORS
              </p>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: C.text, marginBottom: 10 }}>
                Who do you want to learn from?
              </h1>
              <p className="text-sm font-[300]" style={{ color: C.text2, maxWidth: 480, margin: '0 auto' }}>
                Select at least 1 educator to personalise your home feed.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
              {relevantEducators.map((creator) => {
                const isSelected = selectedEducators.has(creator.id);
                return (
                  <button
                    key={creator.id}
                    onClick={() => toggleEducator(creator.id)}
                    className="relative flex flex-col items-start rounded-2xl overflow-hidden text-left transition-all duration-200 group"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1.5px solid ${isSelected ? creator.color : C.border}`,
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isSelected ? `0 4px 20px ${creator.color}30` : 'none',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = C.border2; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = C.border; }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', background: C.bg2 }}>
                      <YTThumbnail videoId={creator.videoId} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
                      {/* Category badge */}
                      <div
                        className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-full text-[0.6rem] font-[600]"
                        style={{ background: creator.color + '33', color: '#fff', border: `1px solid ${creator.color}66`, backdropFilter: 'blur(8px)' }}
                      >
                        {creator.category}
                      </div>
                      {/* Check badge */}
                      {isSelected && (
                        <div
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: creator.color, boxShadow: `0 2px 8px ${creator.color}66` }}
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <p className="text-[0.85rem] font-[700] leading-snug mb-0.5" style={{ color: isSelected ? creator.color : C.text }}>
                        {creator.name}
                      </p>
                      <p className="text-[0.72rem] font-[300] leading-snug" style={{ color: C.text3 }}>
                        {creator.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className="sticky bottom-6 flex items-center justify-between px-5 py-3.5 rounded-2xl"
              style={{ background: isDark ? 'rgba(17,17,21,0.9)' : 'rgba(255,255,255,0.95)', border: `1px solid ${C.border2}`, backdropFilter: 'blur(20px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('interests')}
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{ color: C.text3 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <div className="w-px h-4" style={{ background: C.border }} />
                {selectedEducators.size === 0 ? (
                  <p className="text-sm" style={{ color: C.text3 }}>Select at least 1 educator</p>
                ) : (
                  <p className="text-sm" style={{ color: C.text2 }}>
                    <span className="font-[600]" style={{ color: C.text }}>{selectedEducators.size}</span>
                    {' '}educator{selectedEducators.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkipEducators}
                  className="text-sm transition-colors"
                  style={{ color: C.text3 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
                >
                  Skip
                </button>
                <button
                  onClick={handleEducatorsContinue}
                  disabled={selectedEducators.size < 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-[600] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: C.red, boxShadow: selectedEducators.size >= 1 ? '0 4px 14px rgba(225,6,0,0.3)' : 'none' }}
                  onMouseEnter={(e) => { if (selectedEducators.size >= 1) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Finish
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
