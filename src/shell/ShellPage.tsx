import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';

type ShellPageProps = {
  label?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

/** Page chrome for routes inside AppShell — title block only (sidebar/topbar from shell). */
export function ShellPage({ label, title, description, actions, children }: ShellPageProps) {
  return (
    <div>
      <PageHeader label={label} title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
