# Shortcuts for Docker Compose and common tasks.
# Usage: make <target>   (run from repo root)
# Override port: APP_PORT=5001 make dev-up

ENV_FILE      ?= .env
COMPOSE_DEV   := docker/docker-compose.dev.yml
COMPOSE_PROD  := docker/docker-compose.prod.yml
COMPOSE       := docker compose --env-file $(ENV_FILE)

.PHONY: help dev-up dev-down dev-down-v dev-fresh dev-config dev-logs dev-ps dev-bg prod-up prod-down prod-config install build test lint lint-check

help:
	@echo "EBS Server — common commands"
	@echo ""
	@echo "  make dev-up       Dev stack (foreground, rebuild)"
	@echo "  make dev-bg       Dev stack (detached, rebuild)"
	@echo "  make dev-down     Stop dev stack"
	@echo "  make dev-down-v   Stop dev stack and remove volumes (DB/Redis + api node_modules)"
	@echo "  make dev-fresh    dev-down-v then dev-up (use after new devDependencies)"
	@echo "  make dev-config   Validate dev compose file"
	@echo "  make dev-logs     Follow dev api logs"
	@echo "  make dev-ps       Dev stack container status"
	@echo ""
	@echo "  make prod-up      Prod-like stack (foreground, rebuild)"
	@echo "  make prod-down    Stop prod-like stack"
	@echo "  make prod-config  Validate prod compose file"
	@echo ""
	@echo "  make install      npm install"
	@echo "  make build        npm run build"
	@echo "  make test         npm test"
	@echo "  make lint         npm run lint"
	@echo "  make lint-check   npm run lint:check"
	@echo ""
	@echo "Optional: APP_PORT=5001 make dev-up"

dev-up:
	$(COMPOSE) -f $(COMPOSE_DEV) up --build

dev-bg:
	$(COMPOSE) -f $(COMPOSE_DEV) up --build -d

dev-down:
	$(COMPOSE) -f $(COMPOSE_DEV) down

dev-down-v:
	$(COMPOSE) -f $(COMPOSE_DEV) down -v

dev-fresh: dev-down-v dev-up

dev-config:
	$(COMPOSE) -f $(COMPOSE_DEV) config

dev-logs:
	$(COMPOSE) -f $(COMPOSE_DEV) logs -f api

dev-ps:
	$(COMPOSE) -f $(COMPOSE_DEV) ps

prod-up:
	$(COMPOSE) -f $(COMPOSE_PROD) up --build

prod-down:
	$(COMPOSE) -f $(COMPOSE_PROD) down

prod-config:
	$(COMPOSE) -f $(COMPOSE_PROD) config

install:
	npm install

build:
	npm run build

test:
	npm test

lint:
	npm run lint

lint-check:
	npm run lint:check
