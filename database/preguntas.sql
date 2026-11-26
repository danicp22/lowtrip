SET NAMES utf8mb4;   -- para que los emojis y las tildes se guarden bien
USE lowtrip;

-- Tipos de pregunta que entiende el chat:
--   texto    -> campo para escribir           opciones: {"ejemplo": "...", "opcional": true/false}
--   opcion   -> se elige una                  opciones: ["A", "B", ...]
--   multiple -> se eligen varias              opciones: ["A", "B", ...]
--   duelo    -> dos tarjetas, esto o aquello  opciones: [{"texto": "...", "icono": "..."}, {...}]
--   rango    -> barra deslizante              opciones: {"min", "max", "paso", "inicial", "unidad", "tramos": [...]}
--   escala   -> puntuación del 1 al N         opciones: {"pasos": 5, "min": "...", "max": "..."}
--   baraja   -> cartas que se deslizan        opciones: [{"texto": "...", "icono": "..."}, ...]
ALTER TABLE preguntas
  MODIFY tipo ENUM('texto','opcion','multiple','duelo','rango','escala','baraja') NOT NULL;

-- Borramos las preguntas anteriores y cargamos las nuevas
DELETE FROM preguntas;
ALTER TABLE preguntas AUTO_INCREMENT = 1;

INSERT INTO preguntas (orden, clave, texto, tipo, opciones) VALUES
(1,  'origen',      '¡Hola! Soy LowTrip. Te hago unas preguntas rápidas y te busco un viaje que no te deje sin blanca. Para empezar, ¿desde qué ciudad sales?',
     'texto', '{"ejemplo": "Por ejemplo, Valencia", "opcional": false}'),
(2,  'compania',    '¿Con quién te escapas?',
     'opcion', '["Solo", "En pareja", "Con amigos", "En familia"]'),
(3,  'cuando',      '¿Cuándo te viene bien?',
     'opcion', '["Este mes", "El mes que viene", "En los próximos 3 meses", "Me da igual, soy flexible"]'),
(4,  'dias',        '¿Cuántos días puedes desaparecer?',
     'opcion', '["Un fin de semana", "3 o 4 días", "Una semana", "Más de una semana"]'),
(5,  'presupuesto', 'Ahora lo importante: ¿cuánto quieres gastarte como máximo, sin contar caprichos?',
     'rango', '{"min": 50, "max": 1000, "paso": 25, "inicial": 300, "unidad": "€", "tramos": [{"hasta": 150, "texto": "Modo mochilero"}, {"hasta": 400, "texto": "Escapada sin agobios"}, {"hasta": 700, "texto": "Viaje con margen"}, {"hasta": 1000, "texto": "Aquí hay alegría"}]}'),
(6,  'transporte',  '¿Cómo te mueves? Marca todo lo que te valga.',
     'multiple', '["Avión low cost", "Tren", "Autobús", "Coche compartido"]'),
(7,  'equipaje',    'Pregunta trampa: con solo equipaje de cabina los vuelos salen mucho más baratos. ¿Te apañas?',
     'duelo', '[{"texto": "Solo mochila", "icono": "🎒"}, {"texto": "Necesito maleta", "icono": "🧳"}]'),
(8,  'paisaje',     'Ahora rápido, sin pensarlo mucho. ¿Playa o montaña?',
     'duelo', '[{"texto": "Playa", "icono": "🏖️"}, {"texto": "Montaña", "icono": "🏔️"}]'),
(9,  'entorno',     '¿Ciudad o pueblo?',
     'duelo', '[{"texto": "Ciudad", "icono": "🏙️"}, {"texto": "Pueblo", "icono": "🏡"}]'),
(10, 'horario',     '¿Madrugar o trasnochar?',
     'duelo', '[{"texto": "Madrugar", "icono": "🌅"}, {"texto": "Trasnochar", "icono": "🌙"}]'),
(11, 'intereses',   'Te voy a enseñar planes. Desliza a la derecha si te apuntas y a la izquierda si pasas.',
     'baraja', '[{"texto": "Museos y monumentos", "icono": "🏛️"}, {"texto": "Fiesta hasta que cierren", "icono": "🪩"}, {"texto": "Ruta por la montaña", "icono": "🥾"}, {"texto": "Ir de tapas", "icono": "🍤"}, {"texto": "Conciertos y festivales", "icono": "🎸"}, {"texto": "Deportes de aventura", "icono": "🪂"}, {"texto": "Mercadillos y tiendas", "icono": "🛍️"}, {"texto": "Atardecer en un mirador", "icono": "🌄"}]'),
(12, 'alojamiento', '¿Dónde duermes sin problema?',
     'opcion', '["Hostal", "Apartamento compartido", "Hotel barato", "Donde sea, solo es para dormir"]'),
(13, 'comida',      '¿Y para comer?',
     'duelo', '[{"texto": "Comer fuera", "icono": "🍽️"}, {"texto": "Súper y cocinar", "icono": "🛒"}]'),
(14, 'zona',        '¿Te quedas en España o cruzas la frontera?',
     'opcion', '["España", "Europa", "Me da igual"]'),
(15, 'ritmo',       '¿Qué ritmo llevas cuando viajas?',
     'escala', '{"pasos": 5, "min": "Sofá y siesta", "max": "Verlo todo en 48 horas"}'),
(16, 'evitar',      'Última: ¿hay algún sitio donde ya hayas estado o al que no quieras ir?',
     'texto', '{"ejemplo": "Por ejemplo, París", "opcional": true}');