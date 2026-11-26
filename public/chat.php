<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planifica tu viaje | LowTrip</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/comun.css">
    <link rel="stylesheet" href="css/chat.css">
</head>
<body>
    <header class="cabecera">
        <a href="index.php" class="logo">LowTrip</a>
        <p class="lema">Viaja más, gasta menos</p>
    </header>

    <main class="planificador">

        <!-- Billete: se va rellenando con las respuestas -->
        <aside class="billete" aria-label="Resumen de tu viaje">
            <div class="billete__cuerpo">
                <div class="ruta">
                    <div class="ruta__punto">
                        <span class="ruta__etiqueta">Desde</span>
                        <span class="ruta__codigo" id="codigo-origen">···</span>
                        <span class="ruta__ciudad" id="ciudad-origen">Tu ciudad</span>
                    </div>

                    <div class="ruta__trayecto" id="trayecto" aria-hidden="true">
                        <svg class="ruta__avion" viewBox="0 0 24 24">
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
                        </svg>
                    </div>

                    <div class="ruta__punto ruta__punto--destino">
                        <span class="ruta__etiqueta">Hasta</span>
                        <span class="ruta__codigo">???</span>
                        <span class="ruta__ciudad" id="ciudad-destino">Por descubrir</span>
                    </div>
                </div>

                <dl class="datos">
                    <div class="dato"><dt>Cuándo</dt><dd data-campo="cuando">—</dd></div>
                    <div class="dato"><dt>Duración</dt><dd data-campo="dias">—</dd></div>
                    <div class="dato"><dt>Presupuesto</dt><dd data-campo="presupuesto">—</dd></div>
                    <div class="dato"><dt>Viajas</dt><dd data-campo="compania">—</dd></div>
                    <div class="dato"><dt>Equipaje</dt><dd data-campo="equipaje">—</dd></div>
                    <div class="dato"><dt>Dormir en</dt><dd data-campo="alojamiento">—</dd></div>
                    <div class="dato"><dt>Zona</dt><dd data-campo="zona">—</dd></div>
                    <div class="dato"><dt>Ritmo</dt><dd data-campo="ritmo">—</dd></div>
                    <div class="dato dato--ancho"><dt>Te mueves en</dt><dd data-campo="transporte">—</dd></div>
                    <div class="dato dato--ancho"><dt>Tu estilo</dt><dd data-campo="estilo">—</dd></div>
                    <div class="dato dato--ancho"><dt>No puede faltar</dt><dd data-campo="intereses">—</dd></div>
                </dl>
            </div>

            <div class="billete__talon" id="talon">
                <span class="talon__progreso" id="progreso">Preparando tu billete…</span>
                <span class="sello" id="sello" hidden>Listo para despegar</span>
                <div class="talon__barras" aria-hidden="true"></div>
            </div>
        </aside>

        <!-- Conversación -->
        <section class="chat" aria-label="Conversación con LowTrip">
            <div id="mensajes" class="chat__mensajes" aria-live="polite"></div>
            <div id="zona-respuesta" class="chat__respuesta"></div>
            <p class="chat__aviso">Las recomendaciones las genera una inteligencia artificial. Son orientativas: compruébalas antes de reservar.</p>
        </section>

    </main>

    <script src="js/chat.js"></script>
</body>
</html>