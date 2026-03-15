# Задачи агентов: Epic 7 — Локализация (i18n)

**Обновлено:** 2026-03-15 (Orchestrator, после E7-S1 + Architect)  
**Тред:** [feature-workflow-epic-7.md](./feature-workflow-epic-7.md)  
**Message Bus:** тред `496d879e-a160-47b4-b51d-04ae9f3586c8`

---

## Frontend (react-next-engineer / Dev)

**Область:** apps/web, Dashboard, i18n

### ✅ E7-S1 — Инфраструктура i18n в Dashboard — Done

next-intl подключена, маршрутизация по locale, UI в ключах, en/ru/de. Evidence: `apps/web/i18n/*`, `messages/{en,ru,de}.json`, inbox-viewer, thread-viewer, tasks-module.

### Текущая задача: E7-S2 — Переключатель языка и персистенция

**Статус:** Текущая | **area:** frontend

**Сделать:** переключатель в UI, сохранение языка между сессиями (localStorage / user prefs), при загрузке — сохранённый язык.

### Очередь

| Story   | Задача |
|---------|--------|
| E7-S3   | Перевод сообщений API в UI (ключи/маппинг, без «сырых» строк от API) |
| E7-S4   | Документация для переводчиков (процесс, формат файлов, конвенции) |

---

## Architect

**Done:** architecture.md — E7 в таблице, подраздел «Локализация (Epic 7)» (next-intl, messages, конвенции, error-i18n, amb:locale). v1.3 (16.03.2026).

## QA

**Queued:** после E7-S1/S2 (переключатель, 2 языка), после E7-S3 (перевод API-сообщений в UI).
