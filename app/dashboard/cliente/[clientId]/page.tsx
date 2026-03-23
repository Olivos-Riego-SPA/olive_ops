import CampoList from './components/campo-list';

export default async function ClientePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <CampoList clientId={clientId} />;
}
