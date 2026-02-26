import type { Trabajo } from "./trabajosRepository";

const MONTHS_WINDOW = 6;

export interface FinanceSeriesPoint {
  monthKey: string;
  monthLabel: string;
  facturacion: number;
  ganancia: number;
}

export interface FinanceSummary {
  facturadoMes: number;
  gananciaMes: number;
  ticketPromedioMes: number;
  entregadosMes: number;
  series6Meses: FinanceSeriesPoint[];
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function addMonths(date: Date, value: number) {
  return new Date(date.getFullYear(), date.getMonth() + value, 1, 0, 0, 0, 0);
}

function toMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function toMonthLabel(date: Date) {
  return date.toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
}

function toSafeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function resolveBillingDate(trabajo: Trabajo) {
  const rawDate = trabajo.fechaEntrega ?? trabajo.updatedAt;
  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getTrabajoGanancia(trabajo: Pick<Trabajo, "precioCobrado" | "costoMateriales" | "costoExtra">) {
  return toSafeNumber(trabajo.precioCobrado) - toSafeNumber(trabajo.costoMateriales) - toSafeNumber(trabajo.costoExtra);
}

export function buildFinanceSummary(trabajos: Trabajo[], now = new Date()): FinanceSummary {
  const currentMonthStart = startOfMonth(now);
  const firstWindowMonth = addMonths(currentMonthStart, -(MONTHS_WINDOW - 1));

  const baseSeries = Array.from({ length: MONTHS_WINDOW }, (_, index) => {
    const monthDate = addMonths(firstWindowMonth, index);

    return {
      monthKey: toMonthKey(monthDate),
      monthLabel: toMonthLabel(monthDate),
      facturacion: 0,
      ganancia: 0,
    };
  });

  const seriesByMonth = new Map(baseSeries.map((point) => [point.monthKey, point]));

  let facturadoMes = 0;
  let gananciaMes = 0;
  let entregadosMes = 0;

  for (const trabajo of trabajos) {
    if (trabajo.estado !== "entregado") continue;

    const billingDate = resolveBillingDate(trabajo);
    if (!billingDate) continue;

    const monthKey = toMonthKey(startOfMonth(billingDate));
    const price = toSafeNumber(trabajo.precioCobrado);
    const gain = getTrabajoGanancia(trabajo);

    const monthPoint = seriesByMonth.get(monthKey);
    if (monthPoint) {
      monthPoint.facturacion += price;
      monthPoint.ganancia += gain;
    }

    if (monthKey === toMonthKey(currentMonthStart)) {
      facturadoMes += price;
      gananciaMes += gain;
      entregadosMes += 1;
    }
  }

  return {
    facturadoMes,
    gananciaMes,
    ticketPromedioMes: entregadosMes === 0 ? 0 : facturadoMes / entregadosMes,
    entregadosMes,
    series6Meses: baseSeries,
  };
}
