import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard, SecondaryButton } from "@/components/ui";

export default function RecordatoriosPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pb-10 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="ui-interactive p-2 -ml-2 text-muted hover:text-text rounded-full"
        >
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[1.7rem] leading-tight font-semibold tracking-tight">Recordatorios</h1>
      </div>

      <GlassCard className="flex flex-col items-start gap-3">
        <div className="inline-flex w-10 h-10 items-center justify-center rounded-full border border-cardBorder bg-black/5 dark:bg-white/5 text-muted">
          <Bell size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold">Sin recordatorios</p>
          <p className="text-sm text-muted">Proximamente podras crear alertas de seguimiento para trabajos pendientes.</p>
        </div>
        <SecondaryButton className="!w-auto !px-4 !py-2.5" onClick={() => navigate("/dashboard")}>
          Ir al tablero
        </SecondaryButton>
      </GlassCard>
    </div>
  );
}
