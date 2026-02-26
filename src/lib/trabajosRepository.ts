import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { JobStatus } from "@/components/ui";
import type { Cliente, Equipo, Trabajo } from "./mockData";
import { mockStore } from "./mockStore";

export interface TrabajoPopulated extends Trabajo {
    cliente: Cliente;
    equipo: Equipo;
}

export interface NewTrabajoInput {
    nombre: string;
    telefono: string;
    tipo: string;
    marcaModelo: string;
    problema: string;
}

interface ClienteRow {
    id: string;
    nombre: string;
    telefono: string;
}

interface EquipoRow {
    id: string;
    cliente_id: string;
    tipo: string;
    marca_modelo: string;
}

interface TrabajoRow {
    id: string;
    cliente_id: string;
    equipo_id: string;
    estado: JobStatus;
    problema: string;
    que_falta: string;
    notas: string;
    materiales_costo: number;
    mano_obra: number;
    created_at: string;
    updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const cloudPersistenceEnabled = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
    if (!cloudPersistenceEnabled) return null;

    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);
    }

    return supabaseClient;
}

function toCliente(row: ClienteRow): Cliente {
    return {
        id: row.id,
        nombre: row.nombre,
        telefono: row.telefono,
    };
}

function toEquipo(row: EquipoRow): Equipo {
    return {
        id: row.id,
        clienteId: row.cliente_id,
        tipo: row.tipo,
        marcaModelo: row.marca_modelo,
    };
}

function toTrabajo(row: TrabajoRow): Trabajo {
    return {
        id: row.id,
        clienteId: row.cliente_id,
        equipoId: row.equipo_id,
        estado: row.estado,
        problema: row.problema,
        queFalta: row.que_falta,
        notas: row.notas,
        materialesCosto: Number(row.materiales_costo),
        manoObra: Number(row.mano_obra),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function buildTrabajoUpdatePayload(data: Partial<Trabajo>) {
    const payload: Partial<TrabajoRow> = {
        updated_at: new Date().toISOString(),
    };

    if (data.clienteId !== undefined) payload.cliente_id = data.clienteId;
    if (data.equipoId !== undefined) payload.equipo_id = data.equipoId;
    if (data.estado !== undefined) payload.estado = data.estado;
    if (data.problema !== undefined) payload.problema = data.problema;
    if (data.queFalta !== undefined) payload.que_falta = data.queFalta;
    if (data.notas !== undefined) payload.notas = data.notas;
    if (data.materialesCosto !== undefined) payload.materiales_costo = data.materialesCosto;
    if (data.manoObra !== undefined) payload.mano_obra = data.manoObra;

    return payload;
}

function ensureNoError(error: { message: string } | null, context: string) {
    if (error) {
        throw new Error(`${context}: ${error.message}`);
    }
}

export async function listTrabajosPopulated(): Promise<TrabajoPopulated[]> {
    const client = getSupabaseClient();
    if (!client) {
        return mockStore.getTrabajosPopulated();
    }

    const { data: trabajoRowsRaw, error: trabajosError } = await client
        .from("trabajos")
        .select("*")
        .order("updated_at", { ascending: false });
    ensureNoError(trabajosError, "No se pudo obtener la lista de trabajos");

    const trabajoRows = (trabajoRowsRaw ?? []) as TrabajoRow[];
    if (trabajoRows.length === 0) return [];

    const clienteIds = Array.from(new Set(trabajoRows.map((row) => row.cliente_id)));
    const equipoIds = Array.from(new Set(trabajoRows.map((row) => row.equipo_id)));

    const [clientesResult, equiposResult] = await Promise.all([
        client.from("clientes").select("*").in("id", clienteIds),
        client.from("equipos").select("*").in("id", equipoIds),
    ]);

    ensureNoError(clientesResult.error, "No se pudo obtener la lista de clientes");
    ensureNoError(equiposResult.error, "No se pudo obtener la lista de equipos");

    const clientesMap = new Map(
        ((clientesResult.data ?? []) as ClienteRow[]).map((cliente) => [cliente.id, toCliente(cliente)]),
    );
    const equiposMap = new Map(
        ((equiposResult.data ?? []) as EquipoRow[]).map((equipo) => [equipo.id, toEquipo(equipo)]),
    );

    return trabajoRows.flatMap((row) => {
        const cliente = clientesMap.get(row.cliente_id);
        const equipo = equiposMap.get(row.equipo_id);
        if (!cliente || !equipo) return [];

        return [{ ...toTrabajo(row), cliente, equipo }];
    });
}

export async function getTrabajoPopulated(id: string): Promise<TrabajoPopulated | null> {
    const client = getSupabaseClient();
    if (!client) {
        return mockStore.getTrabajo(id);
    }

    const { data: trabajoRowRaw, error: trabajoError } = await client
        .from("trabajos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    ensureNoError(trabajoError, "No se pudo obtener el trabajo");

    if (!trabajoRowRaw) return null;

    const trabajoRow = trabajoRowRaw as TrabajoRow;

    const [clienteResult, equipoResult] = await Promise.all([
        client.from("clientes").select("*").eq("id", trabajoRow.cliente_id).maybeSingle(),
        client.from("equipos").select("*").eq("id", trabajoRow.equipo_id).maybeSingle(),
    ]);

    ensureNoError(clienteResult.error, "No se pudo obtener el cliente del trabajo");
    ensureNoError(equipoResult.error, "No se pudo obtener el equipo del trabajo");

    if (!clienteResult.data || !equipoResult.data) return null;

    return {
        ...toTrabajo(trabajoRow),
        cliente: toCliente(clienteResult.data as ClienteRow),
        equipo: toEquipo(equipoResult.data as EquipoRow),
    };
}

export async function updateTrabajo(id: string, data: Partial<Trabajo>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) {
        mockStore.updateTrabajo(id, data);
        return;
    }

    const payload = buildTrabajoUpdatePayload(data);

    const { error } = await client.from("trabajos").update(payload).eq("id", id);
    ensureNoError(error, "No se pudo actualizar el trabajo");
}

export async function createTrabajoCompleto(data: NewTrabajoInput): Promise<string> {
    const client = getSupabaseClient();
    if (!client) {
        return mockStore.addTrabajoCompleto(data);
    }

    const { data: clienteRaw, error: clienteError } = await client
        .from("clientes")
        .insert({
            nombre: data.nombre,
            telefono: data.telefono,
        })
        .select("id")
        .single();
    ensureNoError(clienteError, "No se pudo crear el cliente");

    const clienteId = (clienteRaw as { id: string }).id;

    const { data: equipoRaw, error: equipoError } = await client
        .from("equipos")
        .insert({
            cliente_id: clienteId,
            tipo: data.tipo,
            marca_modelo: data.marcaModelo,
        })
        .select("id")
        .single();
    ensureNoError(equipoError, "No se pudo crear el equipo");

    const equipoId = (equipoRaw as { id: string }).id;

    const { data: trabajoRaw, error: trabajoError } = await client
        .from("trabajos")
        .insert({
            cliente_id: clienteId,
            equipo_id: equipoId,
            estado: "pendiente",
            problema: data.problema,
            que_falta: "",
            notas: "",
            materiales_costo: 0,
            mano_obra: 0,
        })
        .select("id")
        .single();
    ensureNoError(trabajoError, "No se pudo crear el trabajo");

    return (trabajoRaw as { id: string }).id;
}
