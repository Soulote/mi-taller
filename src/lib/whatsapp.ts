export function buildWhatsAppMessage({
    nombre,
    materiales,
    manoObra,
    total
}: {
    nombre: string;
    materiales: number;
    manoObra: number;
    total: number;
}) {
    return `Hola ${nombre},

Tu equipo se encuentra listo.

Costo de materiales: $${materiales}
Mano de obra: $${manoObra}
Total a pagar: $${total}

Podés retirarlo cuando quieras.`;
}

export function buildWhatsAppUrl({
    telefono,
    message
}: {
    telefono: string;
    message: string;
}) {
    const cleanPhone = telefono.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
