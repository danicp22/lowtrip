<?php
require_once __DIR__ . '/conexion.php';

/**
 * Devuelve los planes ordenados de más barato a más caro.
 */
function obtenerPlanes(): array
{
    $sql = 'SELECT id, nombre, precio, limite_recomendaciones FROM planes ORDER BY precio';
    return conectar()->query($sql)->fetchAll();
}