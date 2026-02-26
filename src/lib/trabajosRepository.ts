import type { JobStatus } from "@/components/ui";
import { getSupabaseBrowserClient } from "./supabase";

export interface Cliente {
    id: string;
    nombre: string;
    telefono: string;
}

export interface Equipo {
    id: string;
    clienteId: string;
    tipo: string;
    marcaModelo: string;
}

export interface Trabajo {
    id: string;
    clienteId: string;
    equipoId: string;
    estado: JobStatus;
    problema: string;
    queFalta: string;
    notas: string;
    materialesCosto: number;
    manoObra: number;
    createdAt: string;
    updatedAt: string;
}

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

function failWithSupabaseError(context: string, error: unknown): never {
    console.error(`[supabase] ${context}`, error);

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string") {
            throw new Error(`${context}: ${message}`);
        }
    }

    throw new Error(context);
}

function assertNoError(context: string, error: unknown) {
    if (error) {
        failWithSupabaseError(context, error);
    }
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

    if (data.estado !== undefined) payload.estado = data.estado;
    if (data.problema !== undefined) payload.problema = data.problema;
    if (data.queFalta !== undefined) payload.que_falta = data.queFalta;
    if (data.notas !== undefined) payload.notas = data.notas;
    if (data.materialesCosto !== undefined) payload.materiales_costo = data.materialesCosto;
    if (data.manoObra !== undefined) payload.mano_obra = data.manoObra;

    return payload;
}

export async function listTrabajosPopulated(): Promise<TrabajoPopulated[]> {
    const client = getSupabaseBrowserClient();

    const { data: trabajosRaw, error: trabajosError } = await client
        .from("trabajos")
        .select("*")
        .order("created_at", { ascending: false });

    assertNoError("No se pudo obtener la lista de trabajos", trabajosError);

    const trabajos = (trabajosRaw ?? []) as TrabajoRow[];
    if (trabajos.length === 0) return [];

    const clienteIds = Array.from(new Set(trabajos.map((row) => row.cliente_id)));
    const equipoIds = Array.from(new Set(trabajos.map((row) => row.equipo_id)));

    const [clientesResult, equiposResult] = await Promise.all([
        client.from("clientes").select("*").in("id", clienteIds),
        client.from("equipos").select("*").in("id", equipoIds),
    ]);

    assertNoError("No se pudo obtener la lista de clientes", clientesResult.error);
    assertNoError("No se pudo obtener la lista de equipos", equiposResult.error);

    const clientesMap = new Map(
        ((clientesResult.data ?? []) as ClienteRow[]).map((cliente) => [cliente.id, toCliente(cliente)]),
    );
    const equiposMap = new Map(
        ((equiposResult.data ?? []) as EquipoRow[]).map((equipo) => [equipo.id, toEquipo(equipo)]),
    );

    return trabajos.map((row) => {
        const cliente = clientesMap.get(row.cliente_id);
        const equipo = equiposMap.get(row.equipo_id);

        if (!cliente || !equipo) {
            failWithSupabaseError("Relaciones incompletas al leer trabajos", {
                trabajoId: row.id,
                clienteId: row.cliente_id,
                equipoId: row.equipo_id,
            });
        }

        return {
            ...toTrabajo(row),
            cliente,
            equipo,
        };
    });
}

export async function getTrabajoPopulated(id: string): Promise<TrabajoPopulated | null> {
    const client = getSupabaseBrowserClient();

    const { data: trabajoRaw, error: trabajoError } = await client
        .from("trabajos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    assertNoError("No se pudo obtener el trabajo", trabajoError);

    if (!trabajoRaw) {
        return null;
    }

    const trabajo = trabajoRaw as TrabajoRow;

    const [clienteResult, equipoResult] = await Promise.all([
        client.from("clientes").select("*").eq("id", trabajo.cliente_id).single(),
        client.from("equipos").select("*").eq("id", trabajo.equipo_id).single(),
    ]);

    assertNoError("No se pudo obtener el cliente del trabajo", clienteResult.error);
    assertNoError("No se pudo obtener el equipo del trabajo", equipoResult.error);

    return {
        ...toTrabajo(trabajo),
        cliente: toCliente(clienteResult.data as ClienteRow),
        equipo: toEquipo(equipoResult.data as EquipoRow),
    };
}

export async function updateTrabajo(id: string, data: Partial<Trabajo>): Promise<Trabajo> {
    const client = getSupabaseBrowserClient();
    const payload = buildTrabajoUpdatePayload(data);

    const { data: updatedRowRaw, error } = await client
        .from("trabajos")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    assertNoError("No se pudo actualizar el trabajo", error);

    return toTrabajo(updatedRowRaw as TrabajoRow);
}

export async function createTrabajoCompleto(data: NewTrabajoInput): Promise<string> {
    const client = getSupabaseBrowserClient();

    const { data: clienteExistenteRaw, error: buscarClienteError } = await client
        .from("clientes")
        .select("*")
        .eq("telefono", data.telefono)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    assertNoError("No se pudo buscar cliente por telefono", buscarClienteError);

    const clienteExistente = clienteExistenteRaw as ClienteRow | null;

    let clienteId = clienteExistente?.id;

    if (!clienteId) {
        const { data: nuevoClienteRaw, error: crearClienteError } = await client
            .from("clientes")
            .insert({
                nombre: data.nombre,
                telefono: data.telefono,
            })
            .select("id")
            .single();

        assertNoError("No se pudo crear el cliente", crearClienteError);

        clienteId = (nuevoClienteRaw as { id: string }).id;
    } else if (clienteExistente && clienteExistente.nombre !== data.nombre) {
        const { error: actualizarClienteError } = await client
            .from("clientes")
            .update({ nombre: data.nombre })
            .eq("id", clienteId);

        assertNoError("No se pudo actualizar el nombre del cliente", actualizarClienteError);
    }

    const { data: equipoRaw, error: equipoError } = await client
        .from("equipos")
        .insert({
            cliente_id: clienteId,
            tipo: data.tipo,
            marca_modelo: data.marcaModelo,
        })
        .select("id")
        .single();

    assertNoError("No se pudo crear el equipo", equipoError);

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

    assertNoError("No se pudo crear el trabajo", trabajoError);

    return (trabajoRaw as { id: string }).id;
}
