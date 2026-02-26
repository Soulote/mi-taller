import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  GlassCard,
  JobStatus,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextField,
  ToastBanner,
} from "@/components/ui";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  getTrabajoPopulated,
  type TrabajoPopulated,
  updateTrabajo as updateTrabajoRecord,
} from "@/lib/trabajosRepository";

const STATUS_OPTS: { label: string; value: JobStatus }[] = [
  { label: "Pendiente", value: "pendiente" },
  { label: "En curso", value: "en_curso" },
  { label: "Listo", value: "listo" },
  { label: "Entregado", value: "entregado" },
];

interface TrabajoEdits {
  problema: string;
  queFalta: string;
  notas: string;
  materialesCosto: number;
  manoObra: number;
}

function buildEditsFromTrabajo(data: TrabajoPopulated): TrabajoEdits {
  return {
    problema: data.problema,
    queFalta: data.queFalta,
    notas: data.notas,
    materialesCosto: data.materialesCosto,
    manoObra: data.manoObra,
  };
}

export default function TrabajoDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TrabajoPopulated | null>(null);
  const [edits, setEdits] = useState<TrabajoEdits>({
    problema: "",
    queFalta: "",
    notas: "",
    materialesCosto: 0,
    manoObra: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [errorStatus, setErrorStatus] = useState("");
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast]);

  useEffect(() => {
    let active = true;

    const loadTrabajo = async () => {
      if (!id) {
        setLoadError("Falta el identificador del trabajo.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const trabajo = await getTrabajoPopulated(id);

        if (!active) return;
        setData(trabajo);
        if (trabajo) {
          setEdits(buildEditsFromTrabajo(trabajo));
        }
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudo cargar el trabajo.";
        setLoadError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadTrabajo();

    return () => {
      active = false;
    };
  }, [id]);

  const parseNum = (value: string | number) => {
    const number = Number(value);
    return Number.isNaN(number) ? 0 : number;
  };

  const handleSave = async (silent = false) => {
    if (!data) return false;

    setToast(null);
    setIsSaving(true);

    try {
      await updateTrabajoRecord(data.id, edits);
      const refreshed = await getTrabajoPopulated(data.id);
      if (refreshed) {
        setData(refreshed);
        setEdits(buildEditsFromTrabajo(refreshed));
      }

      if (!silent) {
        setToast({ type: "success", message: "Guardado" });
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el trabajo.";
      setToast({ type: "error", message });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!data) return;

    setErrorStatus("");
    setToast(null);

    if (newStatus === "en_curso" && !edits.queFalta.trim()) {
      setErrorStatus("Para pasar a 'En curso', debes especificar 'Que falta'.");
      return;
    }

    setIsSaving(true);

    try {
      await updateTrabajoRecord(data.id, { estado: newStatus });
      const refreshed = await getTrabajoPopulated(data.id);
      if (refreshed) {
        setData(refreshed);
        setEdits(buildEditsFromTrabajo(refreshed));
      }

      if (newStatus === "entregado") {
        navigate("/historial");
      } else {
        setToast({ type: "success", message: "Estado actualizado" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar el estado.";
      setToast({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!data) return;

    const saved = await handleSave(true);
    if (!saved) return;

    const message = buildWhatsAppMessage({
      nombre: data.cliente.nombre,
      materiales: edits.materialesCosto,
      manoObra: edits.manoObra,
      total: edits.materialesCosto + edits.manoObra,
    });
    const url = buildWhatsAppUrl({ telefono: data.cliente.telefono, message });
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-[100dvh]">
        <p className="text-muted">Cargando trabajo...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-[100dvh] gap-4">
        <p className="text-red-500 text-center">{loadError}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-900 dark:text-gray-100 underline decoration-1 underline-offset-4"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center h-[100dvh]">
        <p className="text-muted">Trabajo no encontrado.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-gray-900 dark:text-gray-100 underline decoration-1 underline-offset-4"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const total = edits.materialesCosto + edits.manoObra;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pb-12 flex flex-col gap-6">
      {toast && <ToastBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(data.estado === "entregado" ? "/historial" : "/dashboard")}
          className="p-2 -ml-2 text-muted hover:text-text rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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

        <div className="flex flex-col">
          <h2 className="text-2xl font-bold leading-tight truncate">{data.cliente.nombre}</h2>
          <p className="text-sm text-muted">
            {data.equipo.tipo} · {data.equipo.marcaModelo}
          </p>
        </div>
      </div>

      <GlassCard className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Estado del Trabajo</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {STATUS_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                void handleStatusChange(opt.value);
              }}
              disabled={isSaving}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                data.estado === opt.value
                  ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 shadow-md"
                  : "bg-card border-cardBorder text-text hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errorStatus && (
          <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
            {errorStatus}
          </p>
        )}
      </GlassCard>

      <GlassCard className="flex flex-col gap-5">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Detalles</h3>

        <TextArea
          label="Problema"
          value={edits.problema}
          onChange={(event) => setEdits((prev) => ({ ...prev, problema: event.target.value }))}
          rows={2}
        />
        <TextArea
          label="Que falta"
          value={edits.queFalta}
          onChange={(event) => setEdits((prev) => ({ ...prev, queFalta: event.target.value }))}
          rows={2}
        />
        <TextArea
          label="Notas internas"
          value={edits.notas}
          onChange={(event) => setEdits((prev) => ({ ...prev, notas: event.target.value }))}
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
            onChange={(event) =>
              setEdits((prev) => ({ ...prev, materialesCosto: parseNum(event.target.value) }))
            }
          />
          <TextField
            label="Mano de Obra ($)"
            type="number"
            value={edits.manoObra.toString()}
            onChange={(event) => setEdits((prev) => ({ ...prev, manoObra: parseNum(event.target.value) }))}
          />
        </div>

        <div className="flex justify-between items-center p-4 bg-black/5 dark:bg-white/5 rounded-xl mt-2 border border-cardBorder">
          <span className="font-semibold text-muted">Total a cobrar:</span>
          <span className="text-2xl font-bold">${total.toLocaleString("es-AR")}</span>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-3">
        <PrimaryButton
          onClick={() => {
            void handleSave(false);
          }}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </PrimaryButton>

        {data.estado === "listo" && (
          <button
            onClick={() => {
              void handleWhatsApp();
            }}
            disabled={isSaving}
            className="w-full py-3 px-4 bg-[#25D366] text-white rounded-xl shadow-glass font-medium transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            Avisar por WhatsApp
          </button>
        )}

        {data.estado !== "entregado" && (
          <SecondaryButton
            onClick={() => {
              void handleStatusChange("entregado");
            }}
            disabled={isSaving}
          >
            Marcar como Entregado
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
