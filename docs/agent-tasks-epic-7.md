# Задачи агентов: Epic 7 — Локализация (i18n)

**Обновлено:** 2026-03-16 (react-next-engineer, после E7-S4)  
**Тред:** [feature-workflow-epic-7.md](./feature-workflow-epic-7.md)  
**Message Bus:** тред `496d879e-a160-47b4-b51d-04ae9f3586c8`

---

## Frontend (react-next-engineer / Dev)

**Область:** apps/web, Dashboard, i18n

### ✅ E7-S1 — Инфраструктура i18n в Dashboard — Done

next-intl подключена, маршрутизация по locale, UI в ключах, en/ru/de. Evidence: `apps/web/i18n/*`, `messages/{en,ru,de}.json`, inbox-viewer, thread-viewer, tasks-module.

### ✅ E7-S2 — Переключатель языка и персистенция — Done

Переключатель в Dashboard добавлен (`locale-switcher.tsx`), язык сохраняется в `NEXT_LOCALE` cookie и `localStorage` (`amb:locale`), при загрузке применяется выбранная локаль.

### ✅ E7-S3 — Перевод сообщений API в UI — Done

Добавлен централизованный маппинг ошибок API -> ключи i18n (`apps/web/lib/api/error-i18n.ts`), подключен в auth/project/tokens/tasks/messages flows; сырые API-строки не показываются пользователю.

### ✅ E7-S4 — Документация для переводчиков — Done

Подготовлен процесс для переводчиков: [i18n-translator-guide.md](./i18n-translator-guide.md) (формат файлов, добавление локали, конвенции ключей, API error mapping, чеклист).

---

## Architect

**Done:** architecture.md — E7 в таблице, подраздел «Локализация (Epic 7)» (next-intl, messages, конвенции, error-i18n, amb:locale). v1.3 (16.03.2026).

## QA

**Queued:** regression/smoke по i18n (переключение, ключи, API errors на разных локалях).
