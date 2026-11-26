<?php
function conectar(): PDO
{
    static $pdo = null;   // se conecta una sola vez aunque se llame muchas

    if ($pdo === null) {
        $config = require __DIR__ . '/../config/config.php';
        $db = $config['db'];

        $dsn = "mysql:host={$db['host']};dbname={$db['nombre']};charset=utf8mb4";

        $pdo = new PDO($dsn, $db['usuario'], $db['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}
