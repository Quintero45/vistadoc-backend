# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
# Necesario para resolver deps
COPY package*.json ./
RUN npm ci --include=dev

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app
# package.json también es necesario aquí para "npm run build"
COPY package*.json ./
# Traemos node_modules ya resueltos
COPY --from=deps /app/node_modules ./node_modules
# Código y configs de TS
COPY tsconfig*.json ./
COPY src ./src
# Compilar a dist/
RUN npm run build

# ---------- runtime ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Partimos de los módulos resueltos en deps
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
# Quitamos dev deps para un runtime liviano
RUN npm prune --omit=dev
# Copiamos el compilado
COPY --from=build /app/dist ./dist

# Render inyecta PORT. Nest escucha en 0.0.0.0:PORT (ya lo tienes en main.ts)
EXPOSE 3000
CMD ["node", "-r", "module-alias/register", "dist/main.js"]
