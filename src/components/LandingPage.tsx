import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { StepCard } from './StepCard';
import { Sun, Moon, Upload } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [glowNode, setGlowNode] = useState<string>('01');

  useEffect(() => {
    const steps = ['01', '02', '03'];
    let index = 0;
    setGlowNode(steps[0]);
    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setGlowNode(steps[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('cert-in'); });
      },
      { threshold: 0.08 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const handleGenerate = () => { if (youtubeUrl) navigate('/quiz-setup'); };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploaded file:', file.name, file.type, file.size);
      // TODO: handle file processing
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const tickerItems = [
    'Multiple choice', 'True / False', 'Open-ended', 'Timestamp links',
    'Difficulty levels', 'Export to PDF', 'Share on LinkedIn', 'Score tracking',
    'Any language', 'Custom focus', 'AI-powered', 'Score tracking',
  ];

  const navBg = isDark ? 'rgba(6,6,8,0.88)' : 'rgba(255,255,255,0.85)';

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "var(--display)", overflowX: 'hidden' }}>
      {/* Grain overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.022,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10"
        style={{ height: 60, background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}
      >
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1.5 no-underline cursor-pointer" style={{ color: C.text }}>
          <span className="text-[1.05rem] font-[700] tracking-tight">Quib</span>
        </a>

        <ul className="hidden md:flex gap-7 list-none absolute left-1/2 -translate-x-1/2">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how' },
          ].map((l) => (
            <li key={l.label}>
              {l.href.startsWith('/') ? (
                <Link to={l.href} className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100" style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}>
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100" style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}>
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer' }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Link to="/signin" className="hidden md:inline text-[0.82rem] font-[400] no-underline transition-opacity hover:opacity-80" style={{ color: C.text2 }}>
            Sign in
          </Link>
          <Link to="/signin" className="text-[0.82rem] font-[600] no-underline px-[18px] py-2 rounded-md transition-all hover:opacity-90 hover:-translate-y-px" style={{ background: C.text, color: C.bg, letterSpacing: '0.01em' }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ padding: '100px 24px 60px' }}>
        <div className="absolute pointer-events-none" style={{ top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 500, background: `radial-gradient(ellipse at center, rgba(225,6,0,0.06) 0%, transparent 65%)` }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isDark
              ? `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`
              : `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)',
          }}
        />

        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-9 cert-fade-up" style={{ border: `1px solid ${C.border2}`, fontFamily: "var(--mono)", fontSize: '0.7rem', color: C.text2, letterSpacing: '0.06em', animationDelay: '0s' }}>
          <span>Powered by AI &nbsp;·&nbsp; Free to try</span>
        </div>

        <h1 className="cert-fade-up" style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 800, animationDelay: '0.1s', fontFamily: "var(--serif)" }}>
          Turn any YouTube video
          <span className="block" style={{ color: 'transparent', WebkitTextStroke: isDark ? '1px rgba(255,255,255,0.18)' : '1px rgba(0,0,0,0.18)' }}>
            into a <em style={{ fontStyle: 'normal', color: C.red, WebkitTextStroke: '0' }}>smart quiz</em>
          </span>
        </h1>

        <p className="cert-fade-up" style={{ marginTop: 28, color: C.text2, fontSize: '1.05rem', maxWidth: 480, lineHeight: 1.75, fontWeight: 300, animationDelay: '0.2s' }}>
          Paste a link. Get a quiz. Understand more from every video you watch — in under 30 seconds.
        </p>

        <form
          className="cert-fade-up mt-10 flex w-full max-w-xl mx-auto"
          style={{ animationDelay: '0.3s' }}
          onSubmit={(e) => { e.preventDefault(); if (youtubeUrl.trim()) navigate('/signin', { state: { youtubeUrl } }); }}
        >
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste a YouTube URL here..."
            className="flex-1 px-5 py-3.5 rounded-l-lg text-[0.9rem] outline-none transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${C.border}`,
              borderRight: 'none',
              color: C.text,
              fontFamily: 'var(--mono)',
              letterSpacing: '0.01em',
            }}
          />
          {/* Upload Document */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-3.5 transition-all duration-200 cursor-pointer"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${C.border}`,
              borderLeft: 'none',
              borderRight: 'none',
              color: C.text2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.red;
              e.currentTarget.style.background = C.redDim;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.text2;
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
            }}
            title="Upload PDF or Word document"
          >
            <Upload className="w-4.5 h-4.5" />
          </button>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-r-lg text-[0.9rem] font-[600] text-white transition-all hover:opacity-90 cursor-pointer"
            style={{ background: C.red, border: 'none', letterSpacing: '0.01em' }}
          >
            Generate Quiz
          </button>
        </form>

        <div className="flex gap-3 mt-5 flex-wrap justify-center cert-fade-up" style={{ animationDelay: '0.35s' }}>
          <a href="#how" className="no-underline px-7 py-3.5 rounded-lg text-[0.9rem] font-[400] transition-all hover:-translate-y-0.5" style={{ color: C.text2, border: `1px solid ${C.border}`, letterSpacing: '0.01em' }}>
            See how it works
          </a>
        </div>

        <p className="cert-fade-up" style={{ marginTop: 16, fontSize: '0.75rem', color: C.text3, fontFamily: "var(--mono)", letterSpacing: '0.04em', animationDelay: '0.4s' }}>
          No credit card required · Free tier available
        </p>

        <div className="mt-20 w-full overflow-hidden cert-fade-up" style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '13px 0', animationDelay: '0.5s' }}>
          <div className="flex w-max cert-ticker">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-7 whitespace-nowrap" style={{ fontFamily: "var(--mono)", fontSize: '0.7rem', color: C.text3, letterSpacing: '0.06em' }}>
                <span style={{ color: C.red }}>·</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={addRevealRef} id="how" className="cert-reveal max-w-[1100px] mx-auto px-5 md:px-10 py-[120px]">
        <div>
          <p className="mb-4" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red, letterSpacing: '0.12em' }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, fontFamily: "var(--serif)" }}>
            From video to quiz<br />in three steps
          </h2>
          <p className="mt-4" style={{ color: C.text2, fontSize: '0.975rem', fontWeight: 300, maxWidth: 480, lineHeight: 1.75 }}>
            No setup. No friction. Paste a URL and your quiz is ready before your coffee gets cold.
          </p>
        </div>

        <div className="mt-[60px] grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 relative py-[60px]">
          <StepCard step="01" label="PASTE" title="Drop a YouTube URL" desc="Any video — lectures, tutorials, documentaries, podcasts." glowing={glowNode === '01'}>
            <div className="w-full">
              <div className="flex items-center gap-2 rounded-md p-2.5 mb-3" style={{ background: C.bg, border: `1px solid ${C.border2}` }}>
                <span className="text-base opacity-60 grayscale">🔗</span>
                <span className="flex-1" style={{ fontFamily: "var(--mono)", fontSize: '0.7rem', color: C.text3 }}>youtube.com/watch?v=...</span>
                <span className="w-0.5 h-3 cert-blink-cursor" style={{ background: C.red }} />
              </div>
              <button className="w-full py-2 rounded-md border-none cursor-pointer text-white transition-all hover:opacity-90 hover:-translate-y-px" style={{ background: C.red, fontFamily: "var(--mono)", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                GENERATE QUIZ →
              </button>
            </div>
          </StepCard>

          <StepCard step="02" label="GENERATE" title="AI weaves your quiz" desc="Absorbs context, decodes meaning, builds questions." glowing={glowNode === '02'}>
            <div className="w-full">
              {['Extract transcript', 'Identify concepts', 'Generate questions'].map((item, i) => (
                <div key={item} className="flex items-center gap-2.5 rounded-md p-2 mb-1.5" style={{ background: i === 2 ? C.redDim : C.bg, fontFamily: "var(--mono)", fontSize: '0.7rem', color: i < 2 ? C.text2 : C.text, ...(i === 2 ? { border: `1px solid rgba(225,6,0,0.2)` } : {}) }}>
                  {i < 2 ? <span style={{ color: C.red, fontSize: '0.8rem', flexShrink: 0 }}>✓</span> : <span className="cert-spinner" />}
                  <span>{item}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 rounded-md p-2 mb-1.5" style={{ background: C.redDim, fontFamily: "var(--mono)", fontSize: '0.7rem', color: C.text, border: `1px solid rgba(225,6,0,0.2)` }}>
                <span className="cert-spinner" />
                <span>Finalizing...</span>
              </div>
              <div className="mt-2 h-[3px] rounded-sm overflow-hidden" style={{ background: C.bg2 }}>
                <div className="h-full rounded-sm cert-fill-bar" style={{ width: '75%', background: `linear-gradient(90deg, ${C.red}, #ff6666)` }} />
              </div>
            </div>
          </StepCard>

          <StepCard step="03" label="QUIZ" title="Take & share" desc="Interactive quiz with timestamp links to video moments." glowing={glowNode === '03'}>
            <div className="w-full">
              <div className="rounded-md p-2.5 mb-2.5 text-left" style={{ background: C.bg, fontSize: '0.75rem', color: C.text2, lineHeight: 1.4 }}>
                What is the primary function of mitochondria?
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { letter: 'A', text: 'Store DNA', correct: false },
                  { letter: 'B', text: 'Produce energy', correct: true },
                  { letter: 'C', text: 'Synthesize proteins', correct: false },
                ].map((opt) => (
                  <div key={opt.letter} className="flex items-center gap-2 rounded-[5px] px-2 py-1.5 text-[0.7rem]" style={{ background: opt.correct ? C.redDim : C.bg, border: `1px solid ${opt.correct ? C.red : C.border}`, color: opt.correct ? C.text : C.text3 }}>
                    <span className="w-[18px] h-[18px] rounded-[3px] flex items-center justify-center flex-shrink-0 text-[0.65rem]" style={{ fontFamily: "var(--mono)", background: opt.correct ? C.red : C.bg1, border: `1px solid ${opt.correct ? C.red : C.border}`, color: opt.correct ? '#fff' : 'inherit' }}>
                      {opt.letter}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: C.redDim, border: `1px solid rgba(225,6,0,0.3)`, fontFamily: "var(--mono)", fontSize: '0.7rem', color: C.red, fontWeight: 600 }}>
                ✓ 8/10 CORRECT
              </div>
            </div>
          </StepCard>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={addRevealRef} id="features" className="cert-reveal max-w-[1100px] mx-auto px-5 md:px-10 py-[120px]">
        <div>
          <p className="mb-4" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red, letterSpacing: '0.12em' }}>FEATURES</p>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, fontFamily: "var(--serif)" }}>
            Built for real<br />comprehension
          </h2>
          <p className="mt-4" style={{ color: C.text2, fontSize: '0.975rem', fontWeight: 300, maxWidth: 480, lineHeight: 1.75 }}>
            Every feature designed to help learners actually understand content — not just skim it.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden" style={{ gap: 1, background: C.border, border: `1px solid ${C.border}` }}>
          <div className="md:col-span-2 p-10 transition-colors" style={{ background: C.bg1, borderBottom: `1px solid ${C.border}` }} onMouseEnter={(e) => (e.currentTarget.style.background = C.bg2)} onMouseLeave={(e) => (e.currentTarget.style.background = C.bg1)}>
            <p style={{ fontFamily: "var(--mono)", fontSize: '0.65rem', color: C.text3, letterSpacing: '0.1em', marginBottom: 14 }}>AI-POWERED</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>Context-aware question generation</h3>
            <p style={{ color: C.text2, fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.7 }}>
              Quib doesn't extract random sentences. It understands the subject and builds questions that test deep comprehension.
            </p>
            <div className="mt-6 rounded-[10px] p-[18px_20px] max-w-[500px]" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 14, lineHeight: 1.5 }}>What is the primary function of mitochondria in a cell?</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { key: 'A', text: 'To store genetic information', correct: false },
                  { key: 'B', text: 'To produce energy (ATP)', correct: true },
                  { key: 'C', text: 'To synthesize proteins', correct: false },
                  { key: 'D', text: 'To transport oxygen', correct: false },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2.5 rounded-md px-3 py-[9px] text-[0.8rem]" style={{ background: opt.correct ? C.redDim : C.bg1, border: `1px solid ${opt.correct ? 'rgba(225,6,0,0.3)' : C.border}`, color: opt.correct ? C.text : C.text2 }}>
                    <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[0.65rem]" style={{ fontFamily: "var(--mono)", background: opt.correct ? C.redDim : C.bg, border: `1px solid ${opt.correct ? C.red : C.border}`, color: opt.correct ? C.red : 'inherit' }}>
                      {opt.key}
                    </span>
                    {opt.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {[
            { tag: 'DIFFICULTY CONTROL', title: 'Set the challenge level', desc: 'Easy, Medium, or Hard. The model adjusts question depth and complexity accordingly.' },
            { tag: 'MULTILINGUAL', title: 'Works in any language', desc: 'Generate quizzes from English, Spanish, French, German, Japanese, and dozens more.' },
            { tag: 'SHARE RESULTS', title: 'LinkedIn-ready results', desc: 'Share your quiz scores and achievements directly to LinkedIn with a single click.' },
            { tag: 'ANALYTICS', title: 'Track learner progress', desc: 'See which questions tripped learners up and how scores improve over time.' },
          ].map((f) => (
            <div key={f.tag} className="p-10 transition-colors cursor-default" style={{ background: C.bg1 }} onMouseEnter={(e) => (e.currentTarget.style.background = C.bg2)} onMouseLeave={(e) => (e.currentTarget.style.background = C.bg1)}>
              <p style={{ fontFamily: "var(--mono)", fontSize: '0.65rem', color: C.text3, letterSpacing: '0.1em', marginBottom: 14 }}>{f.tag}</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: C.text2, fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEEP DIVE */}
      <section ref={addRevealRef} className="cert-reveal max-w-[1100px] mx-auto px-5 md:px-10 py-[120px]">
        <div>
          <p className="mb-4" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red, letterSpacing: '0.12em' }}>DEEP DIVE</p>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, fontFamily: "var(--serif)" }}>Under the hood</h2>
        </div>
        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[60px] items-start py-16" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red, letterSpacing: '0.12em' }}>INSTANT TRANSCRIPTION</p>
              <h3 className="my-3" style={{ fontSize: '1.5rem', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.2, fontFamily: "var(--serif)" }}>Full transcript in seconds, not minutes</h3>
              <p className="mb-6" style={{ color: C.text2, fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.75 }}>
                Quib extracts and analyzes the complete transcript — whether it's a 5-minute tutorial or a 3-hour lecture — and identifies the most meaningful content to test on.
              </p>
              <ul className="flex flex-col gap-2.5 list-none">
                {['Speaker-labelled transcript with timestamps', 'Works with auto-generated and manual captions', 'Chapters detected automatically', 'Downloadable as plain text or JSON'].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[0.875rem] font-[300]" style={{ color: C.text2 }}>
                    <span className="w-1 h-1 rounded-full mt-[9px] flex-shrink-0" style={{ background: C.red }} />{b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[14px] overflow-hidden" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-1.5 px-3.5 py-2.5" style={{ background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: '#febc2e' }} />
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: '#28c840' }} />
                <span className="ml-1.5" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.text3 }}>transcript.txt</span>
              </div>
              <div className="p-5">
                {[
                  { who: 'Speaker 1', say: 'The cell membrane is selectively permeable, allowing certain molecules to pass while blocking others.', ts: '02:14' },
                  { who: 'Speaker 1', say: 'This property is essential for maintaining homeostasis within the cell environment.', ts: '02:22' },
                  { who: 'Speaker 2', say: 'So osmosis is water moving across this membrane from low to high solute concentration?', ts: '02:38' },
                  { who: 'Speaker 1', say: 'Exactly. That process is passive — it requires no energy input from the cell itself.', ts: '02:51' },
                ].map((line, i) => (
                  <div key={i} className="flex gap-2.5 py-2.5 text-[0.82rem]" style={{ borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                    <span className="flex-shrink-0 pt-0.5 min-w-[72px]" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red }}>{line.who}</span>
                    <span className="font-[300] leading-[1.55]" style={{ color: C.text2 }}>{line.say}</span>
                    <span className="flex-shrink-0 pt-0.5 ml-auto" style={{ fontFamily: "var(--mono)", fontSize: '0.65rem', color: C.text3 }}>{line.ts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[60px] items-start py-16">
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red, letterSpacing: '0.12em' }}>DEVELOPER API</p>
              <h3 className="my-3" style={{ fontSize: '1.5rem', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.2, fontFamily: "var(--serif)" }}>Embed quizzes into your platform</h3>
              <p className="mb-6" style={{ color: C.text2, fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.75 }}>
                Use the Quib API to add quiz generation directly to your learning platform, browser extension, or app. Structured quiz data with a single POST request.
              </p>
              <ul className="flex flex-col gap-2.5 list-none">
                {['RESTful JSON API with full documentation', 'Webhook support for async generation', 'Customizable question count and types', 'SDKs for JavaScript, Python, and more'].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[0.875rem] font-[300]" style={{ color: C.text2 }}>
                    <span className="w-1 h-1 rounded-full mt-[9px] flex-shrink-0" style={{ background: C.red }} />{b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[14px] overflow-hidden" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-1.5 px-3.5 py-2.5" style={{ background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: '#febc2e' }} />
                <span className="w-[9px] h-[9px] rounded-full" style={{ background: '#28c840' }} />
                <span className="ml-1.5" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.text3 }}>Quib API</span>
              </div>
              <div className="p-5">
                <div className="rounded-lg p-4" style={{ background: C.bg, border: `1px solid ${C.border}`, fontFamily: "var(--mono)", fontSize: '0.78rem', lineHeight: 1.85 }}>
                  {[
                    { n: '1', parts: [{ t: 'curl', c: C.red }, { t: ' -X POST \\', c: '#e8c96a' }] },
                    { n: '2', parts: [{ t: '  https://api.quib.ai/v1/quiz \\', c: C.text }] },
                    { n: '3', parts: [{ t: '  -H ', c: '#e8c96a' }, { t: '"Authorization: Bearer <key>" \\', c: C.text3 }] },
                    { n: '4', parts: [{ t: '  -d ', c: '#e8c96a' }, { t: "'{", c: C.text3 }] },
                    { n: '5', parts: [{ t: '    "url"', c: '#a78bfa' }, { t: ': ', c: C.text }, { t: '"youtube.com/watch?v=...",', c: C.text3 }] },
                    { n: '6', parts: [{ t: '    "questions"', c: '#a78bfa' }, { t: ': ', c: C.text }, { t: '10', c: C.red }, { t: ',', c: C.text }] },
                    { n: '7', parts: [{ t: '    "difficulty"', c: '#a78bfa' }, { t: ': ', c: C.text }, { t: '"medium"', c: C.text3 }] },
                    { n: '8', parts: [{ t: "  '}'", c: C.text3 }] },
                  ].map((line) => (
                    <div key={line.n} className="flex gap-3.5">
                      <span className="select-none min-w-[14px]" style={{ color: C.text3 }}>{line.n}</span>
                      <span>{line.parts.map((p, i) => <span key={i} style={{ color: p.c }}>{p.t}</span>)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section ref={addRevealRef} className="cert-reveal max-w-[1100px] mx-auto px-5 md:px-10 py-[120px]" style={{ borderTop: `1px solid ${C.border}` }}>
        <div>
          <p className="mb-4" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red, letterSpacing: '0.12em' }}>TESTIMONIALS</p>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1, fontFamily: "var(--serif)" }}>
            Trusted by learners<br />&amp; educators
          </h2>
          <p className="mt-4" style={{ color: C.text2, fontSize: '0.975rem', fontWeight: 300, maxWidth: 400, lineHeight: 1.75 }}>
            Thousands of students and teachers use Quib every week to get more out of video content.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          {[
            { quote: '"I assigned a 45-minute lecture and had a full quiz ready in two minutes. My students said it was the most engaged they\'d been with video content all semester."', initials: 'SK', name: 'Sarah K.', role: 'High School Biology Teacher' },
            { quote: '"I quiz myself after every YouTube coding tutorial. The timestamp links are a game-changer — I can jump back to exactly where I missed something."', initials: 'MR', name: 'Marcus R.', role: 'Self-taught Developer' },
            { quote: '"We integrated Quib\'s API into our edtech platform in a weekend. Clean docs, fast responses, and the question quality is genuinely impressive."', initials: 'AL', name: 'Ana L.', role: 'CTO, EduStart Platform' },
          ].map((t) => (
            <div key={t.initials} className="flex flex-col p-8 rounded-[14px] transition-all" style={{ background: C.bg1, border: `1px solid ${C.border}` }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.background = C.bg2; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg1; }}>
              <div className="text-[0.68rem] tracking-[3px] mb-4" style={{ color: C.red }}>★★★★★</div>
              <p className="flex-1 mb-6 text-[0.875rem] font-[300] leading-[1.75]" style={{ color: C.text2 }}>{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[0.75rem] font-[700] flex-shrink-0" style={{ background: C.redDim, border: `1px solid rgba(225,6,0,0.2)`, color: C.red }}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-[0.875rem] font-[600]">{t.name}</div>
                  <div className="text-[0.78rem] mt-px" style={{ color: C.text3 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={addRevealRef} className="cert-reveal py-[140px] px-5 md:px-10 text-center relative overflow-hidden">
        <div className="absolute pointer-events-none" style={{ bottom: -100, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: `radial-gradient(ellipse at center, rgba(225,6,0,0.07) 0%, transparent 65%)` }} />
        <p className="mb-4" style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.red, letterSpacing: '0.12em' }}>GET STARTED</p>
        <h2 className="mx-auto mb-5" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05, maxWidth: 700, fontFamily: "var(--serif)" }}>
          Start learning more<br />from every video
        </h2>
        <p className="mx-auto mb-12" style={{ color: C.text2, fontSize: '0.975rem', fontWeight: 300, maxWidth: 380, lineHeight: 1.75 }}>
          No sign-up needed. Paste a URL and your quiz is ready in under 30 seconds.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/signin" className="no-underline px-8 py-3.5 rounded-lg text-[0.9rem] font-[600] text-white transition-all hover:opacity-90 hover:-translate-y-0.5" style={{ background: C.red }}>
            Try for free
          </Link>
          <Link to="/educators" className="no-underline px-7 py-3.5 rounded-lg text-[0.9rem] font-[400] transition-all hover:-translate-y-0.5" style={{ color: C.text2, border: `1px solid ${C.border}` }}>
            View documentation
          </Link>
        </div>
        <p className="mt-5" style={{ fontSize: '0.72rem', color: C.text3, fontFamily: "var(--mono)", letterSpacing: '0.06em' }}>
          Free tier · No credit card required
        </p>
      </section>

      {/* FOOTER */}
      <footer className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 px-5 md:px-10 py-12" style={{ borderTop: `1px solid ${C.border}` }}>
        <div>
          <Link to="/" className="flex items-center gap-1.5 no-underline mb-2.5" style={{ color: C.text, fontSize: '1rem' }}>
            <span className="font-[700] tracking-tight">Quib</span>
          </Link>
          <p className="text-[0.82rem] font-[300] leading-[1.65] max-w-[240px]" style={{ color: C.text3 }}>
            AI-powered quiz generation from YouTube videos. Built for educators, students, and curious minds.
          </p>
        </div>
        {[
          { title: 'PRODUCT', links: ['Features', 'API Docs', 'Changelog'] },
          { title: 'COMPANY', links: ['About', 'Blog', 'Careers', 'Contact'] },
          { title: 'LEGAL', links: ['Privacy', 'Terms', 'Cookies'] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-4" style={{ fontFamily: "var(--mono)", fontSize: '0.65rem', letterSpacing: '0.12em', color: C.text3 }}>{col.title}</h4>
            <ul className="list-none flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[0.85rem] font-[300] no-underline transition-opacity hover:opacity-100" style={{ color: C.text2, opacity: 0.75 }}>{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-1.5 max-w-[1100px] mx-auto px-5 md:px-10 py-5" style={{ borderTop: `1px solid ${C.border}` }}>
        <p className="text-[0.78rem] font-[300]" style={{ color: C.text3 }}>© 2026 Quib AI. All rights reserved.</p>
        <span style={{ fontFamily: "var(--mono)", fontSize: '0.68rem', color: C.text3 }}>// built for learning</span>
      </div>

      <style>{`
        @keyframes certFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .cert-fade-up { animation: certFadeUp 0.7s ease both; }
        .cert-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .cert-reveal.cert-in { opacity: 1; transform: translateY(0); }
        @keyframes certBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .cert-blink { animation: certBlink 2s ease-in-out infinite; }
        @keyframes certBlinkCursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cert-blink-cursor { animation: certBlinkCursor 0.9s step-end infinite; }
        @keyframes certTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .cert-ticker { animation: certTicker 32s linear infinite; }
        .cert-ticker:hover { animation-play-state: paused; }
        @keyframes certSpin { to { transform: rotate(360deg); } }
        .cert-spinner { width: 10px; height: 10px; border: 2px solid rgba(0,0,0,0.12); border-top-color: #E10600; border-radius: 50%; animation: certSpin 0.8s linear infinite; flex-shrink: 0; }
        @keyframes certFillBar { 0%, 100% { width: 75%; } 50% { width: 85%; } }
        .cert-fill-bar { animation: certFillBar 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}