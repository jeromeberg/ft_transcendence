FROM node:22.23.1-alpine3.24 AS dependencies

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM dependencies AS development

COPY frontend/ ./
COPY backend/src /backend/src

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM dependencies AS build

COPY frontend/ ./
COPY backend/src /backend/src

RUN npm run build

FROM nginx:1.31.5-alpine3.24 AS production

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
