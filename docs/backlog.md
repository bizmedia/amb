# Product Backlog

**Версия:** 1.0  
**Дата:** 2026-01-28  
**Последняя проверка статуса:** 2026-03-16 (Orchestrator). Epic 1–4 завершены. Epic 5: E5-S1 — Done (react-next-engineer), E5-S2…E5-S5 — planned.  
**Автор:** Product Owner Agent  
**Статус:** Актуально

---

## 📋 Epic Overview


| Epic                                                                   | Приоритет | Статус         | Sprint     |
| ---------------------------------------------------------------------- | --------- | -------------- | ---------- |
| [E1: Архитектурная миграция](#epic-1-архитектурная-миграция)           | P0        | ✅ Done        | Sprint 1-2 |
| [E2: Multi-tenant инфраструктура](#epic-2-multi-tenant-инфраструктура) | P0        | ✅ Done        | Sprint 2-3 |
| [E3: JWT авторизация](#epic-3-jwt-авторизация)                         | P0        | ✅ Done        | Sprint 3-4 |
| [E4: Dashboard как продукт](#epic-4-dashboard-как-продукт)             | P0        | ✅ Done        | Sprint 4-5 |
| [E5: Developer Experience](#epic-5-developer-experience)               | P1        | 📋 Planned     | Sprint 5-6 |
| [E6: Операционная готовность](#epic-6-операционная-готовность)         | P1        | 📋 Planned     | Sprint 6-7 |
| [E7: Локализация (i18n)](#epic-7-локализация-i18n)                     | P1        | 📋 Planned     | Sprint 6-7 |


---

## Epic 1: Архитектурная миграция

**Цель:** Выделить переиспользуемые пакеты и мигрировать API в Nest.js

### Stories


| ID    | Story                           | Приоритет | Статус     | Acceptance Criteria                                                                                                     |
| ----- | ------------------------------- | --------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| E1-S1 | Выделить `packages/core`        | P0        | ✅ Done    | • Доменная логика (threads/messages/inbox/dlq) без Nest/Next • Интерфейс к хранилищу (без Prisma) • Unit тесты проходят |
| E1-S2 | Выделить `packages/db`          | P0        | ✅ Done    | • Prisma schema + migrations • Prisma client export • RLS helpers (готовность к RLS)                                    |
| E1-S3 | Выделить `packages/shared`      | P0        | ✅ Done    | • Общие типы/ошибки/схемы (Zod) • Константы • Используется в core/db/sdk                                                |
| E1-S4 | Выделить `packages/sdk`         | P0        | ✅ Done    | • TS SDK для внешних проектов • `createClient({ baseUrl, token })` • Использует `packages/shared`                       |
| E1-S5 | Создать `apps/api` (Nest.js)    | P0        | ✅ Done    | • Nest.js приложение • Endpoints 1:1 с текущим API • Использует packages/core/db/shared • Integration-тесты (14 e2e) проходят • Порт 3334      |
| E1-S6 | Миграция endpoints в `apps/api` | P0        | ✅ Done    | • apps/web переведён на HTTP-клиент к apps/api (getApiClient, @amb-app/sdk) • Все API-роуты и stream используют API • Project scoping в коде |


**Definition of Done:**

- ✅ Все packages выделены и работают
- ✅ `apps/api` запускается и отвечает на запросы
- ✅ Все существующие endpoints мигрированы
- ✅ Тесты проходят (unit + integration)

---

## Epic 2: Multi-tenant инфраструктура

**Цель:** Реализовать Tenant → Projects модель с изоляцией данных

### Stories


| ID    | Story                                         | Приоритет | Статус     | Acceptance Criteria                                                                                                                     |
| ----- | --------------------------------------------- | --------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| E2-S1 | Добавить Tenant и Project модели              | P0        | ✅ Done    | • Prisma модели `Tenant` и `Project` • Миграция создана • Relations настроены (Project→Tenant)                                           |
| E2-S2 | Добавить tenantId/projectId в рабочие таблицы | P0        | ✅ Done    | • `Agent`, `Thread`, `Message` имеют `tenantId` и `projectId` • Индексы добавлены • Миграция создана                                    |
| E2-S3 | Backfill существующих данных                  | P0        | ✅ Done    | • Создан default tenant + default project • Все существующие записи получили tenantId/projectId • Миграция 20260315190000_backfill_tenant_ids применена             |
| E2-S4 | Project-scoped API endpoints                  | P0        | ✅ Done    | • Все endpoints фильтруют по projectId из контекста • Project guard, e2e изоляции (21/21)                                               |
| E2-S5 | RLS политики в PostgreSQL                     | P0        | ✅ Done    | • RLS включен на Agent/Thread/Message/Issue • Миграция 20260315194000_enable_rls_policies • Политики USING/WITH CHECK                    |
| E2-S6 | Контекст tenant/project в запросах            | P0        | ✅ Done    | • PrismaService.withProjectContext (set_config) • Сервисы переведены на контекст • RLS helpers в packages/db • e2e 21/21 green           |


**Definition of Done:**

- ✅ Tenant/Project модель работает
- ✅ Все данные project-scoped
- ✅ RLS включен и тестирован
- ✅ Cross-tenant/project доступ невозможен

---

## Epic 3: JWT авторизация

**Цель:** Реализовать JWT-based auth с user и project tokens

### Stories


| ID    | Story                             | Приоритет | Статус     | Acceptance Criteria                                                                                                                        |
| ----- | --------------------------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| E3-S1 | JWT guard в Nest.js               | P0        | ✅ Done    | • JWT guard (Bearer, HS256, claims) • Auth context в request • ProjectGuard/ProjectParamGuard • e2e 25/25                                                       |
| E3-S2 | User tokens (для Dashboard)       | P0        | ✅ Done    | • users table + миграция/seed • POST /api/auth/login • user JWT (sub:user, tenantId, roles) • public routes • e2e 28/28 |
| E3-S3 | Project tokens (для интеграций)   | P0        | ✅ Done    | • POST /api/auth/project-tokens • sub:project, tenantId/projectId • выдача только tenant-admin • e2e 31/31                              |
| E3-S4 | Admin API для управления токенами | P0        | ✅ Done    | • /api/admin/projects/:projectId/tokens • CRUD, revoke, RBAC • ProjectToken + RLS • e2e 33/33                                             |
| E3-S5 | Token rotation и revocation       | P0        | ✅ Done    | • DB-backed revocation в JwtAuthGuard • lastUsedAt • rotation + мгновенный revoke • e2e 33/33                                            |
| E3-S6 | Audit логирование                 | P1        | ✅ Done    | • ProjectTokenAudit + RLS • created/used/revoked/deleted • GET .../tokens/:tokenId/audit • e2e 33/33                                      |


**Definition of Done:**

- ✅ JWT guard работает на всех endpoints
- ✅ User и project tokens поддерживаются
- ✅ Admin API для управления токенами
- ✅ Token rotation и revocation работают

---

## Epic 4: Dashboard как продукт

**Цель:** Мигрировать Dashboard на HTTP клиент, убрать прямой доступ к БД

### Stories


| ID    | Story                                  | Приоритет | Статус     | Acceptance Criteria                                                                          |
| ----- | -------------------------------------- | --------- | ---------- | -------------------------------------------------------------------------------------------- |
| E4-S1 | Создать `apps/web` (Next.js Dashboard) | P0        | ✅ Done    | • Next.js Dashboard • Структура сохранена • HTTP клиент к apps/api (getApiClient, @amb-app/sdk) |
| E4-S2 | HTTP клиент к `apps/api`               | P0        | ✅ Done    | • auth.ts JWT/cookie • login/logout/session routes • client token+projectId • http.ts ApiHttpError • typecheck pass |
| E4-S3 | Удалить прямой доступ к БД             | P0        | ✅ Done    | • Prisma/@amb-app/db удалены из apps/web • scripts/DB-слой убраны • build/typecheck pass     |
| E4-S4 | User authentication flow               | P0        | ✅ Done    | • /[locale]/login • protected routes (middleware + server auth gate) • session check + re-login on 401 • httpOnly • build/typecheck pass |
| E4-S5 | Tenant/Project management UI           | P0        | ✅ Done    | • ProjectSwitcher: список tenant/project • создание и редактирование проекта • переключение контекста и сохранение projectId |
| E4-S6 | Token management UI                    | P0        | ✅ Done    | • /[locale]/tokens + TokensModule • список project tokens • создание, revoke и копирование токена |


**Definition of Done:**

- ✅ Dashboard работает через HTTP
- ✅ Нет прямого доступа к БД
- ✅ User auth flow работает
- ✅ Management UI для tenant/project/tokens

---

## Epic 5: Developer Experience

**Цель:** Улучшить DX для интеграции SDK и использования продукта

### Stories


| ID    | Story                                   | Приоритет | Статус     | Acceptance Criteria                                                                        |
| ----- | --------------------------------------- | --------- | ---------- | ------------------------------------------------------------------------------------------ |
| E5-S1 | Обновить SDK с JWT поддержкой           | P1        | ✅ Done    | • `createClient({ baseUrl, token })` • Authorization Bearer + x-project-id • MessageBusError: isUnauthorized/isForbidden/isAuthError |
| E5-S2 | Документация по интеграции              | P1        | 📋 Planned      | • Quick start guide • API reference • Примеры кода                                         |
| E5-S3 | Docker Compose для локальной разработки | P1        | 📋 Planned      | • `docker compose up` запускает все • DB + API + Web • Seed данные                         |
| E5-S4 | Migration guide                         | P1        | 📋 Planned      | • Guide для v1 → vNext • SDK migration steps • Breaking changes список                     |
| E5-S5 | Примеры интеграций                      | P1        | 📋 Planned      | • Примеры для разных языков • Best practices • Common patterns                             |


**Definition of Done:**

- ✅ SDK обновлен и документирован
- ✅ Документация полная и актуальная
- ✅ Docker Compose работает
- ✅ Примеры интеграций доступны

---

## Epic 6: Операционная готовность

**Цель:** Подготовить продукт к production deployment

### Stories


| ID    | Story                        | Приоритет | Статус     | Acceptance Criteria                                                                     |
| ----- | ---------------------------- | --------- | ---------- | --------------------------------------------------------------------------------------- |
| E6-S1 | Rate limiting                | P1        | 📋 Planned      | • Rate limits на endpoints • Per-project limits • 429 responses                         |
| E6-S2 | Observability (логи/метрики) | P1        | 📋 Planned      | • Structured logging • Metrics (Prometheus format) • Health checks                      |
| E6-S3 | Tracing                      | P2        | 📋 Planned      | • Distributed tracing • Request correlation IDs • Performance monitoring                |
| E6-S4 | Health checks                | P1        | 📋 Planned      | • `/health` endpoint • DB connectivity check • Dependency checks                        |
| E6-S5 | Deployment automation        | P1        | 📋 Planned      | • CI/CD pipeline • Docker images (Podman) • Kubernetes manifests • Migration automation |
| E6-S6 | Backup и disaster recovery   | P1        | 📋 Planned      | • Backup strategy • Recovery procedures • Testing                                       |


**Definition of Done:**

- ✅ Rate limiting работает
- ✅ Observability настроена
- ✅ Health checks работают
- ✅ Deployment автоматизирован

---

## Epic 7: Локализация (i18n)

**Цель:** Все сообщения интерфейса поддерживают перевод на разные языки; пользователь может выбрать язык.

### Scope

- **Dashboard UI** (`apps/web`): заголовки, кнопки, подписи, сообщения об ошибках, пустые состояния, уведомления.
- **Сообщения API, отображаемые в UI:** ошибки валидации и бизнес-логики, которые показываются пользователю в Dashboard (через ключи или переводимые строки).
- **Выбор языка:** переключатель/настройка языка в UI; язык сохраняется (например, в настройках пользователя или localStorage до появления user preferences в API).

### Stories


| ID    | Story                              | Приоритет | Статус     | Acceptance Criteria                                                                                                                                                            |
| ----- | ---------------------------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E7-S1 | Инфраструктура i18n в Dashboard    | P1        | 🚧 In Progress  | • Выбрана и подключена библиотека i18n (решение — Architect/Dev) • Все тексты UI вынесены в ключи переводов • Есть как минимум 2 языка (напр. en + ru) с полным набором ключей |
| E7-S2 | Переключатель языка и персистенция | P1        | 🚧 In Progress  | • В UI есть переключатель языка • Выбранный язык сохраняется между сессиями (localStorage или user prefs) • Приложение при загрузке отображает сохранённый язык                |
| E7-S3 | Перевод сообщений API в UI         | P1        | 📋 Planned      | • Ошибки и сообщения от API, показываемые в Dashboard, переводимы • Используются ключи или маппинг к переводам в UI • Нет «сырых» непереведённых строк от API в интерфейсе     |
| E7-S4 | Документация для переводчиков      | P2        | 📋 Planned      | • Описан процесс добавления нового языка • Формат файлов переводов и конвенции ключей задокументированы • При необходимости — инструкция для внешних переводчиков              |


**Definition of Done:**

- ✅ Все видимые пользователю тексты в Dashboard переводимы через i18n
- ✅ Пользователь может выбрать язык и он сохраняется
- ✅ Ошибки/сообщения от API, показываемые в UI, отображаются на выбранном языке
- ✅ Минимум 2 языка (en + один дополнительный) с полным покрытием

**Вне scope (на текущий момент):**

- Локализация дат/чисел по локали (можно добавить отдельной story позже)
- Локализация документации (README, QUICKSTART) — отдельная задача при необходимости
- Локализация сообщений SDK/API для разработчиков (опционально, P2+)

---

## 📊 Sprint Planning

### Sprint 1-2: Foundation

- E1-S1: packages/core
- E1-S2: packages/db
- E1-S3: packages/shared
- E1-S4: packages/sdk

### Sprint 2-3: API Migration

- E1-S5: apps/api создание
- E1-S6: Endpoints миграция
- E2-S1: Tenant/Project модели

### Sprint 3-4: Multi-tenant

- E2-S2: tenantId/projectId в таблицах
- E2-S3: Backfill данных
- E2-S4: Project-scoped endpoints

### Sprint 4-5: Security

- E3-S1: JWT guard
- E3-S2: User tokens
- E3-S3: Project tokens
- E2-S5: RLS политики
- E2-S6: Контекст в запросах

### Sprint 5-6: Dashboard

- E4-S1: apps/web создание
- E4-S2: HTTP клиент
- E4-S3: Удаление DB доступа
- E4-S4: User auth flow

### Sprint 6-7: Management & DX

- E4-S5: Tenant/Project UI
- E4-S6: Token management UI
- E5-S1: SDK обновление
- E5-S2: Документация
- E7-S1: Инфраструктура i18n в Dashboard
- E7-S2: Переключатель языка и персистенция
- E7-S3: Перевод сообщений API в UI

### Sprint 7-8: Operations

- E6-S1: Rate limiting
- E6-S2: Observability
- E6-S4: Health checks
- E6-S5: Deployment automation

---

## 🔄 Backlog Maintenance

**Обновление:** Еженедельно  
**Приоритизация:** По бизнес-ценности и техническим зависимостям  
**Refinement:** Перед каждым спринтом

---

## 📚 Связанные документы

- [Product Vision](./product-vision.md)
- [Productization Plan](./productization-multi-tenant-nestjs.md)
- [Architecture](./architecture.md)
