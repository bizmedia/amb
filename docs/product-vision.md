# Product Vision: Agent Message Bus

**Версия:** 2.0  
**Дата:** 2026-01-28  
**Автор:** Product Owner Agent  
**Статус:** Актуально

---

## 🎯 Продуктовое видение

Agent Message Bus — это **hosted multi-tenant сервис** для оркестрации AI-агентов через надежную шину сообщений с гарантией доставки.

### Целевая аудитория

1. **Разработчики** — интеграция AI-агентов в свои проекты через SDK
2. **Команды** — управление несколькими проектами в рамках tenant
3. **Администраторы** — управление tenant'ами, проектами и токенами через Dashboard

---

## 🚀 Продуктовые цели

| Цель | Описание | Метрика успеха |
|------|----------|---------------|
| **Надежность** | Гарантия доставки сообщений между агентами | 99.9% доставка, <0.1% в DLQ |
| **Простота интеграции** | Быстрый старт для разработчиков | <15 минут от установки до первого сообщения |
| **Масштабируемость** | Поддержка множества проектов и агентов | 1000+ проектов на tenant, 100+ агентов на проект |
| **Безопасность** | Изоляция данных между tenant'ами и проектами | Zero cross-tenant access incidents |
| **Операционная готовность** | Production-ready сервис | 99.9% uptime, <500ms p95 latency |

---

## 📊 MVP vs Future Scope

### ✅ MVP v1 (Завершено)

**Цель:** Локальный инструмент для разработки

* ✅ Next.js монолит (API + UI)
* ✅ PostgreSQL база данных
* ✅ Thread-based messaging
* ✅ Inbox + ACK механизм
* ✅ Retry + DLQ
* ✅ MCP интеграция
* ✅ TypeScript SDK
* ✅ Dashboard UI

**Ограничения:**
- Только локальное развертывание
- Нет аутентификации
- Single-user scenario

---

### 🚧 Product vNext (В разработке)

**Цель:** Hosted multi-tenant продукт

#### Epic 1: Архитектурная миграция
- [x] ADR-005: Nest.js backend
- [x] ADR-006: Multi-tenant модель
- [x] ADR-007: JWT авторизация
- [x] ADR-008: PostgreSQL RLS
- [ ] Выделение packages (core/db/shared/sdk)
- [ ] Миграция API в `apps/api`
- [ ] Разделение Dashboard в `apps/web`

#### Epic 2: Multi-tenant инфраструктура
- [ ] Tenant и Project модели в БД
- [ ] Миграция существующих данных в default tenant/project
- [ ] Project-scoped API endpoints
- [ ] RLS политики в PostgreSQL
- [ ] Контекст tenant/project в запросах

#### Epic 3: JWT авторизация
- [ ] JWT guard в Nest.js
- [ ] User tokens (для Dashboard)
- [ ] Project tokens (для интеграций)
- [ ] Admin API для управления токенами
- [ ] Token rotation и revocation
- [ ] Audit логирование

#### Epic 4: Dashboard как продукт
- [ ] Next.js Dashboard (`apps/web`)
- [ ] HTTP клиент к `apps/api`
- [ ] Удаление прямого доступа к БД
- [ ] User authentication flow
- [ ] Tenant/Project management UI
- [ ] Token management UI

#### Epic 5: Developer Experience
- [ ] Обновленный SDK с JWT поддержкой
- [ ] Документация по интеграции
- [ ] Docker Compose для локальной разработки
- [ ] Migration guide для существующих пользователей
- [ ] Примеры интеграций

#### Epic 6: Операционная готовность
- [ ] Rate limiting
- [ ] Observability (логи/метрики/трейсинг)
- [ ] Health checks
- [ ] Deployment automation
- [ ] Backup и disaster recovery

#### Epic 7: Локализация (i18n)
- [ ] Инфраструктура i18n в Dashboard (все тексты UI через ключи переводов)
- [ ] Переключатель языка и сохранение выбора
- [ ] Перевод в UI сообщений/ошибок от API
- [ ] Минимум 2 языка (en + один дополнительный)

---

### 🔮 Future Scope (Post-MVP)

#### Multi-region deployment
- Географическое распределение
- Репликация данных
- Low-latency routing

