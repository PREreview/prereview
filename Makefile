.DEFAULT_GOAL: help
.PHONY: help build run dev prod start logs stop wait-healthy lint test integration-test smoke-test

ifeq (${TARGET},)
TARGET := dev
endif

DOCKER_COMPOSE = docker-compose --file docker-compose.yml --file docker-compose.$(TARGET).yml
STOP = exit=$$?; $(MAKE) stop; exit $$exit

help: ## Display this help text
	@grep -E '^[a-zA-Z_\\:-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | sed 's/\\:/:/g' | awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.env:
	cp env.example .env

build:
	@$(DOCKER_COMPOSE) build

run: .env build
	@${DOCKER_COMPOSE} up --abort-on-container-exit --exit-code-from prereview; ${STOP}

dev: export TARGET = dev
dev: run ## Run the dev image

prod: export TARGET = prod
prod: run ## Run the prod image

start: .env build
start:
	@${DOCKER_COMPOSE} up --detach

logs:
ifeq (${LOG_FILE},)
	@${DOCKER_COMPOSE} logs
else
	@${DOCKER_COMPOSE} logs --no-color > ${LOG_FILE}
endif

stop:
ifneq (${LOG_FILE},)
	@$(MAKE) logs
endif
	@${DOCKER_COMPOSE} down

wait-healthy: ## Wait for the app to be healthy
	@.scripts/wait-healthy.sh prereview

lint: export TARGET = dev
lint: build ## Run the linter
	@${DOCKER_COMPOSE} run --rm --no-deps --entrypoint "npm run" prereview lint

test: export TARGET = dev
test: build ## Run the tests
	@${DOCKER_COMPOSE} run --rm --no-deps --entrypoint "npm run" prereview test

integration-test: export TARGET = integration
integration-test: export LOG_FILE = integration/results/docker.log
integration-test: build ## Run the integration tests
	@mkdir -p integration/results && rm -rf integration/results/*
	@${DOCKER_COMPOSE} run playwright; ${STOP}

smoke-test: build ## Run the smoke tests
	@.scripts/smoke-test.sh
