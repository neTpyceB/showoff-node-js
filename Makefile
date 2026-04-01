SHELL := /bin/sh

.PHONY: install lint test coverage audit check docker-build docker-run docker-test docker-smoke

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

docker-run:
	docker compose run --rm app

docker-test:
	docker compose run --rm test

docker-smoke:
	printf 'pwd\n' | docker compose run --rm -T app
