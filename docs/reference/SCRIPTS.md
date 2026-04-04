# Справочник корневых команд (`pnpm run`)

Все команды ниже запускаются **из корня репозитория**. В `package.json` нельзя встроить описания к каждой строке — этот файл и есть справочник.

> **💡 Терминал:** `pnpm run scripts:help` — вывести этот же текст в консоль (удобно с `| less`). В GitHub / IDE превью таблицы и оглавление читаются лучше, чем в сыром выводе.

## Оглавление

| | Куда перейти | Зачем |
|---|--------------|--------|
| 🔧 | [**Раздел 1** — доработка](#section-1) | Код, тесты, миграции, MCP, образы, K8s |
| 🚀 | [**Раздел 2** — быстрый запуск](#section-2) | Поднять стек или демо без погружения в пайплайн |
| 📎 | [**Приложение** — префиксы](#appendix-prefixes) | Найти команду по группе |

---

<a id="section-1"></a>

## 🔧 Раздел 1 — дорабатываю и улучшаю проект

Цель: правка кода, миграции, тесты, сборка, публикация, выкат. Команды `dev` и `build` идут через [Turborepo](https://turbo.build/repo) (`turbo.json`) и `pnpm --filter` по пакетам монорепо.

> **↔️ Пересечение с разделом 2:** те же скрипты (например `deploy:local`) могут означать «пользоваться стеком» или «отлаживать рядом с `pnpm dev`» — смотрите на намерение. Меняете код — ориентируйтесь на подкейсы ниже.

### Я хочу запустить web и API из исходников

| Шаг | Команда / действие |
|-----|-------------------|
| 1 | PostgreSQL: свой инстанс **или** `pnpm run deploy:dev:db` (Podman, порт **5434**, см. `docker-compose.dev.yml`) |
| 2 | При необходимости: `apps/api/.env.example` → `apps/api/.env`, `apps/web/.env.example` → `apps/web/.env` |
| 3 | `pnpm install` (на `postinstall` вызывается `fix:bin`) |
| 4 | `pnpm run db:migrate` |
| 5 | `pnpm run dev` → **amb-web** + **amb-api** (фильтры в корневом `package.json`) |

> **⚠️ После клона (macOS/Linux):** если падают бинарники в `node_modules` → `pnpm run fix:bin`.

### Я хочу работать только с одним приложением

| Задача | Команда |
|--------|---------|
| Только API (Nest) | `pnpm run dev:api` |
| Только web (Next) | `pnpm --filter amb-web run dev` *(в корне нет `dev:web`)* |

### Я хочу менять схему БД или смотреть данные

| Команда | Назначение |
|---------|------------|
| `pnpm run db:migrate` | Dev-миграции (`@amb-app/db`) |
| `pnpm run db:migrate:deploy` | Миграции в CI / прод-подобной среде |
| `pnpm run db:studio` | Prisma Studio |

### Я хочу прогнать проверки как в CI

| Команда | Назначение |
|---------|------------|
| `pnpm run build` | Сборка (граф зависимостей Turbo) |
| `pnpm run typecheck` | TypeScript |
| `pnpm run test` | Тесты |
| `pnpm run lint` | ESLint (сейчас **amb-web**) |
| `pnpm run start` | Production-старт web после `build` |

### Я хочу данные и примеры для проверки своих изменений

| Тип | Команды |
|-----|---------|
| Сиды | `pnpm run seed:agents`, `pnpm run seed:threads`, `pnpm run seed:all` |
| Примеры | `pnpm run example:simple`, `pnpm run example:inbox`, `pnpm run example:workflow` |

*Каталог примеров:* `apps/web/examples`.

### Я хочу воркеры, оркестратор, проверку inbox (PO)

| Команда | Назначение |
|---------|------------|
| `pnpm run agent:worker` | Воркер агентов |
| `pnpm run agent:worker:single` | Один агент (`--agent-id=` — см. пакет `amb-web`) |
| `pnpm run orchestrator` | Оркестратор |
| `pnpm run po:check-inbox` | Скрипт PO / inbox |

### Я хочу MCP: сборка, дев, публикация

| Команда | Назначение |
|---------|------------|
| `pnpm run mcp:build` | Сборка `@openaisdk/amb-mcp` |
| `pnpm run mcp:dev` | Режим разработки MCP |

### Я хочу образ, compose, прод или K8s

**Сравнение главных сценариев деплоя:**

| Скрипт | Смысл |
|--------|--------|
| `pnpm run deploy:local` | **Сборка из репо** (`podman compose up -d --build`), web **5333**, api **5334** |
| `pnpm run deploy:amb` | **Опубликованный stack** из `deploy/compose/amb-compose.yml` (web/api/seed из Hub), по умолчанию web **4333**, api **4334** |

**Остальное:**

| Команда | Назначение |
|---------|------------|
| `pnpm run deploy:local:standalone` | Как `deploy:local`, порты **3333 / 3334** |
| `pnpm run deploy:local:down` | `compose down -v` |
| `pnpm run deploy:prod` | `scripts/deploy/production-deploy.sh` |
| `pnpm run deploy:k8s:migrate` | `kubectl apply` job миграций |
| `pnpm run deploy:k8s:api` | `kubectl apply` deployment + service API |

### Я хочу бэкап или восстановить БД

| Команда | Скрипт |
|---------|--------|
| `pnpm run backup:db` | `scripts/backup/postgres-backup.sh` |
| `pnpm run restore:db` | `scripts/backup/postgres-restore.sh` |

---

<a id="section-2"></a>

## 🚀 Раздел 2 — быстро запустить и использовать

Цель: минимум шагов до Dashboard и API. Порты и ожидание `seed` — в [QUICKSTART.md](../QUICKSTART.md).

> **🔧 Дальше будете править код?** См. [раздел 1](#section-1).

### Я хочу полный стек в контейнерах

| Сценарий | Команда | Порты (типично) |
|----------|---------|-----------------|
| Сборка UI из репозитория | `pnpm run deploy:local` | **5333** / **5334** |
| Опубликованный stack из Hub | `pnpm run deploy:amb` | **4333** / **4334** |
| Как выше, другие порты | `pnpm run deploy:local:standalone` | **3333** / **3334** |

Остановка локального compose из репозитория: `pnpm run deploy:local:down`.

> **Важно:** теперь матрица такая: `pnpm dev` и `deploy:local:standalone` используют **3333 / 3334**, direct quick start из `README.md` / `QUICKSTART.md` и `pnpm run deploy:amb` используют **4333 / 4334**, а `pnpm run deploy:local` использует **5333 / 5334**.

### Я хочу только Postgres, приложения на хосте

| Шаг | Действие |
|-----|----------|
| 1 | `pnpm run deploy:dev:db` — Postgres (**5434**) |
| 2 | Далее [QUICKSTART.md](../QUICKSTART.md), вариант **C** (`.env`, `install`, `db:migrate`, `dev`, сиды) |

Остановка БД: `pnpm run deploy:dev:db:down`.

### Я хочу демо и примеры

| Команда | Заметка |
|---------|---------|
| `pnpm run seed:all` | Агенты + треды |
| `pnpm run seed:agents` / `seed:threads` | По отдельности |
| `pnpm run example:simple` и др. | См. раздел 1 |

### Я хочу «пощупать» оркестратор / воркеры

`pnpm run orchestrator`, `pnpm run agent:worker` — детали в [разделе 1](#section-1).

---

<a id="appendix-prefixes"></a>

## 📎 Приложение — указатель по префиксам

| Группа | Команды |
|--------|---------|
| 🛠 Окружение | `postinstall`, `fix:bin`, `scripts:help` |
| 💻 Разработка | `dev`, `dev:api`, `build`, `typecheck`, `test`, `start`, `lint` |
| 🗄 БД | `db:migrate`, `db:migrate:deploy`, `db:studio` |
| 💾 Бэкап | `backup:db`, `restore:db` |
| 🌱 Сиды | `seed:agents`, `seed:threads`, `seed:all` |
| 📚 Примеры | `example:simple`, `example:inbox`, `example:workflow` |
| 🤖 Агенты / PO | `agent:worker`, `agent:worker:single`, `orchestrator`, `po:check-inbox` |
| 🔌 MCP | `mcp:build`, `mcp:dev` |
| 🐳 Docker / деплой | `deploy:amb`, `deploy:local`, `deploy:local:standalone`, `deploy:local:down`, `deploy:dev:db`, `deploy:dev:db:down`, `deploy:prod`, `deploy:k8s:migrate`, `deploy:k8s:api` |

Полный список имён — в корневом [`package.json`](../package.json).
