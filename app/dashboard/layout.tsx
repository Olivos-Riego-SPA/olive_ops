import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import TopBar from './components/top-bar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.user) redirect('/');

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopBar userName={session.user.name} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
