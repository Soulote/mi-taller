import { useEffect, useMemo, useState } from "react";
import { Bell, ClipboardList, Clock3, Hammer, ListChecks, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { GlassCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { buildFinanceSummary } from "@/lib/finanzas";
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
      {
        label: "Activos",
        value: activos.length,
        icon: ClipboardList,
        href: "/dashboard?estado=activos",
        ariaLabel: "Ver trabajos activos",
      },
      {
        label: "Listos para entregar",
        value: listos,
        icon: ListChecks,
        href: "/dashboard?estado=listo",
        ariaLabel: "Ver listos para entregar",
      },
      {
        label: "En curso",
        value: enCurso,
        icon: Hammer,
        href: "/dashboard?estado=en_curso",
        ariaLabel: "Ver trabajos en curso",
      },
      {
        label: "Antiguedad max",
        value: `${calcMaxAgeInDays(activos)} d`,
        icon: Clock3,
        href: "/dashboard?sort=antiguedad_desc",
        ariaLabel: "Ver trabajos mas antiguos",
      },
    ];
  }, [activos]);

  const finanzas = useMemo(() => buildFinanceSummary(trabajos), [trabajos]);

  const formatMoney = (value: number) =>
    value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pb-10 flex flex-col gap-6">
      <section className="flex items-center justify-between">
        <h1 className="text-[1.75rem] md:text-[1.95rem] leading-tight font-semibold tracking-tight">Inicio</h1>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="ui-interactive rounded-full border border-cardBorder bg-card px-5 py-2.5 text-base font-medium text-text/90 hover:text-text hover:-translate-y-[1px] hover:shadow-[var(--shadow-elev)]"
        >
          Ir al Tablero
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-[0.1em] font-semibold text-muted">KPI</h2>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {kpis.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
              >
                <GlassCard
                  onClick={() => navigate(item.href)}
                  className="kpi-card ui-interactive h-full flex flex-col justify-between gap-6 !p-5 md:!p-6"
                  aria-label={item.ariaLabel}
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex w-10 h-10 items-center justify-center rounded-full border border-cardBorder bg-black/5 dark:bg-white/5 text-muted shadow-[0_8px_16px_-12px_rgba(15,23,42,0.8)]">
                      <Icon size={16} />
                    </div>
                    <p className="text-base leading-tight tracking-normal text-text/90 font-semibold">{item.label}</p>
                  </div>

                  <div className="pt-1.5">
                    <p className="text-[2.75rem] md:text-[3rem] font-semibold tracking-tight leading-none">{item.value}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {loading && <p className="text-xs text-muted">Actualizando...</p>}
        {loadError && <p className="text-xs text-red-500">{loadError}</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-[0.1em] font-semibold text-muted">Proximos recordatorios</h2>
        <GlassCard className="flex items-start gap-3">
          <div className="inline-flex w-9 h-9 items-center justify-center rounded-full border border-cardBorder bg-black/5 dark:bg-white/5 text-muted">
            <Bell size={16} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Sin recordatorios</p>
          </div>
        </GlassCard>
      </section>

      <section className="flex flex-col gap-3 border-t border-cardBorder/70 pt-4">
        <h2 className="text-sm uppercase tracking-[0.1em] font-semibold text-muted">Acciones rapidas</h2>
        <GlassCard className="!p-3.5 md:!p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton className="!justify-center !inline-flex !items-center !gap-2" onClick={() => navigate("/trabajos/nuevo")}>
              <Plus size={16} /> Nuevo trabajo
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
        </GlassCard>
      </section>

      <section className="flex flex-col gap-3 border-t border-cardBorder/70 pt-4">
        <h2 className="text-sm uppercase tracking-[0.1em] font-semibold text-muted">FINANZAS (MES)</h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <GlassCard key={index} className="!p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 rounded bg-black/10 dark:bg-white/10" />
                    <div className="h-7 rounded bg-black/10 dark:bg-white/10" />
                  </div>
                </GlassCard>
              ))}
            </div>
            <GlassCard className="!p-4">
              <div className="h-24 rounded-xl animate-pulse bg-black/10 dark:bg-white/10" />
            </GlassCard>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <GlassCard className="!p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted font-semibold">Facturado</p>
                <p className="text-xl md:text-2xl font-semibold tracking-tight mt-1">
                  {formatMoney(finanzas.facturadoMes)}
                </p>
              </GlassCard>
              <GlassCard className="!p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted font-semibold">Ganancia</p>
                <p className="text-xl md:text-2xl font-semibold tracking-tight mt-1">
                  {formatMoney(finanzas.gananciaMes)}
                </p>
              </GlassCard>
              <GlassCard className="!p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted font-semibold">Ticket prom</p>
                <p className="text-xl md:text-2xl font-semibold tracking-tight mt-1">
                  {formatMoney(finanzas.ticketPromedioMes)}
                </p>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <GlassCard className="!p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted font-semibold mb-2">Facturacion 6 meses</p>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={finanzas.series6Meses} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                      <Tooltip
                        cursor={{ fill: "rgba(148,163,184,0.12)" }}
                        formatter={(value: number) => formatMoney(Number(value) || 0)}
                        labelFormatter={(label: string | number) => `${label}`}
                      />
                      <Bar dataKey="facturacion" radius={[6, 6, 3, 3]} fill="rgba(59,130,246,0.58)" animationDuration={700} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="!p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted font-semibold mb-2">Ganancia 6 meses</p>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={finanzas.series6Meses} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                      <Tooltip
                        cursor={{ stroke: "rgba(148,163,184,0.45)", strokeWidth: 1 }}
                        formatter={(value: number) => formatMoney(Number(value) || 0)}
                        labelFormatter={(label: string | number) => `${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="ganancia"
                        stroke="rgba(16,185,129,0.88)"
                        strokeWidth={2.4}
                        dot={false}
                        animationDuration={700}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {loadError && <p className="text-xs text-red-500">{loadError}</p>}
          </>
        )}
      </section>
    </div>
  );
}
