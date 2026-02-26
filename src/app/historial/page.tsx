"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, GlassHeader, StatusPill } from "@/components/ui";
import { listTrabajosPopulated, type TrabajoPopulated } from "@/lib/trabajosRepository";

export default function HistorialPage() {
    const router = useRouter();
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

    const entregados = useMemo(() => {
        return todos.filter(t => {
            if (t.estado !== 'entregado') return false;
            if (search) {
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
    }, [todos, search]);

    return (
        <div className="flex-1 flex flex-col pb-8 max-w-5xl mx-auto w-full">
            <GlassHeader />

            <div className="px-4 md:px-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 text-muted hover:text-text rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <h2 className="text-2xl font-bold">Historial</h2>
                    </div>
                    <input
                        type="search"
                        placeholder="Buscar entregados..."
                        className="px-4 py-2 bg-card border border-cardBorder rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 w-full sm:w-64 shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-muted">
                            Cargando historial...
                        </div>
                    ) : loadError ? (
                        <div className="col-span-full py-12 text-center text-red-500">
                            {loadError}
                        </div>
                    ) : entregados.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted">
                            No hay trabajos entregados.
                        </div>
                    ) : (
                        entregados.map(t => (
                            <GlassCard key={t.id} onClick={() => router.push(`/trabajos/${t.id}`)} className="flex flex-col gap-3 group h-full">
                                <div className="flex justify-between items-start gap-2">
                                    <StatusPill status={t.estado} />
                                    <span className="text-xs text-muted whitespace-nowrap font-medium">
                                        {new Date(t.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg leading-tight mb-0.5">{t.cliente.nombre}</h3>
                                    <p className="text-sm text-muted">{t.cliente.telefono}</p>
                                </div>

                                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm mt-auto">
                                    <p className="font-medium text-text mb-1">{t.equipo.tipo} · {t.equipo.marcaModelo}</p>
                                    <p className="text-muted line-clamp-2">{t.problema}</p>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
