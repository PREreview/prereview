FROM mcr.microsoft.com/playwright:v1.13.0-focal
WORKDIR /app

RUN apt-get install --yes --no-install-recommends \
  wait-for-it

COPY \
  package.json \
  package-lock.json \
  ./

RUN \
  npm ci --production \
  && npm cache clean --force

ENTRYPOINT ["wait-for-it", "prereview:3000", "--timeout=20", "--strict", "--"]
CMD ["npx", "playwright", "test"]
