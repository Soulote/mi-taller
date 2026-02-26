import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FloatingActionButton,
  GlassCard,
  JobStatus,
  PrimaryButton,
  StatusPill,
  ToastBanner,
} from "@/components/ui";
import {
  listTrabajosPopulated,
  type TrabajoPopulated,
  updateTrabajo,
} from "@/lib/trabajosRepository";

const TABS: { label: string; value: JobStatus | "todos" }[] = [
  { label: "Pendiente", value: "pendiente" },
  { label: "En curso", value: "en_curso" },
  { label: "Listo", value: "listo" },
];

const NEXT_STATUS: Partial<Record<JobStatus, JobStatus>> = {
  pendiente: "en_curso",
  en_curso: "listo",
  listo: "entregado",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<TrabajoPopulated[]>([]);
  const [activeTab, setActiveTab] = useState<JobStatus | "todos">("en_curso");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tabInitialized, setTabInitialized] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

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

  useEffect(() => {
    if (tabInitialized || loading) return;
    setActiveTab(todos.some((trabajo) => trabajo.estado === "listo") ? "listo" : "en_curso");
    setTabInitialized(true);
  }, [loading, tabInitialized, todos]);

  const filtered = useMemo(() => {
    return todos.filter((trabajo) => {
      if (trabajo.estado === "entregado" && activeTab !== "todos") return false;
      if (activeTab !== "todos" && trabajo.estado !== activeTab && !search) return false;

      if (!search) return true;

      if (trabajo.estado === "entregado") return false;
      const query = search.toLowerCase();
      return (
        trabajo.cliente.nombre.toLowerCase().includes(query) ||
        trabajo.cliente.telefono.includes(query) ||
        trabajo.equipo.tipo.toLowerCase().includes(query) ||
        trabajo.equipo.marcaModelo.toLowerCase().includes(query) ||
        trabajo.problema.toLowerCase().includes(query)
      );
    });
  }, [todos, activeTab, search]);

  const getDaysAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  const handleAdvanceStatus = async (trabajo: TrabajoPopulated) => {
    const nextStatus = NEXT_STATUS[trabajo.estado];
    if (!nextStatus) return;

    if (nextStatus === "en_curso" && !trabajo.queFalta.trim()) {
      setToast({ type: "error", message: "Defini \"Que falta\" antes de pasarlo a En curso." });
      return;
    }

    setSavingId(trabajo.id);

    try {
      await updateTrabajo(trabajo.id, { estado: nextStatus });
      const refreshed = await listTrabajosPopulated();
      setTodos(refreshed);
      setToast({ type: "success", message: `Estado cambiado a ${nextStatus.replace("_", " ")}.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar el estado.";
      setToast({ type: "error", message });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pb-24 md:pb-8 flex flex-col gap-6">
      {toast && <ToastBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <h2 className="text-2xl font-bold">Tablero</h2>
          <button
            onClick={() => navigate("/historial")}
            className="sm:hidden text-sm font-medium text-muted hover:text-text px-2"
          >
            Historial
          </button>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Buscar..."
            className="px-4 py-2 bg-card border border-cardBorder rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 w-full sm:w-64 shadow-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            onClick={() => navigate("/historial")}
            className="hidden sm:block text-sm font-medium text-muted hover:text-text whitespace-nowrap px-2"
          >
            Historial
          </button>
          <PrimaryButton
            className="hidden md:block !w-auto !py-2 !px-4 whitespace-nowrap"
            onClick={() => navigate("/trabajos/nuevo")}
          >
            + Nuevo
          </PrimaryButton>
        </div>
      </div>

      {!search && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as JobStatus)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeTab === tab.value
                  ? "bg-gray-900 text-white border-transparent shadow-md dark:bg-white dark:text-gray-900"
                  : "bg-card text-muted border-cardBorder hover:text-text hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted">Cargando trabajos...</div>
        ) : loadError ? (
          <div className="col-span-full py-12 text-center text-red-500">{loadError}</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted">No se encontraron trabajos.</div>
        ) : (
          filtered.map((trabajo) => {
            const daysAgo = getDaysAgo(trabajo.updatedAt);
            const warningListo = trabajo.estado === "listo" && daysAgo >= 3;
            const canAdvance = Boolean(NEXT_STATUS[trabajo.estado]);

            return (
              <GlassCard
                key={trabajo.id}
                onClick={() => navigate(`/trabajos/${trabajo.id}`)}
                className="flex flex-col gap-3 group h-full"
              >
                <div className="flex justify-between items-start gap-2">
                  <StatusPill status={trabajo.estado} />
                  <span className="text-xs text-muted whitespace-nowrap font-medium">Hace {daysAgo} d</span>
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

                <div className="mt-1 flex flex-col gap-2">
                  <p className="text-sm">
                    <span className="font-medium text-muted">Falta: </span>
                    <span className={trabajo.queFalta ? "text-text" : "text-muted italic"}>
                      {trabajo.queFalta || "Sin definir"}
                    </span>
                  </p>

                  {warningListo && (
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded w-fit">
                      Listo hace {daysAgo} dias
                    </p>
                  )}

                  {canAdvance && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleAdvanceStatus(trabajo);
                      }}
                      disabled={savingId === trabajo.id}
                      className="mt-1 px-3 py-2 rounded-lg border border-cardBorder bg-card text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
                    >
                      {savingId === trabajo.id ? "Actualizando..." : "Pasar al siguiente estado"}
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      <FloatingActionButton
        onClick={() => navigate("/trabajos/nuevo")}
        icon={
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        }
      />
    </div>
  );
}
