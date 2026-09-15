NAME		= Typerun
COMPOSE		= docker-compose.yml
COMPOSE_DEV	= docker-compose.dev.yml
COMPOSE_CLOUD	= docker-compose.cloud.yml
DOMAIN		:= $(shell grep '^DOMAIN=' .env 2>/dev/null | cut -d= -f2)
CLOUD_DOMAIN	:= $(shell grep '^CLOUDFLARE_DOMAIN=' .env 2>/dev/null | cut -d= -f2)
DEV_DOMAIN	:= localhost

all: up

check-env:
	@if [ ! -f .env ]; then \
		echo "ERROR: .env not found."; \
		echo "Run: cp .env.example .env and fill in the values."; \
		exit 1; \
	fi

up: check-env
	docker compose -f $(COMPOSE) up --build -d
	@printf "\n\033[1;32m  [OK] $(NAME) is up and running!\033[0m\n\n"
	@printf "\033[1;36m  ┌───────────────────────────────────────────┐\033[0m\n"
	@printf "\033[1;36m  │\033[0m  https://$(DOMAIN)                        \033[1;36m│\033[0m\n"
	@printf "\033[1;36m  └───────────────────────────────────────────┘\033[0m\n\n"

dev: check-env
	docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) up --build -d
	@$(MAKE) prisma
	@printf "\n\033[1;33m  [DEV] $(NAME) is up in dev mode!\033[0m\n\n"
	@printf "\033[1;36m  ┌───────────────────────────────────────┐\033[0m\n"
	@printf "\033[1;36m  │\033[0m  Frontend  ->  http://$(DEV_DOMAIN):5173  \033[1;36m│\033[0m\n"
	@printf "\033[1;36m  │\033[0m  Backend   ->  http://$(DEV_DOMAIN):3000  \033[1;36m│\033[0m\n"
	@printf "\033[1;36m  │\033[0m  Database  ->  http://$(DEV_DOMAIN):5432  \033[1;36m│\033[0m\n"
	@printf "\033[1;36m  │\033[0m  Prisma.   ->  http://$(DEV_DOMAIN):5555  \033[1;36m│\033[0m\n"
	@printf "\033[1;36m  └───────────────────────────────────────┘\033[0m\n\n"

cloud: check-env
	docker compose -f $(COMPOSE) -f $(COMPOSE_CLOUD) up --build -d
	@printf "\n\033[1;35m  [CLOUD] $(NAME) is up via Cloudflare!\033[0m\n\n"
	@printf "\033[1;36m  ┌────────────────────────────────────────────┐\033[0m\n"
	@printf "\033[1;36m  │\033[0m  https://$(CLOUD_DOMAIN) \033[1;36m│\033[0m\n"
	@printf "\033[1;36m  └────────────────────────────────────────────┘\033[0m\n\n"

down:
	docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) -f $(COMPOSE_CLOUD) down

re: down up

redev: down dev

recloud: down cloud

clean: down
	docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) -f $(COMPOSE_CLOUD) down -v --rmi local

fclean: clean
	docker system prune -af --volumes

logs:
	docker compose -f $(COMPOSE) logs -f

ps:
	docker compose -f $(COMPOSE) ps

prisma:
	@docker exec backend pkill -f "prisma studio" 2>/dev/null || true
	@docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) exec -d backend npx prisma studio --port 5555

seed:
	docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) exec backend npm run seed

stress:
	docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) exec backend npm run stress

seedclean:
	docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) exec backend npx prisma migrate reset --force

quotes:
	docker compose -f $(COMPOSE) -f $(COMPOSE_DEV) exec backend npm run quotes

.PHONY: all up dev cloud down re redev recloud clean fclean logs ps seed seedclean stress quotes
