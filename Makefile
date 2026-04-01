SHELL := /bin/sh

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
	node scripts/wait-for-http.js http://localhost:3000/items 30 1000
	curl --fail http://localhost:3000/items
