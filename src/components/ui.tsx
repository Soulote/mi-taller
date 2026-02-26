import React, { ReactNode } from "react";
import Link from "next/link";

// GlassCard
export function GlassCard({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
    return (
        <div
            className={`glass-card p-4 md:p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

// GlassHeader
export function GlassHeader({ title = "Mi Taller · v1.1.1" }: { title?: string }) {
    return (
        <header className="glass-header px-4 py-3 flex justify-between items-center mb-6">
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
                {title}
            </Link>
            <Link href="/login" className="text-sm text-muted hover:text-text transition-colors">
                Salir
            </Link>
        </header>
    );
}

// StatusPill
export type JobStatus = 'pendiente' | 'en_curso' | 'listo' | 'entregado';

const statusStyles: Record<JobStatus, string> = {
    pendiente: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50",
    en_curso: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50",
    listo: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50",
    entregado: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const statusLabels: Record<JobStatus, string> = {
    pendiente: "Pendiente",
    en_curso: "En curso",
    listo: "Listo",
    entregado: "Entregado",
};

export function StatusPill({ status }: { status: JobStatus }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
            {statusLabels[status]}
        </span>
    );
}

// Buttons
export function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`w-full py-3 px-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl shadow-glass font-medium transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`w-full py-3 px-4 bg-card text-text border border-cardBorder rounded-xl shadow-glass font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

// Inputs
export function TextField({ label, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-text">{label}</label>}
            <input
                className="w-full bg-card border border-cardBorder rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition-all disabled:opacity-50"
                {...props}
            />
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
}

export function TextArea({ label, error, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-text">{label}</label>}
            <textarea
                className="w-full bg-card border border-cardBorder rounded-xl px-4 py-3 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition-all disabled:opacity-50 resize-y min-h-[100px]"
                {...props}
            />
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
}

// FAB
export function FloatingActionButton({ onClick, icon = "+" }: { onClick: () => void; icon?: ReactNode }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-glass flex items-center justify-center text-2xl pb-1 transition-transform hover:scale-105 active:scale-95 z-40 md:hidden"
        >
            {icon}
        </button>
    );
}

export function ToastBanner({
    message,
    type,
    onClose,
}: {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}) {
    const toneClass = type === "success"
        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
        : "border-red-500/50 bg-red-500/15 text-red-200";

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-glass backdrop-blur-xl ${toneClass}`}>
            <div className="flex items-start gap-3">
                <p className="text-sm font-medium leading-snug">{message}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-muted hover:text-text transition-colors"
                    aria-label="Cerrar"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
