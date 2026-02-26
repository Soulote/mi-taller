import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard, StatusPill } from "@/components/ui";
import { listTrabajosPopulated, type TrabajoPopulated } from "@/lib/trabajosRepository";

export default function HistorialPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<TrabajoPopulated[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    const loadTrabajos = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const trabajos = await listTrabajosPopulated();
        if (active) {
          setTodos(trabajos);
        }
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudieron cargar los trabajos.";
        setLoadError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTrabajos();

    return () => {
      active = false;
    };
  }, []);

  const entregados = useMemo(() => {
    return todos.filter((trabajo) => {
      if (trabajo.estado !== "entregado") return false;

      if (!search) return true;

      const query = search.toLowerCase();
      return (
        trabajo.cliente.nombre.toLowerCase().includes(query) ||
        trabajo.cliente.telefono.includes(query) ||
        trabajo.equipo.tipo.toLowerCase().includes(query) ||
        trabajo.equipo.marcaModelo.toLowerCase().includes(query) ||
        trabajo.problema.toLowerCase().includes(query)
      );
    });
  }, [todos, search]);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pb-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 -ml-2 text-muted hover:text-text rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold">Historial</h2>
        </div>

        <input
          type="search"
          placeholder="Buscar entregados..."
          className="px-4 py-2 bg-card border border-cardBorder rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 w-full sm:w-64 shadow-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted">Cargando historial...</div>
        ) : loadError ? (
          <div className="col-span-full py-12 text-center text-red-500">{loadError}</div>
        ) : entregados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted">No hay trabajos entregados.</div>
        ) : (
          entregados.map((trabajo) => (
            <GlassCard
              key={trabajo.id}
              onClick={() => navigate(`/trabajos/${trabajo.id}`)}
              className="flex flex-col gap-3 group h-full"
            >
              <div className="flex justify-between items-start gap-2">
                <StatusPill status={trabajo.estado} />
                <span className="text-xs text-muted whitespace-nowrap font-medium">
                  {new Date(trabajo.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-lg leading-tight mb-0.5">{trabajo.cliente.nombre}</h3>
                <p className="text-sm text-muted">{trabajo.cliente.telefono}</p>
              </div>

              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm mt-auto">
                <p className="font-medium text-text mb-1">
                  {trabajo.equipo.tipo} · {trabajo.equipo.marcaModelo}
                </p>
                <p className="text-muted line-clamp-2">{trabajo.problema}</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
