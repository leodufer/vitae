# Guía de Despliegue con Docker - CV Builder (Vitae)

Esta guía detalla los pasos necesarios para desplegar la aplicación en un entorno de servidor utilizando Docker y Docker Compose.

## 1. Requisitos Previos
Asegúrate de tener instalados los siguientes componentes en tu servidor:
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- Acceso a la terminal con permisos de administrador (sudo).

## 2. Archivos de Configuración
Se han creado los siguientes archivos en la raíz del proyecto:

### Dockerfile
Define la imagen de la aplicación Node.js, utiliza `node:18-alpine` para mayor ligereza e instala solo las dependencias de producción.

### docker-compose.yml
Orquestra dos contenedores:
1.  **db**: Contenedor de MySQL 8.0.
    -   Configura automáticamente la base de datos `vitae_db`.
    -   Importa el esquema inicial desde `schema.sql`.
    -   Persiste los datos en un volumen llamado `db_data`.
2.  **app**: El contenedor de la aplicación Node.js.
    -   Se construye a partir del `Dockerfile`.
    -   Se conecta al contenedor de la base de datos.
    -   Expone el puerto `3000`.

## 3. Pasos para el Despliegue

### Paso A: Clonar el Repositorio
Si aún no tienes el código en el servidor:
```bash
git clone <url-del-repositorio>
cd vitae
```

### Paso B: Configurar Variables de Entorno
Aunque el archivo `docker-compose.yml` tiene valores por defecto, se recomienda crear un archivo `.env` en el servidor o editar las variables en el `docker-compose.yml` para producción:
- Cambia `MYSQL_ROOT_PASSWORD`.
- Cambia `JWT_SECRET` por una cadena aleatoria y segura.

### Paso C: Iniciar los Contenedores
Ejecuta el siguiente comando en la raíz del proyecto:
```bash
docker compose up -d --build
```
-   `-d`: Ejecuta en segundo plano (detached mode).
-   `--build`: Fuerza la construcción de la imagen de la aplicación.

### Paso D: Verificar el Estado
Comprueba que ambos contenedores estén corriendo:
```bash
docker-compose ps
```

Puedes ver los logs en tiempo real para verificar que la conexión a la base de datos sea exitosa:
```bash
docker-compose logs -f app
```

## 4. Acceso a la Aplicación
Una vez desplegado, la aplicación estará disponible en:
`http://<IP-DEL-SERVIDOR>:3000`

## 5. Mantenimiento

### Detener la aplicación
```bash
docker-compose down
```

### Actualizar la aplicación (tras cambios en el código)
```bash
git pull
docker-compose up -d --build
```

### Backup de la base de datos
```bash
docker-compose exec db mysqldump -u root -p'tu_password' vitae_db > backup.sql
```

> [!IMPORTANT]
> El archivo `schema.sql` se carga automáticamente la **primera vez** que se crea el volumen de la base de datos. Si realizas cambios en el esquema posteriormente, deberás aplicarlos manualmente o borrar el volumen con `docker-compose down -v` (precaución: esto borra los datos).
