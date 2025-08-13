# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev

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
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
