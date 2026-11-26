# LowTrip

Planificador de viajes baratos para jóvenes con un chat e inteligencia artificial. Proyecto final de 2º DAW.

## Puesta en marcha (local)

1. Crear el usuario de MySQL:
   ```sql
   CREATE USER 'lowtrip'@'localhost' IDENTIFIED BY 'tu_contraseña';
   GRANT ALL PRIVILEGES ON lowtrip.* TO 'lowtrip'@'localhost';
   ```
2. Importar la base de datos: `sudo mysql < database/lowtrip.sql`
3. Copiar `config/config.example.php` como `config/config.php` y poner la contraseña.
4. Arrancar el servidor: `php -S localhost:8000 -t public`
5. Abrir http://localhost:8000
