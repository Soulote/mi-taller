import { Cliente, Equipo, Trabajo, initialClientes, initialEquipos, initialTrabajos } from './mockData';

// Simple in-memory global state for the session
class Store {
    clientes: Cliente[] = [...initialClientes];
    equipos: Equipo[] = [...initialEquipos];
    trabajos: Trabajo[] = [...initialTrabajos];

    getTrabajosPopulated() {
        return this.trabajos.map(t => ({
            ...t,
            cliente: this.clientes.find(c => c.id === t.clienteId)!,
            equipo: this.equipos.find(e => e.id === t.equipoId)!,
        }));
    }

    getTrabajo(id: string) {
        const t = this.trabajos.find(x => x.id === id);
        if (!t) return null;
        return {
            ...t,
            cliente: this.clientes.find(c => c.id === t.clienteId)!,
            equipo: this.equipos.find(e => e.id === t.equipoId)!,
        };
    }

    updateTrabajo(id: string, data: Partial<Trabajo>) {
        const index = this.trabajos.findIndex(t => t.id === id);
        if (index !== -1) {
            this.trabajos[index] = { ...this.trabajos[index], ...data, updatedAt: new Date().toISOString() };
        }
    }

    addTrabajoCompleto(data: {
        nombre: string;
        telefono: string;
        tipo: string;
        marcaModelo: string;
        problema: string;
    }) {
        const clienteId = `c${Date.now()}`;
        const equipoId = `e${Date.now()}`;
        const trabajoId = `t${Date.now()}`;

        this.clientes.push({
            id: clienteId,
            nombre: data.nombre,
            telefono: data.telefono,
        });

        this.equipos.push({
            id: equipoId,
            clienteId,
            tipo: data.tipo,
            marcaModelo: data.marcaModelo,
        });

        const nuevoTrabajo: Trabajo = {
            id: trabajoId,
            clienteId,
            equipoId,
            estado: 'pendiente',
            problema: data.problema,
            queFalta: '',
            notas: '',
            materialesCosto: 0,
            manoObra: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.trabajos.push(nuevoTrabajo);
        return trabajoId;
    }
}

// Global singleton for the Next.js development server
const storeGlobal = global as typeof global & { mockStore?: Store };
export const mockStore = storeGlobal.mockStore || new Store();
if (process.env.NODE_ENV !== 'production') {
    storeGlobal.mockStore = mockStore;
}
