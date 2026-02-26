"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JobStatus, GlassCard, GlassHeader, StatusPill, FloatingActionButton, PrimaryButton } from "@/components/ui";
import { listTrabajosPopulated, type TrabajoPopulated } from "@/lib/trabajosRepository";

const TABS: { label: string; value: JobStatus | 'todos' }[] = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En curso', value: 'en_curso' },
    { label: 'Listo', value: 'listo' },
];

export default function DashboardPage() {
    const router = useRouter();
    const [todos, setTodos] = useState<TrabajoPopulated[]>([]);
    const [activeTab, setActiveTab] = useState<JobStatus | 'todos'>('en_curso');
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [tabInitialized, setTabInitialized] = useState(false);

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
                if (active) {
                    const message = error instanceof Error ? error.message : "No se pudieron cargar los trabajos.";
                    setLoadError(message);
                }
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
        setActiveTab(todos.some((trabajo) => trabajo.estado === 'listo') ? 'listo' : 'en_curso');
        setTabInitialized(true);
    }, [loading, tabInitialized, todos]);

    const filtered = useMemo(() => {
        return todos.filter(t => {
            // Exclude entregado from dashboard tabs
            if (t.estado === 'entregado' && activeTab !== 'todos') return false;
            if (activeTab !== 'todos' && t.estado !== activeTab && !search) return false; // if searching, ignore tab but not entirely? Wait, requirement says search filters globally. So if search, we ignore tabs? Yes.

            if (search) {
                if (t.estado === 'entregado') return false; // Usually keep entregado in historial, but ok.
                const q = search.toLowerCase();
                return (
                    t.cliente.nombre.toLowerCase().includes(q) ||
                    t.cliente.telefono.includes(q) ||
                    t.equipo.tipo.toLowerCase().includes(q) ||
                    t.equipo.marcaModelo.toLowerCase().includes(q) ||
                    t.problema.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [todos, activeTab, search]);

    const getDaysAgo = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
    };

    return (
        <div className="flex-1 flex flex-col pb-24 md:pb-8 max-w-5xl mx-auto w-full">
            <GlassHeader />

            <div className="px-4 md:px-6 flex flex-col gap-6">
                {/* Search & Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <h2 className="text-2xl font-bold">Tablero</h2>
                        <button onClick={() => router.push('/historial')} className="sm:hidden text-sm font-medium text-muted hover:text-text px-2">
                            Historial
                        </button>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input
                            type="search"
                            placeholder="Buscar..."
                            className="px-4 py-2 bg-card border border-cardBorder rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 w-full sm:w-64 shadow-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button onClick={() => router.push('/historial')} className="hidden sm:block text-sm font-medium text-muted hover:text-text whitespace-nowrap px-2">
                            Historial
                        </button>
                        <PrimaryButton className="hidden md:block !w-auto !py-2 !px-4 whitespace-nowrap" onClick={() => router.push('/trabajos/nuevo')}>
                            + Nuevo
                        </PrimaryButton>
                    </div>
                </div>

                {/* Tabs */}
                {!search && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value as JobStatus)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${activeTab === tab.value
                                        ? 'bg-gray-900 text-white border-transparent shadow-md dark:bg-white dark:text-gray-900'
                                        : 'bg-card text-muted border-cardBorder hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-muted">
                            Cargando trabajos...
                        </div>
                    ) : loadError ? (
                        <div className="col-span-full py-12 text-center text-red-500">
                            {loadError}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted">
                            No se encontraron trabajos.
                        </div>
                    ) : (
                        filtered.map(t => {
                            const daysAgo = getDaysAgo(t.updatedAt);
                            const warningListo = t.estado === 'listo' && daysAgo >= 3;

                            return (
                                <GlassCard key={t.id} onClick={() => router.push(`/trabajos/${t.id}`)} className="flex flex-col gap-3 group h-full">
                                    <div className="flex justify-between items-start gap-2">
                                        <StatusPill status={t.estado} />
                                        <span className="text-xs text-muted whitespace-nowrap font-medium">Hace {daysAgo} d</span>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-lg leading-tight mb-0.5">{t.cliente.nombre}</h3>
                                        <p className="text-sm text-muted">{t.cliente.telefono}</p>
                                    </div>

                                    <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm mt-auto">
                                        <p className="font-medium text-text mb-1">{t.equipo.tipo} · {t.equipo.marcaModelo}</p>
                                        <p className="text-muted line-clamp-2">{t.problema}</p>
                                    </div>

                                    <div className="mt-1 flex flex-col gap-2">
                                        <p className="text-sm">
                                            <span className="font-medium text-muted">Falta: </span>
                                            <span className={t.queFalta ? "text-text" : "text-muted italic"}>
                                                {t.queFalta || "Sin definir"}
                                            </span>
                                        </p>
                                        {warningListo && (
                                            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded w-fit">
                                                ⚠ Listo hace {daysAgo} días
                                            </p>
                                        )}
                                    </div>
                                </GlassCard>
                            );
                        })
                    )}
                </div>
            </div>

            <FloatingActionButton
                onClick={() => router.push('/trabajos/nuevo')}
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
            />
        </div>
    );
}
