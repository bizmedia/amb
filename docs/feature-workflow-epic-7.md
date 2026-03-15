# Feature Workflow: Epic 7 — Локализация (i18n)

**Тред:** feature-workflow  
**Открыт:** 2026-03-15  
**Оркестратор:** orchestrator  
**Статус:** 🚧 In Progress  

**Message Bus (MCP):** тред создан; задачи разосланы **Frontend** (react-next-engineer).  

- **Thread ID:** `496d879e-a160-47b4-b51d-04ae9f3586c8`  
- **Статус треда:** open  
- E7-S1 Done (react-next-engineer). Architect отчитался. Текущая: E7-S2.

---

## Цель

Все сообщения интерфейса Dashboard поддерживают перевод; пользователь может выбрать язык (минимум en + ru).

---

## Распределение

| Область      | Содержание           | Агент               | В message bus     |
| ------------ | -------------------- | ------------------- | ----------------- |
| **Frontend** | apps/web, i18n       | react-next-engineer  | area: frontend    |
| Architect    | по запросу (библиотека i18n, конвенции) | architect | on_demand |
| QA           | проверки после stories | qa                  | queued            |


---

## Порядок работ

| Шаг | Story | Описание                          | Статус      |
| --- | ----- | --------------------------------- | ----------- |
| 1   | E7-S1 | Инфраструктура i18n в Dashboard   | ✅ Done     |
| 2   | E7-S2 | Переключатель языка и персистенция | 📋 Текущая  |
| 3   | E7-S3 | Перевод сообщений API в UI        | 📋 Queued   |
| 4   | E7-S4 | Документация для переводчиков     | 📋 Queued   |


---

## Контекст

- **Backlog:** [docs/backlog.md](./backlog.md) — Epic 7, E7-S1…E7-S4  
- **Scope:** Dashboard UI (apps/web), сообщения API в UI, выбор языка (localStorage / user prefs).


---

## Разданные задачи

| Агент               | Задача                           | Story | Статус   |
| ------------------- | -------------------------------- | ----- | -------- |
| **react-next-engineer** | Инфраструктура i18n в Dashboard | E7-S1 | Done     |
| **react-next-engineer** | Переключатель языка, E7-S3/S4  | E7-S2…E7-S4 | Текущая / Queued |
| Architect              | По запросу (i18n, ключи)      | —     | Done     |
| QA                    | Проверки после stories        | —     | Queued   |


---

## Отслеживание

- Завершение story → обновить [backlog.md](./backlog.md) и эту таблицу.  
- **MCP:** тред `496d879e-a160-47b4-b51d-04ae9f3586c8`. react-next-engineer `72c8cb90-…`, Architect `d6703179-…`, QA `aa052ead-…`.
