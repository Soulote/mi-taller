import { useEffect, useMemo, useState } from "react";
import { Bell, ClipboardList, Clock3, Hammer, ListChecks, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { listTrabajosPopulated, type TrabajoPopulated } from "@/lib/trabajosRepository";

function calcMaxAgeInDays(trabajos: TrabajoPopulated[]) {
  if (trabajos.length === 0) return 0;

  return trabajos.reduce((max, trabajo) => {
    const created = new Date(trabajo.createdAt).getTime();
    if (Number.isNaN(created)) return max;

    const ageDays = Math.max(0, Math.floor((Date.now() - created) / (1000 * 3600 * 24)));
    return Math.max(max, ageDays);
  }, 0);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<TrabajoPopulated[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const rows = await listTrabajosPopulated();
        if (active) setTrabajos(rows);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudo cargar el resumen operativo.";
        setLoadError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const activos = useMemo(
    () => trabajos.filter((trabajo) => trabajo.estado === "pendiente" || trabajo.estado === "en_curso" || trabajo.estado === "listo"),
    [trabajos],
  );

  const kpis = useMemo(() => {
    const listos = activos.filter((trabajo) => trabajo.estado === "listo").length;
    const enCurso = activos.filter((trabajo) => trabajo.estado === "en_curso").length;

    return [
      { label: "Activos", value: activos.length, icon: ClipboardList },
      { label: "Listos para entregar", value: listos, icon: ListChecks },
      { label: "En curso", value: enCurso, icon: Hammer },
      { label: "Antiguedad max", value: `${calcMaxAgeInDays(activos)} d`, icon: Clock3 },
    ];
  }, [activos]);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pb-10 flex flex-col gap-6 md:gap-7">
      <section className="flex flex-col gap-1.5">
        <h1 className="text-[1.7rem] md:text-[1.9rem] leading-tight font-semibold tracking-tight">Inicio</h1>
        <p className="text-sm md:text-base text-muted">Vista rapida del taller para arrancar el dia.</p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.1em] font-semibold text-muted">Resumen del dia</h2>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="ui-interactive rounded-full border border-cardBorder bg-card px-3 py-1.5 text-xs font-semibold text-muted hover:text-text"
          >
            Ir al Tablero
          </button>
        </div>

        {loading ? (
          <GlassCard>
            <p className="text-sm text-muted">Cargando indicadores...</p>
          </GlassCard>
        ) : loadError ? (
          <GlassCard>
            <p className="text-sm text-red-500">{loadError}</p>
          </GlassCard>
        ) : (
          <div className="-mx-1 px-1 overflow-x-auto md:overflow-visible">
            <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-max md:min-w-0">
              {kpis.map((item) => {
                const Icon = item.icon;
                return (
                  <GlassCard key={item.label} className="min-w-[180px] md:min-w-0 flex flex-col gap-3 !p-4">
                    <div className="inline-flex w-8 h-8 items-center justify-center rounded-xl border border-cardBorder bg-black/5 dark:bg-white/5 text-muted">
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-muted font-semibold">{item.label}</p>
                      <p className="text-2xl font-semibold tracking-tight leading-none">{item.value}</p>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-[0.1em] font-semibold text-muted">Proximos recordatorios</h2>
        <GlassCard className="flex items-start gap-3">
          <div className="inline-flex w-9 h-9 items-center justify-center rounded-full border border-cardBorder bg-black/5 dark:bg-white/5 text-muted">
            <Bell size={16} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Sin recordatorios</p>
            <p className="text-sm text-muted">Cuando agregues recordatorios, se mostraran aca por prioridad (hoy/manana).</p>
          </div>
        </GlassCard>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-[0.1em] font-semibold text-muted">Acciones rapidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PrimaryButton className="!justify-center !inline-flex !items-center !gap-2" onClick={() => navigate("/trabajos/nuevo")}>
            <Plus size={16} /> + Nuevo trabajo
          </PrimaryButton>
          <SecondaryButton className="!justify-center !inline-flex !items-center !gap-2" onClick={() => navigate("/dashboard")}>
            <ClipboardList size={16} /> Ir al Tablero
          </SecondaryButton>
          <SecondaryButton className="!justify-center !inline-flex !items-center !gap-2" onClick={() => navigate("/historial")}>
            <ListChecks size={16} /> Historial
          </SecondaryButton>
          <SecondaryButton className="!justify-center !inline-flex !items-center !gap-2" onClick={() => navigate("/recordatorios")}>
            <Bell size={16} /> Recordatorios
          </SecondaryButton>
        </div>
      </section>
    </div>
  );
}
