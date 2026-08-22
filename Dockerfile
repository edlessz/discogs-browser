# Build (config is baked in via build args - Vite prioritizes process env):
#   docker build \
#     --build-arg VITE_LASTFM_API_KEY=... \
#     --build-arg VITE_LASTFM_USER=... \
#     --build-arg VITE_DISCOGS_USERNAME=... \
#     -t discogs-browser .
# Run:
#   docker run -d -p 4173:80 discogs-browser
# Kiosk opens http://<server-lan-ip>:4173

FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

ARG VITE_LASTFM_API_KEY
ARG VITE_LASTFM_USER
ARG VITE_DISCOGS_USERNAME

COPY . .
RUN bun run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
