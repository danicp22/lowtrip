<?php
require __DIR__ . '/../app/planes.php';

// Ventajas de cada plan (lo que se muestra en la portada)
$ventajas = [
    'Básico' => [
        'Destino, ciudades y plan día a día',
        'Tus viajes guardados en tu cuenta',
    ],
    'Pro' => [
        'Todo lo del plan Básico',
        'Los vuelos más baratos para tus fechas',
        'Alojamiento y restaurantes económicos',
        'El coste total del viaje, sumado',
    ],
];

try {
    $planes = obtenerPlanes();
} catch (PDOException $e) {
    $planes = [];   // si falla la base de datos, la portada se ve igual pero sin los planes
}

// 0 -> "Gratis", 4.99 -> "4,99 €"
function formatearPrecio(float $precio): string
{
    return $precio == 0 ? 'Gratis' : number_format($precio, 2, ',', '.') . ' €';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LowTrip | Viajes baratos planificados con IA</title>
    <meta name="description" content="Responde unas preguntas rápidas y LowTrip te propone destino, ciudades y planes para viajar gastando lo mínimo.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/comun.css">
    <link rel="stylesheet" href="css/inicio.css">
</head>
<body>

    <header class="menu">
        <a href="index.php" class="logo">LowTrip</a>
        <nav class="menu__enlaces" aria-label="Principal">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#planes">Planes</a>
            <a href="chat.php" class="boton boton--azul">Planificar viaje</a>
        </nav>
    </header>

    <main>

        <!-- Portada -->
        <section class="portada">
            <div class="portada__texto">
                <h1>Tu próximo viaje cabe en tu presupuesto</h1>
                <p class="portada__entradilla">
                    Responde unas preguntas rápidas y LowTrip te propone adónde ir, qué ciudades ver
                    y qué hacer cada día, buscando siempre la opción más barata.
                </p>
                <div class="portada__acciones">
                    <a href="chat.php" class="boton boton--azul boton--grande">Planificar mi viaje</a>
                    <span class="portada__nota">Gratis y sin tarjeta</span>
                </div>
            </div>

            <!-- Billete de ejemplo: el destino va cambiando como en un panel de aeropuerto -->
            <div class="billete-ejemplo" aria-label="Ejemplo: desde Valencia, con 150 euros y un fin de semana">
                <div class="billete-ejemplo__cuerpo">
                    <div class="billete-ejemplo__ruta">
                        <div>
                            <span class="etiqueta">Desde</span>
                            <span class="codigo">VAL</span>
                            <span class="ciudad">Valencia</span>
                        </div>
                        <svg class="billete-ejemplo__avion" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
                        </svg>
                        <div class="billete-ejemplo__destino">
                            <span class="etiqueta">Hasta</span>
                            <span class="codigo codigo--destino" id="panel-codigo" aria-hidden="true">
                                <span class="letra">?</span><span class="letra">?</span><span class="letra">?</span>
                            </span>
                            <span class="ciudad" id="panel-ciudad">Por descubrir</span>
                        </div>
                    </div>

                    <dl class="billete-ejemplo__datos">
                        <div><dt>Presupuesto</dt><dd>Hasta 150 €</dd></div>
                        <div><dt>Duración</dt><dd>Un fin de semana</dd></div>
                        <div><dt>Viajas</dt><dd>Con amigos</dd></div>
                        <div><dt>Equipaje</dt><dd>Solo mochila</dd></div>
                    </dl>
                </div>
                <div class="billete-ejemplo__talon">
                    <span>Viaja más, gasta menos</span>
                    <span class="barras" aria-hidden="true"></span>
                </div>
            </div>
        </section>

        <!-- Cómo funciona: tres paradas de un mismo trayecto -->
        <section class="seccion" id="como-funciona">
            <h2>Cómo funciona</h2>

            <ol class="trayecto">
                <li class="parada">
                    <span class="parada__marca" aria-hidden="true">1</span>
                    <h3>Cuéntanos tu viaje</h3>
                    <p>Días, presupuesto, con quién vas y qué te apetece. Son preguntas rápidas y casi todas se responden de un toque.</p>
                </li>
                <li class="parada">
                    <span class="parada__marca" aria-hidden="true">2</span>
                    <h3>La IA elige destino</h3>
                    <p>Con tus respuestas propone adónde ir, qué ciudades ver y qué hacer cada día, priorizando lo más barato.</p>
                </li>
                <li class="parada">
                    <span class="parada__marca parada__marca--final" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>
                    </span>
                    <h3>Te lo guardas y te vas</h3>
                    <p>El viaje queda en tu cuenta para consultarlo cuando quieras, también desde el móvil.</p>
                </li>
            </ol>
        </section>

        <!-- Planes: salen de la base de datos -->
        <section class="seccion" id="planes">
            <h2>Planes</h2>

            <?php if (empty($planes)): ?>
                <p class="aviso">Ahora mismo no se pueden mostrar los planes. Vuelve a intentarlo en un rato.</p>
            <?php else: ?>
                <div class="planes">
                    <?php foreach ($planes as $plan): ?>
                        <?php $esPro = $plan['limite_recomendaciones'] === null; ?>
                        <article class="plan <?= $esPro ? 'plan--pro' : '' ?>">
                            <div class="plan__cuerpo">
                                <h3 class="plan__nombre"><?= htmlspecialchars($plan['nombre']) ?></h3>
                                <p class="plan__precio">
                                    <?= formatearPrecio((float) $plan['precio']) ?>
                                    <?php if ($plan['precio'] > 0): ?><small>al mes</small><?php endif; ?>
                                </p>

                                <ul class="plan__ventajas">
                                    <li>
                                        <?= $esPro
                                            ? 'Viajes sin límite'
                                            : (int) $plan['limite_recomendaciones'] . ' viajes al mes' ?>
                                    </li>
                                    <?php foreach ($ventajas[$plan['nombre']] ?? [] as $ventaja): ?>
                                        <li><?= htmlspecialchars($ventaja) ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>

                            <div class="plan__talon">
                                <?php if ($esPro): ?>
                                    <span class="boton boton--apagado">Muy pronto</span>
                                <?php else: ?>
                                    <a href="chat.php" class="boton boton--azul">Empezar gratis</a>
                                <?php endif; ?>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>

    </main>

    <footer class="pie">
        <a href="index.php" class="logo">LowTrip</a>
        <p>Proyecto final del ciclo de Desarrollo de Aplicaciones Web. Las recomendaciones las genera una inteligencia artificial y son orientativas.</p>
    </footer>

    <script src="js/inicio.js"></script>
</body>
</html>