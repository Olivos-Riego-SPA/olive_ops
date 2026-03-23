import FichaClientePrint from './components/ficha-cliente-print';

export default async function ImprimirClientePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <FichaClientePrint clientId={clientId} />;
}
