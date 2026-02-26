import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ActionPillButton,
  FloatingActionButton,
  GlassCard,
  JobStatus,
  PrimaryButton,
  StatusChip,
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
  const [searchParams] = useSearchParams();
  const [todos, setTodos] = useState<TrabajoPopulated[]>([]);
  const [activeTab, setActiveTab] = useState<JobStatus | "todos">("en_curso");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tabInitialized, setTabInitialized] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const estadoParam = searchParams.get("estado");
  const sortParam = searchParams.get("sort");

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
    if (loading) return;

    if (sortParam === "antiguedad_desc" && !estadoParam) {
      setActiveTab("todos");
      setTabInitialized(true);
      return;
    }

    if (estadoParam === "activos") {
      setActiveTab("todos");
      setTabInitialized(true);
      return;
    }

    if (estadoParam === "pendiente" || estadoParam === "en_curso" || estadoParam === "listo") {
      setActiveTab(estadoParam);
      setTabInitialized(true);
      return;
    }

    if (tabInitialized) return;

    setActiveTab(todos.some((trabajo) => trabajo.estado === "listo") ? "listo" : "en_curso");
    setTabInitialized(true);
  }, [estadoParam, loading, sortParam, tabInitialized, todos]);

  const filtered = useMemo(() => {
    return todos.filter((trabajo) => {
      if (trabajo.estado === "entregado") return false;
      if (activeTab !== "todos" && trabajo.estado !== activeTab) return false;

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
  }, [todos, activeTab, search]);

  const getDaysAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  const displayed = useMemo(() => {
    const rows = [...filtered];

    if (sortParam === "antiguedad_desc") {
      rows.sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();

        if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0;
        if (Number.isNaN(leftTime)) return 1;
        if (Number.isNaN(rightTime)) return -1;

        return leftTime - rightTime;
      });
    }

    return rows;
  }, [filtered, sortParam]);

  const handleAdvanceStatus = async (trabajo: TrabajoPopulated) => {
    const nextStatus = NEXT_STATUS[trabajo.estado];
    if (!nextStatus) return;

    if (nextStatus === "en_curso" && !trabajo.queFalta.trim()) {
      setToast({ type: "error", message: "Defini \"Que falta\" antes de pasarlo a En curso." });
      return;
    }

    setSavingId(trabajo.id);

    try {
      await updateTrabajo(trabajo.id, {
        estado: nextStatus,
        fechaEntrega: nextStatus === "entregado" ? (trabajo.fechaEntrega ?? new Date().toISOString()) : trabajo.fechaEntrega,
      });
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
    <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pb-24 md:pb-8 flex flex-col gap-5 md:gap-6">
      {toast && <ToastBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-3.5 md:gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[1.65rem] leading-tight font-semibold tracking-tight">Tablero</h2>
          <button
            onClick={() => navigate("/historial")}
            className="ui-interactive sm:hidden px-3 py-1.5 rounded-full border border-cardBorder bg-card text-xs font-semibold text-muted hover:text-text"
          >
            Historial
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate("/historial")}
              className="ui-interactive px-3.5 py-2 rounded-full border border-cardBorder bg-card text-sm font-medium text-muted hover:text-text"
            >
              Historial
            </button>
            <PrimaryButton className="!w-auto !py-2 !px-4 text-sm" onClick={() => navigate("/trabajos/nuevo")}>
              + Nuevo
            </PrimaryButton>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <input
            type="search"
            placeholder="Buscar..."
            className="px-4 py-2.5 bg-card border border-cardBorder rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 w-full sm:max-w-sm shadow-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {!search && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as JobStatus)}
              className={`ui-chip px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border ${
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted">Cargando trabajos...</div>
        ) : loadError ? (
          <div className="col-span-full py-12 text-center text-red-500">{loadError}</div>
        ) : displayed.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted">No se encontraron trabajos.</div>
        ) : (
          displayed.map((trabajo) => {
            const daysAgo = getDaysAgo(trabajo.updatedAt);
            const warningListo = trabajo.estado === "listo" && daysAgo >= 3;
            const canAdvance = Boolean(NEXT_STATUS[trabajo.estado]);

            return (
              <GlassCard
                key={trabajo.id}
                onClick={() => navigate(`/trabajos/${trabajo.id}`)}
                className="flex flex-col gap-3.5 h-full"
              >
                <div className="flex justify-between items-start gap-2">
                  <StatusChip status={trabajo.estado} />
                  <span className="text-xs text-muted whitespace-nowrap font-medium">Hace {daysAgo} d</span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-[1.08rem] leading-tight tracking-tight">{trabajo.cliente.nombre}</h3>
                  <p className="text-sm leading-none text-muted">{trabajo.cliente.telefono}</p>
                </div>

                <p className="text-sm font-medium text-text leading-snug">
                  {trabajo.equipo.tipo} · {trabajo.equipo.marcaModelo}
                </p>

                <p className="text-sm leading-relaxed text-muted line-clamp-2">{trabajo.problema}</p>

                <div className="mt-auto flex flex-col gap-2.5">
                  <div className="ui-chip inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-cardBorder bg-black/5 dark:bg-white/5 text-xs">
                    <span className="uppercase tracking-[0.08em] text-muted font-semibold">Falta</span>
                    <span className={trabajo.queFalta ? "text-text" : "text-muted italic"}>{trabajo.queFalta || "Sin definir"}</span>
                  </div>

                  {warningListo && (
                    <p className="ui-chip text-xs font-semibold text-orange-600 dark:text-orange-300 bg-[rgba(251,191,36,0.16)] border border-[rgba(251,191,36,0.28)] px-2.5 py-1 rounded-full w-fit">
                      Listo hace {daysAgo} dias
                    </p>
                  )}

                  {canAdvance && (
                    <ActionPillButton
                      type="button"
                      onClick={(event: MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        void handleAdvanceStatus(trabajo);
                      }}
                      disabled={savingId === trabajo.id}
                      icon={<ArrowRight size={16} strokeWidth={2.2} />}
                      className="mt-0.5"
                    >
                      {savingId === trabajo.id ? "Actualizando..." : "Pasar al siguiente estado"}
                    </ActionPillButton>
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
