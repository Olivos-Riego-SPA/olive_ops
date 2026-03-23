import ClientHealthList from './components/client-health-list';

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-surface p-6 pb-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="font-display text-label-lg uppercase tracking-label text-secondary mb-2">
            Paso 1
          </p>
          <h1 className="font-display text-display-md font-semibold text-on-surface leading-tight tracking-display">
            Estado de<br />
            <span className="text-secondary italic">Clientes</span>
          </h1>

          {/* Indicador de pasos */}
          <div className="flex gap-2 mt-4 mb-3">
            <span className="h-1 w-16 rounded-full bg-secondary" />
            <span className="h-1 w-16 rounded-full bg-surface-container-highest" />
            <span className="h-1 w-16 rounded-full bg-surface-container-highest" />
          </div>

          <p className="font-display text-body-md text-on-surface-variant">
            Seleccione un cliente de la lista o use el buscador
          </p>
        </div>

        {/* Listado de salud de clientes */}
        <ClientHealthList />
      </div>
    </main>
  );
}
