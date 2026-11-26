CREATE DATABASE IF NOT EXISTS lowtrip
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lowtrip;
SET NAMES utf8mb4;

-- Planes: Básico (gratis, con límite) y Pro
CREATE TABLE planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  precio DECIMAL(6,2) NOT NULL DEFAULT 0,
  limite_recomendaciones INT NULL  -- NULL = sin límite
);

-- Usuarios registrados
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario',
  plan_id INT NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES planes(id)
);

-- Cada vez que un usuario empieza el chat
CREATE TABLE conversaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  estado ENUM('en_curso','terminada') NOT NULL DEFAULT 'en_curso',
  creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Las preguntas que hace el chat
CREATE TABLE preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden INT NOT NULL,
  clave VARCHAR(30) NOT NULL UNIQUE,   -- ej: 'origen', 'presupuesto'
  texto VARCHAR(255) NOT NULL,
  tipo ENUM('texto','opcion','multiple','duelo','rango','escala','baraja') NOT NULL,
  opciones JSON NULL                   -- configuración según el tipo de pregunta
);

-- Lo que responde el usuario a cada pregunta
CREATE TABLE respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  pregunta_id INT NOT NULL,
  valor TEXT NOT NULL,
  UNIQUE (conversacion_id, pregunta_id),
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (pregunta_id) REFERENCES preguntas(id)
);

-- Los viajes que recomienda la IA
CREATE TABLE viajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  conversacion_id INT NOT NULL,
  destino VARCHAR(150) NOT NULL,
  resultado JSON NOT NULL,             -- la respuesta completa de la IA
  coste_estimado DECIMAL(8,2) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
);

INSERT INTO planes (nombre, precio, limite_recomendaciones) VALUES
  ('Básico', 0, 3),
  ('Pro', 4.99, NULL);
