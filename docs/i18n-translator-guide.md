# Руководство для переводчиков Dashboard (i18n)

**Обновлено:** 2026-03-16  
**Область:** `apps/web` (Next.js + `next-intl`)

## Где лежат переводы

- Файлы переводов: `apps/web/messages/en.json`, `apps/web/messages/ru.json`, `apps/web/messages/de.json`
- Список поддерживаемых языков: `apps/web/i18n/routing.ts` (`routing.locales`)
- Загрузка словарей: `apps/web/i18n/request.ts`

## Формат и конвенции ключей

- Формат: один JSON-файл на язык.
- Неймспейсы: `PascalCase` (`Common`, `Dashboard`, `ProjectSwitcher`, `Tokens`).
- Ключи внутри неймспейса: `camelCase` (`loadingProjects`, `createToken`, `apiErrors.invalidParams`).
- Ключи должны совпадать во всех языках 1:1.
- Не менять ключи без задачи от разработчика: переименование ломает вызовы `t("...")` в коде.

## Как добавить новый язык

1. Добавить локаль в `apps/web/i18n/routing.ts` (в `locales`).
2. Создать новый файл `apps/web/messages/<locale>.json` на основе `en.json`.
3. Перевести все значения, не меняя структуру и ключи.
4. Добавить читаемое имя языка в `apps/web/components/dashboard/locale-switcher.tsx` (`localeLabels`).
5. Проверить запуск:
   - `pnpm --filter ./apps/web typecheck`
   - `pnpm --filter ./apps/web build`

## Правила перевода

- Плейсхолдеры вида `{count}`, `{status}` сохранять без изменений.
- Технические идентификаторы (`threadId`, `messageId`, `UUID`, API code) не переводить.
- Для кнопок использовать короткие императивы, для ошибок - понятные человеку формулировки.
- Не добавлять HTML/Markdown в строки, если это не предусмотрено ключом.

## Перевод ошибок API

- В UI нельзя показывать "сырые" коды ошибок от API.
- Маппинг кода API -> ключ перевода расположен в `apps/web/lib/api/error-i18n.ts`.
- Текст ошибок хранится в `Common.apiErrors.*` во всех `messages/*.json`.
- Если появляется новый код ошибки API:
  1. Добавить mapping в `error-i18n.ts`.
  2. Добавить новый ключ в `Common.apiErrors` во все языки.
  3. Проверить экран, где эта ошибка показывается.

## Мини-чеклист перед PR

- Структура ключей одинакова между `en/ru/de` (+ новым языком, если добавлялся).
- Нет пропущенных ключей в `Common.apiErrors`.
- Переключение языка в UI работает и сохраняется (`NEXT_LOCALE`, `amb:locale`).
- `typecheck` и `build` для `apps/web` проходят.
