import { JobStatus } from "@/components/ui";

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

const now = new Date();
const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();

export const initialClientes: Cliente[] = [
    { id: "c1", nombre: "Juan Pérez", telefono: "1123456789" },
    { id: "c2", nombre: "María Gómez", telefono: "1198765432" },
    { id: "c3", nombre: "Carlos López", telefono: "1155667788" },
    { id: "c4", nombre: "Ana Martínez", telefono: "1133445566" },
    { id: "c5", nombre: "Pedro Sánchez", telefono: "1177889900" },
];

export const initialEquipos: Equipo[] = [
    { id: "e1", clienteId: "c1", tipo: "Notebook", marcaModelo: "Dell Inspiron 15" },
    { id: "e2", clienteId: "c2", tipo: "PC Escritorio", marcaModelo: "Armada Gamer" },
    { id: "e3", clienteId: "c3", tipo: "Impresora", marcaModelo: "Epson L3150" },
    { id: "e4", clienteId: "c4", tipo: "Notebook", marcaModelo: "HP Pavilion" },
    { id: "e5", clienteId: "c5", tipo: "MacBook", marcaModelo: "Pro M1 2020" },
    { id: "e6", clienteId: "c1", tipo: "All in One", marcaModelo: "Lenovo IdeaCentre" },
];

export const initialTrabajos: Trabajo[] = [
    // 1 pendiente
    {
        id: "t1",
        clienteId: "c1",
        equipoId: "e1",
        estado: "pendiente",
        problema: "No enciende, parpadea luz de carga.",
        queFalta: "",
        notas: "Trajo cargador original. Tiene rayón en tapa.",
        materialesCosto: 0,
        manoObra: 0,
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo,
    },
    // 2 en curso
    {
        id: "t2",
        clienteId: "c2",
        equipoId: "e2",
        estado: "en_curso",
        problema: "Pantalla azul al jugar 30 mins.",
        queFalta: "Testear memorias RAM y cambiar pasta térmica.",
        notas: "Cliente dice que empezó hace 2 semanas.",
        materialesCosto: 15000,
        manoObra: 0,
        createdAt: fourDaysAgo,
        updatedAt: oneDayAgo,
    },
    {
        id: "t3",
        clienteId: "c3",
        equipoId: "e3",
        estado: "en_curso",
        problema: "No toma papel, hace ruido.",
        queFalta: "Comprar rodillo de toma de papel.",
        notas: "Mucha tinta derramada adentro.",
        materialesCosto: 0,
        manoObra: 0,
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo,
    },
    // 2 listo (uno hace 4 días)
    {
        id: "t4",
        clienteId: "c4",
        equipoId: "e4",
        estado: "listo",
        problema: "Instalar Windows y paquete Office.",
        queFalta: "",
        notas: "Backup de 50GB en disco D realizado exitosamente.",
        materialesCosto: 0,
        manoObra: 25000,
        createdAt: fourDaysAgo,
        updatedAt: fourDaysAgo, // Listo hace 4 días
    },
    {
        id: "t5",
        clienteId: "c5",
        equipoId: "e5",
        estado: "listo",
        problema: "Cambio de batería.",
        queFalta: "",
        notas: "Ciclos de batería original: 1200. Reemplazada por OEM.",
        materialesCosto: 85000,
        manoObra: 30000,
        createdAt: oneDayAgo,
        updatedAt: new Date().toISOString(),
    },
    // 1 entregado
    {
        id: "t6",
        clienteId: "c1",
        equipoId: "e6",
        estado: "entregado",
        problema: "Lenta, disco al 100%.",
        queFalta: "",
        notas: "Se cambió HDD por SSD 480GB.",
        materialesCosto: 35000,
        manoObra: 20000,
        createdAt: fourDaysAgo,
        updatedAt: oneDayAgo,
    }
];
