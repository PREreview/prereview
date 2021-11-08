FROM node:14-alpine3.12 AS node
WORKDIR /app

RUN \
  apk add --no-cache \
    netcat-openbsd \
    postgresql-client

COPY \
  .npmrc \
  package.json \
  package-lock.json \
  ./



#
# Stage: Builder
#
FROM node AS builder

RUN \
  apk add --no-cache --virtual .build-deps \
    git \
  && npm ci \
  && npm cache clean --force \
  && rm -rf ~/.node-gyp \
  && apk del --no-cache .build-deps

COPY \
  .parcelrc \
  .terserrc \
  tsconfig.json \
  ./



#
# Stage: Scripts build
#
FROM builder AS scripts

COPY src/common/ src/common/
COPY src/backend/ src/backend/

RUN \
  npm run build:scripts \
  && rm -rf .parcel-cache



#
# Stage: Backend build
#
FROM builder AS backend

COPY src/common/ src/common/
COPY src/backend/ src/backend/

RUN \
  npm run build:backend \
  && rm -rf .parcel-cache



#
# Stage: Frontend hooks build
#
FROM builder AS frontend-hooks

COPY src/common/ src/common/
COPY src/backend/ src/backend/

RUN \
  mkdir --parents dist src/frontend/hooks \
  && npm run build:hooks \
  && rm -rf .parcel-cache



#
# Stage: Frontend build
#
FROM builder AS frontend

COPY --from=scripts /app/dist/scripts/ dist/scripts/
COPY src/common/ src/common/
COPY src/frontend/ src/frontend/
COPY --from=frontend-hooks /app/src/frontend/hooks/ src/frontend/hooks/

RUN \
  npm run build:frontend \
  && rm -rf .parcel-cache



#
# Stage: Development
#
FROM builder AS dev
ENV NODE_ENV=development

COPY \
  .eslintignore \
  .eslintrc.json \
  .gitignore \
  .prettierignore \
  .prettierrc \
  .proxyrc \
  docker-entrypoint.sh \
  jest.config.ts \
  tsconfig.dev.json \
  ./

COPY --from=scripts /app/dist/scripts/ dist/scripts/
COPY --from=backend /app/dist/backend/ dist/backend/

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["start:dev"]



#
# Stage: Integration
#
FROM dev AS integration
ENV NODE_ENV=integration

COPY --from=trajano/alpine-libfaketime /faketime.so /lib/faketime.so
ENV LD_PRELOAD=/lib/faketime.so
ENV DONT_FAKE_MONOTONIC=1

COPY --from=backend /app/src/ src/
COPY --from=frontend /app/dist/frontend/ dist/frontend/

CMD ["start"]



#
# Stage: Production
#
FROM node AS prod

RUN apk add --update --no-cache \
    curl

EXPOSE 3000

RUN \
  apk add --no-cache --virtual .build-deps \
    git \
  && npm ci --production \
  && npm cache clean --force \
  && rm -rf ~/.node-gyp \
  && apk del --no-cache .build-deps

COPY --from=scripts /app/dist/scripts/ dist/scripts/
COPY --from=backend /app/dist/backend/ dist/backend/
COPY --from=frontend /app/dist/frontend/ dist/frontend/
COPY ./docker-entrypoint.sh .

HEALTHCHECK --interval=5s \
            --timeout=5s \
            --retries=6 \
            CMD curl -fs http://localhost:3000/ || exit 1

ENV NODE_ENV=production

USER node

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["start"]
