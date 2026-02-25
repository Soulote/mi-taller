// src/app/trabajos/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockStore } from "@/lib/mockStore";
import { JobStatus, GlassCard, GlassHeader, PrimaryButton, SecondaryButton, TextField, TextArea } from "@/components/ui";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const STATUS_OPTS: { label: string; value: JobStatus }[] = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En curso', value: 'en_curso' },
    { label: 'Listo', value: 'listo' },
    { label: 'Entregado', value: 'entregado' }
];

export default function TrabajoDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Unwrap params using a standard approach for App Router client components
    // In Next 13+ params directly available in client component, Next 14/15 changes sometimes require a hook or async, but sync params is fine for V1.
    const [data, setData] = useState(() => mockStore.getTrabajo(params.id));

    const [edits, setEdits] = useState({
        problema: data?.problema || "",
        queFalta: data?.queFalta || "",
        notas: data?.notas || "",
        materialesCosto: data?.materialesCosto || 0,
        manoObra: data?.manoObra || 0,
    });
    const [errorStatus, setErrorStatus] = useState("");

    if (!data) {
        return (
            <div className="flex-1 flex flex-col p-6 items-center justify-center h-[100dvh]">
                <p className="text-muted">Trabajo no encontrado.</p>
                <button onClick={() => router.push('/dashboard')} className="mt-4 text-gray-900 dark:text-gray-100 underline decoration-1 underline-offset-4">Volver al Dashboard</button>
            </div>
        );
    }

    const parseNum = (val: string | number) => {
        const n = Number(val);
        return isNaN(n) ? 0 : n;
    };

    const handleSave = (silent = false) => {
        mockStore.updateTrabajo(data.id, edits);
        if (!silent) alert("Guardado correctamente");
    };

    const handleStatusChange = (newStatus: JobStatus) => {
        setErrorStatus("");
        if (newStatus === 'en_curso' && !edits.queFalta.trim()) {
            setErrorStatus("Para pasar a 'En curso', debes especificar 'Qué falta'.");
            return;
        }
        mockStore.updateTrabajo(data.id, { estado: newStatus, ...edits });
        setData(mockStore.getTrabajo(params.id)); // refresh view
        if (newStatus === 'entregado') {
            router.push('/historial');
        }
    };

    const handleWhatsApp = () => {
        handleSave(true); // Auto-save latest prices before generating message
        const msg = buildWhatsAppMessage({
            nombre: data.cliente.nombre,
            materiales: edits.materialesCosto,
            manoObra: edits.manoObra,
            total: edits.materialesCosto + edits.manoObra
        });
        const url = buildWhatsAppUrl({ telefono: data.cliente.telefono, message: msg });
        window.open(url, '_blank');
    };

    const total = edits.materialesCosto + edits.manoObra;

    return (
        <div className="flex-1 flex flex-col pb-12 max-w-3xl mx-auto w-full">
            <GlassHeader />

            <div className="px-4 md:px-6 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push(data.estado === 'entregado' ? '/historial' : '/dashboard')} className="p-2 -ml-2 text-muted hover:text-text rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold leading-tight truncate">{data.cliente.nombre}</h2>
                        <p className="text-sm text-muted">{data.equipo.tipo} · {data.equipo.marcaModelo}</p>
                    </div>
                </div>

                <GlassCard className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Estado del Trabajo</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {STATUS_OPTS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleStatusChange(opt.value)}
                                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${data.estado === opt.value
                                    ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 shadow-md'
                                    : 'bg-card border-cardBorder text-text hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {errorStatus && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{errorStatus}</p>}
                </GlassCard>

                <GlassCard className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Detalles</h3>

                    <TextArea
                        label="Problema"
                        value={edits.problema}
                        onChange={e => setEdits(p => ({ ...p, problema: e.target.value }))}
                        rows={2}
                    />
                    <TextArea
                        label="Qué falta"
                        value={edits.queFalta}
                        onChange={e => setEdits(p => ({ ...p, queFalta: e.target.value }))}
                        rows={2}
                    />
                    <TextArea
                        label="Notas internas"
                        value={edits.notas}
                        onChange={e => setEdits(p => ({ ...p, notas: e.target.value }))}
                        rows={2}
                    />
                </GlassCard>

                <GlassCard className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Presupuesto</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                            label="Materiales ($)"
                            type="number"
                            value={edits.materialesCosto.toString()}
                            onChange={e => setEdits(p => ({ ...p, materialesCosto: parseNum(e.target.value) }))}
                        />
                        <TextField
                            label="Mano de Obra ($)"
                            type="number"
                            value={edits.manoObra.toString()}
                            onChange={e => setEdits(p => ({ ...p, manoObra: parseNum(e.target.value) }))}
                        />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/5 dark:bg-white/5 rounded-xl mt-2 border border-cardBorder">
                        <span className="font-semibold text-muted">Total a cobrar:</span>
                        <span className="text-2xl font-bold">${total.toLocaleString('es-AR')}</span>
                    </div>
                </GlassCard>

                <div className="flex flex-col gap-3">
                    <PrimaryButton onClick={() => handleSave(false)}>
                        Guardar Cambios
                    </PrimaryButton>

                    {data.estado === 'listo' && (
                        <button
                            onClick={handleWhatsApp}
                            className="w-full py-3 px-4 bg-[#25D366] text-white rounded-xl shadow-glass font-medium transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                        >
                            📲 Avisar por WhatsApp
                        </button>
                    )}

                    {data.estado !== 'entregado' && (
                        <SecondaryButton onClick={() => handleStatusChange('entregado')}>
                            ✔ Marcar como Entregado
                        </SecondaryButton>
                    )}
                </div>
            </div>
        </div>
    );
}
