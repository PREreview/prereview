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

COPY \
  .parcelrc \
  .prettierignore \
  .prettierrc \
  .sassrc \
  .terserrc \
  tsconfig.json \
  ./
COPY src/ src/

RUN npm run build



#
# Stage: Development
#
FROM build AS dev
ENV NODE_ENV=development

COPY \
  .gitignore \
  .proxyrc \
  docker-entrypoint.sh \
  ./

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["start:dev"]



#
# Stage: Production
#
FROM node:14-alpine AS prod

RUN npm prune --production

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
