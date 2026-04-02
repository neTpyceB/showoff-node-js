SHELL := /bin/sh

ADMIN_EMAIL := admin@example.com
ADMIN_PASSWORD := admin-password
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
	docker compose build

docker-up:
	docker compose up --build -d --wait

docker-down:
	docker compose down --remove-orphans

docker-test:
	docker compose run --rm test

request-smoke:
	node scripts/wait-for-http.js $(API_URL)/auth/me 30 1000
	API_URL=$(API_URL) ADMIN_EMAIL=$(ADMIN_EMAIL) ADMIN_PASSWORD=$(ADMIN_PASSWORD) node scripts/smoke-auth.js
