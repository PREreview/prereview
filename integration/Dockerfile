FROM mcr.microsoft.com/playwright:v1.18.1-focal
WORKDIR /app

RUN apt-get update && \
  apt-get install --yes --no-install-recommends \
  wait-for-it && \
  rm -rf /var/lib/apt/lists/*

COPY \
  .npmrc \
  package.json \
  package-lock.json \
  ./

RUN \
  npm ci --production \
  && npm cache clean --force

ENTRYPOINT ["wait-for-it", "prereview:3000", "--timeout=30", "--strict", "--"]
CMD ["npx", "playwright", "test"]
