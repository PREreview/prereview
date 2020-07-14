# PREreview

A platform for reviewing preprints.

## Requirements

- [Node.js](https://nodejs.org) of version `>=12`
- `npm`

## Structure

Composed of 3 different parts:

- A [React](https://reactjs.org/)-based **frontend** that provides a standalone
  webform tool to submit tickets.
- A [Koa](https://koajs.com)-based **backend** that renders & serves the
  frontend and exposes an API used by the frontend.

These parts are located here in this repository:

```
src/backend  # The backend components
src/common   # Common code and assets
src/frontend # The React frontend
```

## Configuration

PREreview is configured via variables either specified in the environment or
defined in a `.env` file (see `env.example` for an example configuration that
may be edited and copied to `.env`).

The backend parses the following configuration variables:

```
PREREVIEW_LOG_LEVEL       # Logging level (default: error)
PREREVIEW_HOST            # The host PREreview runs on (default: localhost)
PREREVIEW_PORT            # The port to bind to (default: 3000)
PREREVIEW_ADMIN_USERNAME  # The administrative user (default: 'admin')
PREREVIEW_ADMIN_PASSWORD  # The administrative password
PREREVIEW_DB_HOST         # Postgres database host (default: localhost)
PREREVIEW_DB_PORT         # Postgres port (default: 5432)
PREREVIEW_DB_DATABASE     # Postgres database name (default: prereview)
PREREVIEW_DB_USERNAME     # Postgres user (default: prereview)
PREREVIEW_DB_PASSWORD     # Postgres password
PREREVIEW_DB_POOL_MIN     # Postgres minimum connections (default: 0)
PREREVIEW_DB_POOL_MAX     # Postgres max connections (default: 10)
PREREVIEW_DB_TIMEOUT      # Postgres connection timeout (default: 0)
```

Additionally, we use the semi-standard `NODE_ENV` variable for defining test,
staging, and production environments as well as
[log4js](https://log4js-node.github.io/log4js-node/) for setting logging
verbosity.

## Deployment

### Standalone

First, clone this repository and from the root of the resulting directory
install dependencies:

```
npm install
```

Then, build all components:

```
npm run build
```

Create the database:

```
npm run db:migrations
```

and to optionally populate it with test data:

```
npm run db:seeds
```

And start the running processes (with necessary environment variables if not
defined in `.env`):

```
npm run start
```

(use `npm run start:dev` to run in development mode)

Additionally, components can be built or started individually using for example
`npm run build:backend`, `npm run start:worker`, etc.

### Docker

You can deploy this tool using [Docker](https://docker.io). There is an included
`docker-compose.yml` file that will allow you to run it in a production
configuration. First, clone the repo and from this directory run docker-compose:

```
docker-compose up --build -d
```

This will build the docker container from the current repository, download the
official Postgres docker image, and configure them both (the `-d` flag will
detach from the current shell so that you can leave it running, but you can omit
it in order to leave the log output attached).

If this is the first time you've run it on this system, you'll want to run the
database migrations to initialize the database:

```
docker-compose run prereview npm run db:migrations
```

and then optionally seed the database with a default admin user:

```
docker-compose run prereview npm run db:seeds
```

By default, it runs on [http://localhost:3000](http://localhost:3000), but you
can place it behind a proxy such as [Nginx](https://nginx.com) in order to
provide TLS support and other features.

## License

PREreview is an open-source software project licensed under the MIT License by
[PREreview](https://prereview.org).
