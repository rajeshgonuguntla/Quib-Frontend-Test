import { useId, type SVGProps, type ReactElement } from 'react';

type SvgProps = SVGProps<SVGSVGElement>;

function ThumbShell({ children, className, ...props }: SvgProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `bg-${uid}`;
  const glowId = `glow-${uid}`;

  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0a0a0a" />
          <stop offset="1" stopColor="#171717" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill={`url(#${bgId})`} />
      {typeof children === 'function' ? children(glowId) : children}
    </svg>
  );
}

export function LinearAlgebraThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <g opacity="0.35">
        {Array.from({ length: 6 }).map((_, i) =>
          Array.from({ length: 10 }).map((__, j) => (
            <circle key={`${i}-${j}`} cx={20 + j * 30} cy={20 + i * 28} r="1.2" fill="#818cf8" />
          )),
        )}
      </g>
      <path d="M40 130 L120 50 L200 110 L280 40" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M80 140 L160 70 L240 130" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.8" />
      <rect x="118" y="78" width="84" height="52" rx="6" stroke="#6366f1" strokeWidth="1.5" fill="rgba(99,102,241,0.12)" />
      <path d="M132 98 H188 M132 110 H176 M132 122 H164" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <circle cx="120" cy="50" r="5" fill="#818cf8" />
      <circle cx="200" cy="110" r="5" fill="#6366f1" />
      <circle cx="280" cy="40" r="5" fill="#4f46e5" />
    </ThumbShell>
  );
}

export function WebDevThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <rect x="48" y="28" width="224" height="132" rx="10" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)" />
      <rect x="48" y="28" width="224" height="22" rx="10" fill="rgba(34,197,94,0.15)" />
      <circle cx="62" cy="39" r="3" fill="#ef4444" opacity="0.8" />
      <circle cx="74" cy="39" r="3" fill="#eab308" opacity="0.8" />
      <circle cx="86" cy="39" r="3" fill="#22c55e" opacity="0.8" />
      <rect x="68" y="68" width="72" height="48" rx="4" fill="rgba(34,197,94,0.2)" />
      <rect x="152" y="68" width="96" height="10" rx="2" fill="rgba(134,239,172,0.5)" />
      <rect x="152" y="86" width="80" height="8" rx="2" fill="rgba(134,239,172,0.35)" />
      <rect x="152" y="102" width="64" height="8" rx="2" fill="rgba(134,239,172,0.25)" />
      <rect x="68" y="128" width="180" height="18" rx="4" fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth="1" />
      <path d="M78 137 H110" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
    </ThumbShell>
  );
}

export function MachineLearningThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      {[
        [160, 40], [90, 80], [230, 80], [60, 130], [160, 130], [260, 130],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="14" fill="rgba(225,6,0,0.15)" stroke="#e10600" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="4" fill="#fb7185" />
        </g>
      ))}
      <path d="M160 54 L90 66 M160 54 L230 66 M90 94 L60 116 M90 94 L160 116 M230 94 L160 116 M230 94 L260 116" stroke="#e10600" strokeWidth="1.2" opacity="0.55" />
      <rect x="118" y="150" width="84" height="16" rx="8" fill="rgba(225,6,0,0.2)" />
      <path d="M128 158 H192" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </ThumbShell>
  );
}

export function TypeScriptThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <rect x="56" y="36" width="208" height="108" rx="8" fill="rgba(37,99,235,0.1)" stroke="#2563eb" strokeWidth="1.5" />
      <text x="72" y="68" fill="#60a5fa" fontFamily="ui-monospace, monospace" fontSize="14" fontWeight="600">
        {'interface Course {'}
      </text>
      <text x="88" y="92" fill="#93c5fd" fontFamily="ui-monospace, monospace" fontSize="12">
        title: string;
      </text>
      <text x="88" y="112" fill="#93c5fd" fontFamily="ui-monospace, monospace" fontSize="12">
        modules: Module[];
      </text>
      <text x="72" y="132" fill="#60a5fa" fontFamily="ui-monospace, monospace" fontSize="14" fontWeight="600">
        {'}'}
      </text>
      <rect x="220" y="44" width="32" height="32" rx="4" fill="#2563eb" />
      <text x="228" y="66" fill="white" fontFamily="ui-monospace, monospace" fontSize="16" fontWeight="700">
        TS
      </text>
    </ThumbShell>
  );
}

export function PythonThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <path
        d="M100 60 C100 44 112 36 128 36 H192 C208 36 220 44 220 60 V78 H192 V60 H128 V96 H220 V116 C220 132 208 140 192 140 H128 C112 140 100 132 100 116 V98 H128 V116 H192 V78 H100 V60 Z"
        fill="rgba(234,179,8,0.15)"
        stroke="#eab308"
        strokeWidth="1.5"
      />
      <circle cx="128" cy="48" r="5" fill="#fde047" />
      <circle cx="192" cy="128" r="5" fill="#3b82f6" />
      <path d="M140 150 H180" stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </ThumbShell>
  );
}

export function ReactThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <ellipse cx="160" cy="90" rx="70" ry="24" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.7" />
      <ellipse cx="160" cy="90" rx="70" ry="24" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.7" transform="rotate(60 160 90)" />
      <ellipse cx="160" cy="90" rx="70" ry="24" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.7" transform="rotate(120 160 90)" />
      <circle cx="160" cy="90" r="10" fill="rgba(6,182,212,0.25)" stroke="#22d3ee" strokeWidth="1.5" />
      <circle cx="160" cy="90" r="3" fill="#67e8f9" />
    </ThumbShell>
  );
}

