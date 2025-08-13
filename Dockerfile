# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
# antes: RUN npm ci --include=dev
RUN npm install --include=dev

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---------- runtime ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
# antes: RUN npm prune --omit=dev  (déjalo igual si quieres más liviano)
RUN npm prune --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 3000
# recuerda que ya cambiamos a module-alias
CMD ["node", "-r", "module-alias/register", "dist/main.js"]
