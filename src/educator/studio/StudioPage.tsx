import { useRequireStudioV2 } from '../../hooks/useRequireStudioV2';

/** Route placeholder. PR-03 replaces this with the studio layout. */
export function StudioPage() {
  useRequireStudioV2();

  return (
    <h1 className="text-[20px] font-bold tracking-[-0.015em] text-[var(--ink)]">
      Cubit Studio
    </h1>
  );
}
