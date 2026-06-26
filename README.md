# MelaminaPro - API REST

API REST desarrollada en Node.js con Express, TypeScript y PostgreSQL para la gestión de cotizaciones y pagos de una tienda de muebles a medida.

## Estructura del proyecto

El backend se encuentra en la carpeta \`backend/\`. Si deseas añadir un frontend, créalo en la carpeta \`frontend/\`.

## Requisitos previos

- Node.js (v18+)
- PostgreSQL (v14+)
- npm o yarn

## Instalación y Configuración del Backend

1. Navega a la carpeta backend:
\`\`\`bash
cd backend
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configura las variables de entorno. Renombra o copia el archivo \`.env.example\` a \`.env\`:
\`\`\`bash
cp .env.example .env
\`\`\`

Y edita las variables en \`.env\` de acuerdo a tu entorno (Base de datos, claves de Culqi, SMTP de correo).

4. Configura la Base de Datos:
Abre tu cliente de base de datos o consola PostgreSQL, crea la base de datos \`melamina\` y ejecuta el archivo SQL para crear las tablas e insertar productos de prueba.

Para ejecutar el schema desde terminal (si tienes psql configurado):
\`\`\`bash
psql -U usuario -d melamina -f src/db/schema.sql
\`\`\`

5. Levanta el servidor en modo desarrollo:
\`\`\`bash
npm run dev
\`\`\`

El servidor correrá en \`http://localhost:3001\`.
Puedes probar el estado con \`http://localhost:3001/api/health\`

## Scripts Disponibles

- \`npm run dev\`: Inicia el servidor con recarga automática usando ts-node-dev.
- \`npm run build\`: Compila el código TypeScript a JavaScript en la carpeta \`dist/\`.
- \`npm start\`: Inicia el servidor usando el código compilado (ideal para producción).

## API Endpoints principales

- \`GET /api/health\`: Verificación de estado.
- \`POST /api/cotizaciones\`: Crear nueva cotización.
- \`GET /api/cotizaciones\`: Listar cotizaciones (requiere \`X-Admin-Key\`).
- \`GET /api/productos\`: Listar productos activos.
- \`POST /api/pagos/crear\`: Procesar un pago con token de Culqi.

Para las rutas de administrador, debes enviar el header \`X-Admin-Key\` con el valor configurado en tu \`.env\`.
