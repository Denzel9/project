# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Bake API URL at build time (Vite). Pass via Dokploy build args.
ARG VITE_API_URL_BACKEND
ENV VITE_API_URL_BACKEND=$VITE_API_URL_BACKEND
ARG VITE_HELP_URL
ENV VITE_HELP_URL=$VITE_HELP_URL

RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
