# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---------- runtime ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# instala solo deps de producción (rápido y liviano)
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
# copia el compilado
COPY --from=build /app/dist ./dist

# Render inyecta PORT. Nest debe escuchar 0.0.0.0:PORT (ya lo tienes en main.ts)
EXPOSE 3000

# Arranca la API (no corremos migraciones)
CMD ["node", "dist/main.js"]
