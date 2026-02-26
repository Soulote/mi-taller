insert into public.clientes (id, nombre, telefono)
values
    ('00000000-0000-0000-0000-000000000001', 'Juan Perez', '1123456789'),
    ('00000000-0000-0000-0000-000000000002', 'Maria Gomez', '1198765432'),
    ('00000000-0000-0000-0000-000000000003', 'Carlos Lopez', '1155667788'),
    ('00000000-0000-0000-0000-000000000004', 'Ana Martinez', '1133445566'),
    ('00000000-0000-0000-0000-000000000005', 'Pedro Sanchez', '1177889900')
on conflict (id) do nothing;

insert into public.equipos (id, cliente_id, tipo, marca_modelo)
values
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Notebook', 'Dell Inspiron 15'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'PC Escritorio', 'Armada Gamer'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Impresora', 'Epson L3150'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Notebook', 'HP Pavilion'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'MacBook', 'Pro M1 2020'),
    ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'All in One', 'Lenovo IdeaCentre')
on conflict (id) do nothing;

insert into public.trabajos (
    id,
    cliente_id,
    equipo_id,
    estado,
    problema,
    que_falta,
    notas,
    materiales_costo,
    mano_obra,
    created_at,
    updated_at
)
values
    (
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'pendiente',
        'No enciende, parpadea luz de carga.',
        '',
        'Trajo cargador original. Tiene rayon en tapa.',
        0,
        0,
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'en_curso',
        'Pantalla azul al jugar 30 mins.',
        'Testear memorias RAM y cambiar pasta termica.',
        'Cliente dice que empezo hace 2 semanas.',
        15000,
        0,
        now() - interval '4 day',
        now() - interval '1 day'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000003',
        'en_curso',
        'No toma papel, hace ruido.',
        'Comprar rodillo de toma de papel.',
        'Mucha tinta derramada adentro.',
        0,
        0,
        now() - interval '1 day',
        now() - interval '1 day'
    ),
    (
        '20000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000004',
        'listo',
        'Instalar Windows y paquete Office.',
        '',
        'Backup de 50GB en disco D realizado exitosamente.',
        0,
        25000,
        now() - interval '4 day',
        now() - interval '4 day'
    ),
    (
        '20000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000005',
        '10000000-0000-0000-0000-000000000005',
        'listo',
        'Cambio de bateria.',
        '',
        'Ciclos de bateria original: 1200. Reemplazada por OEM.',
        85000,
        30000,
        now() - interval '1 day',
        now()
    ),
    (
        '20000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000006',
        'entregado',
        'Lenta, disco al 100%.',
        '',
        'Se cambio HDD por SSD 480GB.',
        35000,
        20000,
        now() - interval '4 day',
        now() - interval '1 day'
    )
on conflict (id) do nothing;
