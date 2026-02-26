import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import changelogRaw from "../../../changelog.md?raw";

export type JobStatus = "pendiente" | "en_curso" | "listo" | "entregado";

const statusStyles: Record<JobStatus, string> = {
  pendiente: "border-[rgba(245,158,11,0.45)] bg-[rgba(245,158,11,0.15)] text-[rgb(146,92,0)] dark:border-[rgba(245,158,11,0.5)] dark:bg-[rgba(245,158,11,0.2)] dark:text-[rgb(253,230,138)]",
  en_curso: "border-[rgba(14,116,144,0.4)] bg-[rgba(6,182,212,0.14)] text-[rgb(8,89,121)] dark:border-[rgba(14,165,233,0.5)] dark:bg-[rgba(14,165,233,0.2)] dark:text-[rgb(186,230,253)]",
  listo: "border-[rgba(16,185,129,0.45)] bg-[rgba(16,185,129,0.14)] text-[rgb(4,120,87)] dark:border-[rgba(16,185,129,0.5)] dark:bg-[rgba(16,185,129,0.2)] dark:text-[rgb(167,243,208)]",
  entregado: "border-[rgba(107,114,128,0.4)] bg-[rgba(107,114,128,0.12)] text-[rgb(55,65,81)] dark:border-[rgba(148,163,184,0.35)] dark:bg-[rgba(71,85,105,0.22)] dark:text-[rgb(203,213,225)]",
};

const statusLabels: Record<JobStatus, string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  listo: "Listo",
  entregado: "Entregado",
};

export function GlassCard({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`glass-card p-4 md:p-5 ${onClick ? "glass-card-interactive ui-interactive cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

function ChangelogBody() {
  const lines = useMemo(() => changelogRaw.split("\n"), []);

  return (
    <div className="space-y-1">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h2 key={index} className="text-xl font-semibold tracking-tight mt-1 mb-2">
              {line.replace(/^#\s+/, "")}
            </h2>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h3 key={index} className="text-base font-semibold tracking-tight mt-4 mb-1.5">
              {line.replace(/^##\s+/, "")}
            </h3>
          );
        }

        if (line.startsWith("### ")) {
          return (
            <h4 key={index} className="text-sm font-semibold uppercase tracking-[0.08em] text-muted mt-3 mb-1">
              {line.replace(/^###\s+/, "")}
            </h4>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <p key={index} className="text-sm leading-relaxed text-text pl-4 relative">
              <span className="absolute left-0 top-[0.44rem] w-1.5 h-1.5 rounded-full bg-muted/70" />
              {line.replace(/^-\s+/, "")}
            </p>
          );
        }

        if (!line.trim()) {
          return <div key={index} className="h-1" />;
        }

        return (
          <p key={index} className="text-sm leading-relaxed text-muted">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function GlassHeader({ title = "Mi Taller · v1.1.4" }: { title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="glass-header px-4 md:px-6 py-2.5 md:py-3.5 flex justify-between items-center mb-4 md:mb-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ui-interactive text-[0.98rem] md:text-lg font-semibold tracking-tight leading-none rounded-full px-2 py-1 -ml-2"
          aria-label="Abrir changelog"
        >
          {title}
        </button>

        <div className="flex items-center gap-1.5">
          <Link to="/" className="ui-interactive rounded-full px-2.5 py-1 text-xs md:text-sm text-muted hover:text-text">
            Inicio
          </Link>
          <Link to="/login" className="ui-interactive rounded-full px-2.5 py-1 text-xs md:text-sm text-muted hover:text-text">
            Salir
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px]"
              onClick={() => setOpen(false)}
              aria-label="Cerrar changelog"
            />

            <div className="hidden md:flex absolute inset-0 items-center justify-center p-6">
              <motion.section
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="glass-card w-full max-w-2xl max-h-[78vh] flex flex-col"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-cardBorder">
                  <p className="text-base font-semibold tracking-tight">Changelog</p>
                  <button type="button" onClick={() => setOpen(false)} className="ui-interactive rounded-full px-3 py-1.5 text-sm text-muted hover:text-text">
                    Cerrar
                  </button>
                </div>
                <div className="overflow-y-auto px-5 py-4">
                  <ChangelogBody />
                </div>
              </motion.section>
            </div>

            <div className="md:hidden absolute inset-x-0 bottom-0">
              <motion.section
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="glass-card rounded-t-3xl rounded-b-none max-h-[80vh] flex flex-col"
              >
                <div className="mx-auto mt-2.5 mb-2 h-1 w-10 rounded-full bg-cardBorder" />
                <div className="flex items-center justify-between px-4 py-2 border-b border-cardBorder">
                  <p className="text-sm font-semibold tracking-tight">Changelog</p>
                  <button type="button" onClick={() => setOpen(false)} className="ui-interactive rounded-full px-2.5 py-1 text-xs text-muted hover:text-text">
                    Cerrar
                  </button>
                </div>
                <div className="overflow-y-auto px-4 py-3 pb-5">
                  <ChangelogBody />
                </div>
              </motion.section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function StatusChip({ status }: { status: JobStatus }) {
  return (
    <span className={`ui-chip inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export const StatusPill = StatusChip;

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`ui-interactive w-full py-3 px-5 bg-[var(--cta-bg)] text-[var(--cta-text)] rounded-full shadow-[var(--shadow-elev)] font-semibold tracking-tight disabled:opacity-45 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`ui-interactive w-full py-2.5 px-4 bg-card text-text border border-cardBorder rounded-full font-medium disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionPillButton({
  children,
  icon,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode }) {
  return (
    <button
      className={`ui-interactive w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-[var(--cta-border)] bg-[var(--cta-soft-bg)] text-[var(--cta-soft-text)] text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      <span>{children}</span>
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
}

export function TextField({
  label,
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
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

export function TextArea({
  label,
  error,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
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

export function FloatingActionButton({ onClick, icon = "+" }: { onClick: () => void; icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="ui-interactive fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--cta-bg)] text-[var(--cta-text)] shadow-[var(--shadow-elev)] flex items-center justify-center text-2xl pb-1 z-40 md:hidden"
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
  const toneClass =
    type === "success"
      ? "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.13)] text-[rgb(6,95,70)] dark:text-[rgb(167,243,208)]"
      : "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.13)] text-[rgb(127,29,29)] dark:text-[rgb(254,202,202)]";

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-glass backdrop-blur-xl ${toneClass}`}>
      <div className="flex items-start gap-3">
        <p className="text-sm font-medium leading-snug">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="ui-interactive rounded-full px-2 py-1 text-xs text-muted hover:text-text"
          aria-label="Cerrar"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
