"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, GlassHeader, PrimaryButton, TextField, TextArea, ToastBanner } from "@/components/ui";
import { createTrabajoCompleto } from "@/lib/trabajosRepository";

const EQUIPO_TIPOS = ["Notebook", "PC Escritorio", "All in One", "Impresora", "MacBook", "Otro"];

export default function NuevoTrabajoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        tipo: "Notebook",
        marcaModelo: "",
        problema: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

    useEffect(() => {
        if (!toast) return;

        const timeout = window.setTimeout(() => {
            setToast(null);
        }, 3200);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setToast(null);
        setIsSaving(true);

        try {
            const newId = await createTrabajoCompleto(formData);
            router.push(`/trabajos/${newId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo crear el trabajo.";
            setToast({ type: "error", message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col pb-8 max-w-3xl mx-auto w-full">
            {toast && (
                <ToastBanner
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <GlassHeader />

            <div className="px-4 md:px-6 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 text-muted hover:text-text rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h2 className="text-2xl font-bold">Nuevo Trabajo</h2>
                </div>

                <GlassCard>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <h3 className="text-lg font-semibold border-b border-cardBorder pb-2">Datos del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                                label="Nombre y Apellido"
                                value={formData.nombre}
                                onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                                required
                            />
                            <TextField
                                label="Teléfono"
                                type="tel"
                                value={formData.telefono}
                                onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))}
                                required
                            />
                        </div>

                        <h3 className="text-lg font-semibold border-b border-cardBorder pb-2 mt-4">Datos del Equipo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-text">Tipo de Equipo</label>
                                <select
                                    className="w-full bg-card border border-cardBorder rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition-all appearance-none"
                                    value={formData.tipo}
                                    onChange={e => setFormData(p => ({ ...p, tipo: e.target.value }))}
                                >
                                    {EQUIPO_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <TextField
                                label="Marca y Modelo"
                                value={formData.marcaModelo}
                                onChange={e => setFormData(p => ({ ...p, marcaModelo: e.target.value }))}
                                required
                            />
                        </div>

                        <TextArea
                            label="Problema reportado"
                            value={formData.problema}
                            onChange={e => setFormData(p => ({ ...p, problema: e.target.value }))}
                            required
                            className="mt-2"
                        />

                        <PrimaryButton type="submit" className="mt-4" disabled={isSaving}>
                            {isSaving ? "Guardando..." : "Crear Trabajo"}
                        </PrimaryButton>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
}
