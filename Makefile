SHELL := /bin/sh

BALANCER_URL := http://localhost:3000

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
	docker compose build balancer backend-a backend-b test

docker-up:
	docker compose down --remove-orphans
	docker compose up --build -d --wait balancer backend-a backend-b redis

docker-down:
	docker compose down --remove-orphans

docker-test:
	docker compose build test
	docker compose run --rm test

request-smoke:
	BALANCER_URL=$(BALANCER_URL) node scripts/request-smoke.js
