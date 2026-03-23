import FichaCampoPrint from './components/ficha-campo-print';

export default async function ImprimirCampoPage({
  params,
}: {
  params: Promise<{ clientId: string; campoId: string }>;
}) {
  const { clientId, campoId } = await params;
  return <FichaCampoPrint clientId={clientId} campoId={campoId} />;
}
