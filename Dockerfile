# ── Etapa 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (cache layer)
COPY backend/package*.json ./
RUN npm ci

# Copiar código fuente y compilar TypeScript
COPY backend/ ./
RUN npm run build

# ── Etapa 2: Producción ────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Solo dependencias de producción
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copiar el build compilado
COPY --from=builder /app/dist ./dist

# Puerto que Railway inyecta via env var PORT
EXPOSE 3002

CMD ["node", "dist/index.js"]
