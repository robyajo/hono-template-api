FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS install
RUN npm ci

FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
# Copy migration SQL files required for database schema setup/migration at runtime
COPY --from=build /app/src/db/migrations ./src/db/migrations

EXPOSE 8000
CMD ["node", "dist/index.js"]