export function JavaScriptThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <rect x="72" y="40" width="176" height="100" rx="8" fill="rgba(234,179,8,0.08)" stroke="#ca8a04" strokeWidth="1.5" />
      <text x="92" y="78" fill="#fde047" fontFamily="ui-monospace, monospace" fontSize="13">
        const quiz =
      </text>
      <text x="92" y="102" fill="#fef08a" fontFamily="ui-monospace, monospace" fontSize="13">
        {'await gen()'}
      </text>
      <rect x="220" y="48" width="20" height="20" rx="2" fill="#eab308" />
      <text x="225" y="63" fill="#171717" fontFamily="ui-monospace, monospace" fontSize="11" fontWeight="700">
        JS
      </text>
    </ThumbShell>
  );
}

export function NeuralNetworksThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <rect x="40" y="30" width="240" height="120" rx="10" fill="rgba(225,6,0,0.06)" stroke="rgba(225,6,0,0.35)" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((layer) => (
        <g key={layer}>
          {[0, 1, 2].map((node) => (
            <circle
              key={node}
              cx={80 + layer * 55}
              cy={65 + node * 28}
              r="8"
              fill="rgba(225,6,0,0.2)"
              stroke="#e10600"
              strokeWidth="1.2"
            />
          ))}
        </g>
      ))}
      <path d="M88 65 L125 79 M88 93 L125 79 M125 79 L170 65 M125 79 L170 93 M170 65 L207 79 M170 93 L207 79" stroke="#fb7185" strokeWidth="1" opacity="0.6" />
    </ThumbShell>
  );
}

export function QuizThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <rect x="56" y="32" width="208" height="116" rx="8" stroke="#e10600" strokeWidth="1.5" fill="rgba(225,6,0,0.08)" />
      <text x="72" y="58" fill="#fecaca" fontFamily="ui-monospace, monospace" fontSize="11">
        Q. What is backprop?
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="72" y={68 + i * 22} width="176" height="16" rx="4" fill={i === 1 ? 'rgba(225,6,0,0.25)' : 'rgba(255,255,255,0.04)'} stroke={i === 1 ? '#e10600' : 'rgba(255,255,255,0.1)'} />
          <text x="82" y={80 + i * 22} fill="#fca5a5" fontFamily="ui-monospace, monospace" fontSize="9">
            {['A. Random guess', 'B. Gradient flow', 'C. Data shuffle'][i]}
          </text>
        </g>
      ))}
    </ThumbShell>
  );
}

export function CourseCatalogThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={48 + i * 12}
          y={36 + i * 8}
          width="200"
          height="108"
          rx="8"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      ))}
      <rect x="72" y="52" width="56" height="36" rx="4" fill="rgba(99,102,241,0.25)" />
      <rect x="140" y="58" width="88" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="140" y="74" width="72" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="140" y="88" width="64" height="6" rx="2" fill="rgba(255,255,255,0.08)" />
    </ThumbShell>
  );
}

export function StudioThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <rect x="44" y="34" width="232" height="112" rx="10" stroke="#ededed" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" />
      <rect x="44" y="34" width="232" height="24" rx="10" fill="rgba(255,255,255,0.06)" />
      <rect x="60" y="72" width="64" height="40" rx="4" fill="rgba(225,6,0,0.2)" stroke="#e10600" strokeWidth="1" />
      <rect x="132" y="72" width="64" height="40" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="204" y="72" width="56" height="40" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M76 128 H244" stroke="#e10600" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </ThumbShell>
  );
}

export function LectureThumb(props: SvgProps) {
  return (
    <ThumbShell {...props}>
      <rect x="48" y="36" width="224" height="108" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" />
      <circle cx="160" cy="82" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <path d="M152 74 L152 96 L172 85 Z" fill="#ededed" />
      <rect x="72" y="128" width="120" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
      <rect x="72" y="128" width="48" height="6" rx="3" fill="#e10600" opacity="0.8" />
    </ThumbShell>
  );
}

export type LandingThumbTopic =
  | 'linear-algebra'
  | 'web-dev'
  | 'machine-learning'
  | 'typescript'
  | 'python'
  | 'react'
  | 'javascript'
  | 'neural-networks'
  | 'quiz'
  | 'course-catalog'
  | 'studio'
  | 'lecture';

export const LANDING_THUMB_COMPONENTS: Record<
  LandingThumbTopic,
  (props: SvgProps) => ReactElement
> = {
  'linear-algebra': LinearAlgebraThumb,
  'web-dev': WebDevThumb,
  'machine-learning': MachineLearningThumb,
  typescript: TypeScriptThumb,
  python: PythonThumb,
  react: ReactThumb,
  javascript: JavaScriptThumb,
  'neural-networks': NeuralNetworksThumb,
  quiz: QuizThumb,
  'course-catalog': CourseCatalogThumb,
  studio: StudioThumb,
  lecture: LectureThumb,
};

export const LANDING_COURSE_THUMBNAILS = [
  { title: 'Linear Algebra', topic: 'linear-algebra' as const, modules: 12 },
  { title: 'Web Dev', topic: 'web-dev' as const, modules: 10 },
  { title: 'Machine Learning', topic: 'machine-learning' as const, modules: 14 },
  { title: 'TypeScript', topic: 'typescript' as const, modules: 8 },
] as const;

export const LANDING_STUDIO_TOPICS: LandingThumbTopic[] = [
  'python',
  'react',
  'machine-learning',
  'javascript',
  'linear-algebra',
  'web-dev',
];

export const LANDING_CTA_TOPICS: Record<string, LandingThumbTopic> = {
  quiz: 'quiz',
  course: 'course-catalog',
  video: 'lecture',
  studio: 'studio',
};
