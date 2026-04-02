SHELL := /bin/sh

API_URL := http://localhost:3000

.PHONY: install lint test coverage audit check docker-build docker-up docker-down docker-test request-smoke

install:
	npm install

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
	docker compose build api test

docker-up:
	docker compose up --build -d --wait api

docker-down:
	docker compose down --remove-orphans

docker-test:
	docker compose build test
	docker compose run --rm test

request-smoke:
	API_URL=$(API_URL) node scripts/request-smoke.js
