# Completion Report: Triage ADR-015–019

**Роль:** System Architect  
**Дата:** 2026-03-29  
**Статус работ:** завершено (документация и указатель ADR)

---

## 1. Цель

Провести triage записей ADR-015…019 относительно [kernel baseline](../architecture/kernel-architecture-enterprise.md), зафиксировать статусы (принять / отклонить / разбить), обновить [указатель ADR](./README.md) и зафиксировать итог в отчёте.

---

## 2. Итог triage

| ADR | Решение | Обоснование |
|-----|---------|-------------|
| **ADR-015** | **Разбить** | Один документ смешивает границу kernel, policy, cost/budget и routing; для enterprise-канона нужны раздельные нормативные ADR. |
| **ADR-016** | **Принять** | Задаёт обязательную границу kernel и модель Control/Data Plane; согласовано с enterprise baseline. |
| **ADR-017** | **Принять** | Единый `PolicyDecision`, приоритеты, enforcement points и аудит — основа Control Plane. |
| **ADR-018** | **Принять** | Источник истины по usage/cost, fallback estimated, soft budgets без hard cap в v1. |
| **ADR-019** | **Принять** | Directed-by-default, управляемый broadcast, cursor-first и anti-amplification — обязательная routing/delivery дисциплина. |

**Отклонённые:** нет.

---

## 3. Соответствие ADR-015 → дочерние ADR

| Тематика из ADR-015 | Нормативный ADR |
|---------------------|-----------------|
| Kernel boundary, planes, запрет смешения с продуктом | ADR-016 |
| Enterprise rules, policy contract | ADR-017 |
| LLM usage/cost observability, soft budgets | ADR-018 |
| Routing efficiency, broadcast governance, retrieval | ADR-019 |

Содержимое ADR-015 после разбиения: **план фаз, Prisma/API/UI и open questions** — не отменяет ADR-016…019; при конфликте приоритет у принятых дочерних ADR и у `kernel-architecture-enterprise.md`.

---

## 4. Поставленные артефакты

| Артефакт | Действие |
|----------|----------|
| [README.md](./README.md) | Секция triage, таблицы принятых/разбитых, сводка gates и kernel/plane для 016–019 |
| [ADR-015](./ADR-015-llm-cost-observability-and-routing-efficiency.md) | Статус «Разбито», таблица замены |
| [ADR-016](./ADR-016-kernel-boundary-and-plane-model.md) … [ADR-019](./ADR-019-routing-efficiency-and-broadcast-governance.md) | Статус «Принято» |
| [kernel-architecture-enterprise.md](../architecture/kernel-architecture-enterprise.md) | Ссылка на принятые ADR и примечание по ADR-015 |
| `completion-report-adr-015-019.md` | Настоящий отчёт |

---

## 5. Acceptance gates (напоминание)

Критерии принятия заданы в телах ADR-016…019 и сведены в таблице в [README.md](./README.md) (раздел «Принятые ADR-016–019: acceptance gates, kernel и плоскости»). Исполнение по коду и тестам **не входит** в этот completion report — только зафиксированная архитектурная позиция.

---

## 6. Следующие шаги (вне scope отчёта)

1. Реализация контрактов из ADR-018/019 в API, SDK и observability.
2. Закрытие open questions в хвосте ADR-015 (валюта, экспорт, видимость cost по ролям, hard cap в будущих версиях).
3. Новые ADR при изменении контрактов — с явной пометкой plane (требование ADR-016).

---

## 7. Проверка согласованности

- [x] Статусы в шапках ADR-015…019 совпадают с указателем в README.
- [x] ADR-015 не числится в таблице «Принятые» как единый нормативный документ.
- [x] Enterprise baseline ссылается на ADR-016…019 как на принятые.

---

## 8. Задача шины **AMB-0029** (закрыта)

| Поле | Значение |
|------|----------|
| Ключ | `AMB-0029` |
| Название | ADR-015–019: triage и acceptance |
| Описание задачи | `docs/adr/README.md` — принять/отклонить/разбить; связь с `kernel-architecture-enterprise.md`. |
| Статус в AMB | **DONE** (после верификации артефактов) |
| Исполнитель (в шине) | System Architect |

**Соответствие scope:** triage, обновление README, связь с enterprise baseline, completion report — покрыты разделами 1–7 настоящего документа.

**Коммиты (история репозитория, ветка `feature/redesign`):**

- `5693d95` — `docs(adr): принять ADR-016–019, разбить ADR-015, обновить указатель` (статусы ADR, README, `kernel-architecture-enterprise.md`).
- `721bcd9` — `docs(adr): triage ADR-015–019 в README и completion report` (секция Triage в README, первоначальная версия отчёта).
- Закрытие **AMB-0029** и §8 отчёта: коммит с сообщением `docs(adr): AMB-0029 — §8 в completion-report (закрытие задачи)` на ветке разработки (актуальный SHA: `git log -1 --oneline -- docs/adr/completion-report-adr-015-019.md`).
