type Props = {
  label: string;
  accent: string;
  isDark: boolean;
};

export function StudyToolHeading({ label, accent, isDark }: Props) {
  return (
    <span
      className="study-tool-heading inline-block rounded-md px-2.5 py-1 text-[0.95rem] font-[600]"
      style={{
        color: accent,
        background: isDark ? 'rgba(225,6,0,0.12)' : '#f8e7eb',
      }}
    >
      {label}
    </span>
  );
}
