<?php
require __DIR__ . '/../app/conexion.php';

$planes = conectar()->query('SELECT nombre, precio FROM planes')->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>LowTrip</title>
</head>
<body>
    <h1>LowTrip</h1>
    <p>Conexión con la base de datos correcta. Planes disponibles:</p>
    <ul>
        <?php foreach ($planes as $plan): ?>
            <li><?= htmlspecialchars($plan['nombre']) ?>: <?= $plan['precio'] ?> €</li>
        <?php endforeach; ?>
    </ul>
    <p><a href="chat.php">Probar el chat</a></p>
</body>
</html>
