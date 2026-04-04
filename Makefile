SHELL := /bin/sh

AUTH_URL := http://localhost:3000
USER_URL := http://localhost:3001

.PHONY: install migrate lint test coverage audit check docker-build docker-up docker-down docker-test request-smoke

install:
	npm ci

migrate:
	npm run migrate

lint:
	npm run lint

test:
	npm run test

coverage:
	npm run coverage

audit:
	npm run audit

check:
	npm run check

docker-build:
	docker compose build auth user payment test

docker-up:
	docker compose down --remove-orphans
	docker compose up --build -d --wait auth user payment

docker-down:
	docker compose down --remove-orphans

docker-test:
	docker compose build test
	docker compose run --rm test

request-smoke:
	AUTH_URL=$(AUTH_URL) USER_URL=$(USER_URL) node scripts/request-smoke.js
