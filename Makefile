.PHONY: setup up down logs test test-backend test-frontend lint format typecheck

setup:
	@echo "Run these manually when ready to download:"
	@echo "cd apps/frontend && npm install"
	@echo "cd apps/backend && pip install -r requirements.txt"
	@echo "docker compose pull"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

test-backend:
	cd apps/backend && pytest

test-frontend:
	cd apps/frontend && npm test

format:
	cd apps/backend && ruff format .
	cd apps/frontend && npm run format

lint:
	cd apps/backend && ruff check .
