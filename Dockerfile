# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar solo el backend
COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
