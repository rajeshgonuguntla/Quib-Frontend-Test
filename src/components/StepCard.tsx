import { ReactNode } from 'react';
import { useTheme, getC } from './ThemeContext';

interface StepCardProps {
  step: string;
  label: string;
  title: string;
  desc: string;
  glowing: boolean;
  children?: ReactNode;
}

export function StepCard({ step, label, title, desc, glowing, children }: StepCardProps) {
  const { isDark } = useTheme();
  const C = getC(isDark);

  return (
    <div
      className="flex flex-col items-start px-8 py-6 relative"
      style={{
        borderLeft: `1px solid ${C.border}`,
      }}
    >
      {/* Step node */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center mb-6 transition-all duration-700"
        style={{
          background: glowing ? C.red : C.bg2,
          border: `1px solid ${glowing ? C.red : C.border2}`,
          boxShadow: glowing ? `0 0 0 6px ${C.redDim}, 0 0 20px ${C.redGlow}` : 'none',
        }}
      >
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: '0.75rem',
            fontWeight: 400,
            letterSpacing: '0.04em',
            color: glowing ? '#fff' : C.text3,
          }}
        >
          {step}
        </span>
      </div>

      {/* Label */}
      <p
        className="mb-2"
        style={{
          fontFamily: "var(--mono)",
          fontSize: '0.62rem',
          letterSpacing: '0.14em',
          color: glowing ? C.red : C.text3,
          transition: 'color 0.5s ease',
        }}
      >
        {label}
      </p>

      {/* Title */}
      <h3
        className="mb-2"
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
          color: C.text,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="mb-6"
        style={{
          fontSize: '0.85rem',
          fontWeight: 300,
          lineHeight: 1.7,
          color: C.text2,
        }}
      >
        {desc}
      </p>

      {/* Children (demo content) */}
      <div className="w-full mt-auto">{children}</div>
    </div>
  );
}
