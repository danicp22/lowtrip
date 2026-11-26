USE lowtrip;

-- Preguntas del chat. Para cambiar el chat basta con modificar estas filas.
INSERT INTO preguntas (orden, clave, texto, tipo, opciones) VALUES
(1, 'origen',      '¡Hola! Soy el asistente de LowTrip y te voy a ayudar a encontrar un viaje barato. Para empezar, ¿desde qué ciudad sales?', 'texto', NULL),
(2, 'cuando',      '¿Cuándo te gustaría viajar?', 'opcion', '["Este mes", "El mes que viene", "En los próximos 3 meses", "Me da igual, soy flexible"]'),
(3, 'dias',        '¿Cuántos días tienes?', 'opcion', '["Un fin de semana", "3 o 4 días", "Una semana", "Más de una semana"]'),
(4, 'presupuesto', '¿Cuánto quieres gastarte como máximo, sin contar compras?', 'opcion', '["Menos de 150 €", "Entre 150 y 300 €", "Entre 300 y 600 €", "Más de 600 €"]'),
(5, 'compania',    '¿Con quién viajas?', 'opcion', '["Solo", "En pareja", "Con amigos"]'),
(6, 'intereses',   '¿Qué tipo de viaje te apetece? Puedes elegir varias opciones.', 'multiple', '["Cultura", "Fiesta", "Naturaleza", "Playa", "Gastronomía"]'),
(7, 'alojamiento', '¿Dónde te importa dormir?', 'opcion', '["Hostal", "Apartamento compartido", "Hotel barato", "Me da igual"]'),
(8, 'zona',        '¿Prefieres quedarte en España o salir fuera?', 'opcion', '["España", "Europa", "Me da igual"]'),
(9, 'ritmo',       'Última pregunta: ¿qué ritmo de viaje prefieres?', 'opcion', '["Tranquilo", "Aprovechar al máximo"]');