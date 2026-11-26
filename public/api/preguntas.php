<?php
// Devuelve las preguntas del chat en formato JSON para que las lea JavaScript
require __DIR__ . '/../../app/preguntas.php';

header('Content-Type: application/json; charset=utf-8');

try {
    echo json_encode(obtenerPreguntas(), JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se han podido cargar las preguntas'], JSON_UNESCAPED_UNICODE);
}