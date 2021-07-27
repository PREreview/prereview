FROM node:14-alpine AS node
WORKDIR /app

RUN \
  apk add --no-cache \
    netcat-openbsd \
    postgresql-client

COPY \
  package.json \
  package-lock.json \
  ./



#
# Stage: Build
#
FROM node AS build

RUN \
  apk add --no-cache --virtual .build-deps \
    g++ \
    git \
    make \
    musl-dev \
    python \
  && npm ci \
  && npm cache clean --force \
  && rm -rf ~/.node-gyp \
  && apk del --no-cache .build-deps

COPY \
  .parcelrc \
  .prettierignore \
  .prettierrc \
  .sassrc \
  .terserrc \
  tsconfig.json \
  ./
COPY src/ src/

RUN \
  npm run build \
  && rm -rf .parcel-cache



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
FROM node AS prod

RUN apk add --update --no-cache \
    curl

EXPOSE 3000

RUN \
  apk add --no-cache --virtual .build-deps \
    g++ \
    git \
    make \
    musl-dev \
    python \
  && npm ci --production \
  && npm cache clean --force \
  && rm -rf ~/.node-gyp \
  && apk del --no-cache .build-deps

COPY --from=build /app/dist/ dist/
COPY ./docker-entrypoint.sh .

HEALTHCHECK --interval=5s \
            --timeout=5s \
            --retries=6 \
            CMD curl -fs http://localhost:3000/ || exit 1

ENV NODE_ENV=production

USER node

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["start"]
