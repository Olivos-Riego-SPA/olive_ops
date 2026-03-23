import CampoDetalle from './components/campo-detalle';

export default async function CampoDetallePage({
  params,
}: {
  params: Promise<{ clientId: string; campoId: string }>;
}) {
  const { clientId, campoId } = await params;
  return <CampoDetalle clientId={clientId} campoId={campoId} />;
}
