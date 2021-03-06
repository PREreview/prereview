# Build layer
FROM node:14-alpine AS build

RUN apk add --no-cache \
    build-base \
    python \
    g++ \
    git \
    openssh \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev
WORKDIR /src
COPY ./package* ./

RUN npm ci

COPY . .

RUN npm run lint
RUN npm run test

ENV NODE_ENV=production

# Avoid lscpu warning on Alpine
#ENV PARCEL_WORKERS=1

RUN npm run build

RUN npm prune --production

# Main layer
FROM node:14-alpine

RUN apk add --update --no-cache \
    curl \
    netcat-openbsd \
    postgresql-client

EXPOSE 3000

WORKDIR /app

COPY --from=build /src .
COPY ./docker-entrypoint.sh .

HEALTHCHECK --interval=5s \
            --timeout=5s \
            --retries=6 \
            CMD curl -fs http://localhost:3000/ || exit 1

ENV NODE_ENV=production

USER node

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["start"]
