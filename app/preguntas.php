<?php
require_once __DIR__ . '/conexion.php';

/**
 * Devuelve las preguntas del chat ordenadas, con sus opciones ya convertidas en array.
 */
function obtenerPreguntas(): array
{
    $sql = 'SELECT id, clave, texto, tipo, opciones FROM preguntas ORDER BY orden';
    $preguntas = conectar()->query($sql)->fetchAll();

    foreach ($preguntas as &$pregunta) {
        // En la base de datos las opciones son texto JSON; aquí las pasamos a array
        $pregunta['opciones'] = $pregunta['opciones'] ? json_decode($pregunta['opciones'], true) : [];
    }
    unset($pregunta);

    return $preguntas;
}