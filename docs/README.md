# Документация репозитория AMB

Точка входа по типам артефактов. Файлы сгруппированы по папкам; **исторические** материалы лежат в [`archive/`](./archive/README.md).

---

## Быстрая навигация по роли

| Задача | Куда смотреть |
|--------|----------------|
| Первый запуск, tenant, проект, MCP | [`guides/developer-runbook.md`](./guides/developer-runbook.md) |
| Обзор системы | [`architecture.md`](./architecture.md) |
| API (REST) | [`reference/api.md`](./reference/api.md) |
| Скрипты монорепо | [`reference/SCRIPTS.md`](./reference/SCRIPTS.md) |
| Продукт, бэклог | [`product/product-vision.md`](./product/product-vision.md), [`product/backlog.md`](./product/backlog.md) |
| Решения «почему так» | [`adr/README.md`](./adr/README.md) |
| Требования к фичам | [`prd/`](./prd/) — все `PRD-*.md |
| Деплой и аварии | [`runbooks/`](./runbooks/) |

---

## Структура каталогов

| Каталог | Назначение |
|---------|------------|
| **`prd/`** | Product Requirements Documents (`PRD-*.md`) |
| **`product/`** | Видение, бэклог, use-cases, планы productization / QA |
| **`guides/`** | Онбординг, интеграция SDK, миграции, i18n для переводчиков |
| **`reference/`** | Справочники: API, SCRIPTS, служебные статусы |
| **`runbooks/`** | Эксплуатация: деплой, disaster recovery |
| **`architecture/`** | Доп. архитектурные материалы (kernel enterprise, multi-tenant options, technical design vNext) |
| **`adr/`** | Architecture Decision Records |
| **`epics/`** | Декомпозиция крупных эпиков (например E9A–E9C) |
| **`ux/`** | UX review, design system |
| **`archive/`** | Устаревшие workflow и agent-tasks по эпикам (история) |

Корень **`docs/`**: [`architecture.md`](./architecture.md) (главный обзор), этот `README.md`, при необходимости [`production-checklist.md`](./production-checklist.md).

---

## Связка PRD ↔ ADR (ориентир)

| Тема | PRD | ADR (пример) |
|------|-----|----------------|
| Ключи задач, эпики, спринты | [`prd/PRD-issue-keys-epics-sprints.md`](./prd/PRD-issue-keys-epics-sprints.md) | [ADR-014](./adr/ADR-014-issue-keys-epics-sprints.md) |
| Сообщения ↔ задачи (`tasksTouched`) | [`prd/PRD-message-task-linking.md`](./prd/PRD-message-task-linking.md) | [ADR-020](./adr/ADR-020-message-task-linking-schema.md) |
| Память планирования, зависимости | [`prd/PRD-planning-memory-dependencies-status.md`](./prd/PRD-planning-memory-dependencies-status.md) | см. PRD-task-links + будущие ADR |

Полный список ADR: [`adr/README.md`](./adr/README.md).
