FROM node:22.23.1-alpine3.24 AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate

CMD ["npm", "run", "start:dev"]

FROM dependencies AS build

COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:22.23.1-alpine3.24 AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma/migrations ./prisma/migrations
RUN npm ci --omit=dev \
    && npx prisma generate --schema=prisma/schema.prisma \
    && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
