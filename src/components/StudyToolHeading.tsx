type Props = {
  label: string;
};

/** Same accent chip as the signed-in shell. Requires a `.cuib-app` ancestor. */
export function StudyToolHeading({ label }: Props) {
  return (
    <span className="study-tool-heading inline-flex h-8 items-center rounded-md bg-[var(--accent-soft)] px-2.5 text-[15px] font-semibold text-[var(--accent)]">
      {label}
    </span>
  );
}