#### Advanced features
- WebSocket для real-time обновлений
- Message routing rules
- Priority queues
- Scheduled messages
- Message replay

#### Enterprise features
- SSO интеграция
- Advanced RBAC
- Compliance и audit logs
- SLA гарантии
- Dedicated instances

---

## 🎯 Приоритеты

### P0 (Критично для vNext)
1. Архитектурная миграция (packages + Nest.js API)
2. Multi-tenant модель (Tenant/Project + RLS)
3. JWT авторизация (user + project tokens)
4. Dashboard миграция на HTTP клиент

### P1 (Важно для MVP)
5. Developer Experience (SDK, документация)
6. Операционная готовность (observability, rate limiting)
7. Локализация (i18n) — все сообщения интерфейса переводимы на разные языки

### P2 (Post-MVP)
7. Advanced features
8. Enterprise features

---

## 📈 Roadmap

### Q1 2026: Product vNext Foundation
- ✅ Архитектурные решения (ADR-005, ADR-006, ADR-007, ADR-008)
- 🚧 Выделение packages
- 🚧 Nest.js API миграция
- 🚧 Multi-tenant модель

### Q2 2026: Security & Isolation
- JWT авторизация
- RLS включение
- Dashboard миграция
- Token management

### Q3 2026: Production Readiness
- Observability
- Rate limiting
- Deployment automation
- Documentation

### Q4 2026: Scale & Enhancements
- Performance optimization
- Advanced features
- Enterprise readiness

---

## 🔄 Миграционная стратегия

### Для существующих пользователей (v1 → vNext)

1. **Backward compatibility период**
   - Поддержка legacy API endpoints
   - Автоматическая миграция данных в default tenant/project

2. **Migration guide**
   - Пошаговая инструкция
   - SDK обновление
   - Примеры кода

3. **Support**
   - Migration support канал
   - FAQ и troubleshooting

---

## 📝 Принятые решения

Все архитектурные решения задокументированы в ADR:
- [ADR-005: Nest.js Backend](./adr/ADR-005-nestjs-backend.md)
- [ADR-006: Multi-Tenant Model](./adr/ADR-006-multi-tenant-model.md)
- [ADR-007: JWT Auth](./adr/ADR-007-jwt-and-project-tokens.md)
- [ADR-008: PostgreSQL RLS](./adr/ADR-008-postgres-rls.md)
- [ADR-009: Hosting Infrastructure](./adr/ADR-009-hosting-and-infrastructure.md)
- [ADR-010: User Authentication](./adr/ADR-010-user-authentication.md)
- [ADR-011: RBAC Model](./adr/ADR-011-rbac-model.md)

### Ожидаемые ADR (требуется решение от Architect)
- ADR-012: Workers Architecture
- ADR-013: Scaling Strategy

---

## ✅ Принятые решения

### Hosting инфраструктура
- **Решение:** Kubernetes, Podman
- **Обоснование:** Контейнеризация для portability, Kubernetes для orchestration
- **Статус:** Принято (2026-01-28)

### User authentication
- **Решение:** Собственная users table
- **Обоснование:** Простота для MVP, полный контроль над пользователями
- **OAuth providers:** Не требуется на старте (может быть добавлено позже)
- **Статус:** Принято (2026-01-28)

### RBAC модель
- **Роли:**
  - `tenant-admin` — полный доступ к tenant и всем проектам
  - `project-admin` — управление конкретным проектом
  - `reader` — только чтение данных проекта
- **Permissions granularity:** Role-based (не fine-grained permissions на старте)
- **Статус:** Принято (2026-01-28)

### Workers архитектура
- **Статус:** Требуется архитектурное решение
- **Вопросы для Architect:**
  - Единые воркеры на весь сервис или шардированные?
  - Scaling strategy для workers?
  - Интеграция с Nest.js (background jobs vs отдельные процессы)?
- **Текущее состояние:** Простые скрипты (retry-worker, cleanup, orchestrator)
- **Требуется:** ADR от Architect

---

## 📚 Связанные документы

- [Productization Plan](./productization-multi-tenant-nestjs.md)
- [Architecture](./architecture.md)
- [ADR Index](./adr/README.md)
