# Анализ требований: Productization Multi-Tenant NestJS

**Дата:** 2026-01-28  
**Автор:** Product Owner Agent  
**Документ:** `docs/product/productization-multi-tenant-nestjs.md`

---

## 📋 Резюме

Анализ завершен. Документ описывает превращение mcp-message-bus в переиспользуемый hosted multi-tenant продукт. Все ключевые архитектурные решения приняты, backlog структурирован, готов к началу реализации.

---

## 1. Бизнес-требования и цели

### Цель
Превратить mcp-message-bus в **переиспользуемый hosted multi-tenant продукт** с возможностью использования одним сервисом для множества проектов.

### Ключевые фичи
- **Nest.js backend** отдельно от Dashboard
- **JWT авторизация** (user tokens + project tokens)
- **Multi-tenant модель** (Tenant → Projects)
- **PostgreSQL с RLS** для изоляции данных
- **Dashboard как отдельное Next.js приложение** (без прямого доступа к БД)

### Целевая аудитория
- Разработчики (интеграция через SDK)
- Команды (управление проектами в tenant)
- Администраторы (управление tenant'ами и токенами)

---

## 2. Приоритеты и зависимости

### Приоритеты (P0)

1. **Epic 1: Архитектурная миграция**
   - Выделение packages (core/db/shared/sdk)
   - Создание apps/api (Nest.js)
   - Миграция endpoints

2. **Epic 2: Multi-tenant инфраструктура**
   - Tenant/Project модели
   - Project-scoped данные
   - RLS политики

3. **Epic 3: JWT авторизация**
   - User tokens (Dashboard)
   - Project tokens (интеграции)
   - Admin API для управления

4. **Epic 4: Dashboard миграция**
   - apps/web (Next.js)
   - HTTP клиент к apps/api
   - Удаление прямого доступа к БД

### Приоритеты (P1)

5. **Epic 5: Developer Experience**
   - SDK обновление
   - Документация
   - Примеры интеграций

6. **Epic 6: Операционная готовность**
   - Rate limiting
   - Observability
   - Deployment automation

### Зависимости между фазами

```
Phase 1: Выделение packages (core/db/shared/sdk)
    ↓
Phase 2: Создание apps/api (Nest.js) - зависит от Phase 1
    ↓
Phase 3: Multi-tenant модель - зависит от Phase 2
    ↓
Phase 4: JWT auth - зависит от Phase 3
    ↓
Phase 5: Dashboard миграция - зависит от Phase 4
```

**Блокирующие зависимости:** Да, строгий порядок выполнения необходим.

---

## 3. Открытые вопросы

### ✅ Решенные вопросы

1. **Hosting инфраструктура**
   - ✅ Решение: Kubernetes + Podman
   - ✅ ADR-009 принят

2. **User authentication**
   - ✅ Решение: Собственная users table
   - ✅ ADR-010 принят

3. **RBAC модель**
   - ✅ Решение: 3 роли (tenant-admin, project-admin, reader)
   - ✅ ADR-011 принят

### ⏳ Ожидающие решения (не блокируют MVP)

4. **Workers Architecture**
   - Статус: Вопросы заданы Architect
   - Требуется: ADR-012
   - Блокер: Нет (можно начать с простого решения)

5. **Scaling Strategy**
   - Статус: Вопросы заданы Architect
   - Требуется: ADR-013
   - Блокер: Нет (можно начать с single instance)

---

## 4. Оценка сложности и рисков

### Оценка сложности по фазам

| Фаза | Сложность | Обоснование |
|------|-----------|-------------|
| Phase 1: Packages | Medium | Рефакторинг существующего кода, низкий риск |
| Phase 2: Nest.js API | High | Создание нового приложения, миграция endpoints |
| Phase 3: Multi-tenant | High | Миграция данных + RLS, критично для безопасности |
| Phase 4: JWT auth | Medium | Интеграция JWT, стандартные паттерны |
| Phase 5: Dashboard | Medium | Миграция UI на HTTP клиент |

### Риски

1. **Миграция данных (Phase 3)**
   - Риск: Высокий
   - Мера: Детальный план миграции, тестирование на копии данных
   - Митигация: Постепенная миграция, rollback план

2. **RLS производительность (Phase 3)**
   - Риск: Средний
   - Мера: Тестирование на раннем этапе, мониторинг производительности
   - Митигация: Оптимизация политик, индексы

3. **Backward compatibility (Phase 1-5)**
   - Риск: Средний
   - Мера: Переходный период, поддержка legacy API
   - Митигация: Версионирование API, migration guide

---

## 5. Рекомендации по порядку реализации

### Немедленные действия (Sprint 1-2)

1. **Начать с Phase 1 (packages)**
   - Низкий риск
   - Высокая ценность (фундамент для всего)
   - Не блокирует другие работы

2. **Порядок создания packages:**
   - `packages/shared` (первым, используется всеми)
   - `packages/core` (доменная логика)
   - `packages/db` (Prisma + RLS)
   - `packages/sdk` (TypeScript SDK)

### Среднесрочные действия (Sprint 2-5)

3. **Создать детальный план миграции данных перед Phase 3**
   - Определить стратегию backfill
   - Протестировать на копии данных
   - Подготовить rollback план

4. **Тестировать RLS на раннем этапе**
   - Создать тестовые политики
   - Измерить влияние на производительность
   - Оптимизировать до production

### Долгосрочные действия (Sprint 5+)

5. **Поддерживать backward compatibility в течение переходного периода**
   - Legacy API endpoints
   - Migration guide для пользователей
   - Deprecation timeline

---

## 6. Документация

### Созданные документы

- ✅ `docs/product/product-vision.md` — продуктовое видение
- ✅ `docs/product/backlog.md` — детальный backlog (6 Epic'ов, 35 Stories)
- ✅ `docs/archive/sprint-1-2-action-plan.md` — план Sprint 1-2
- ✅ `docs/reference/inbox-status.md` — статус входящих

### ADR (Architecture Decision Records)

- ✅ ADR-005: Nest.js Backend
- ✅ ADR-006: Multi-Tenant Model
- ✅ ADR-007: JWT Auth
- ✅ ADR-008: PostgreSQL RLS
- ✅ ADR-009: Hosting Infrastructure
- ✅ ADR-010: User Authentication
- ✅ ADR-011: RBAC Model
- ⏳ ADR-012: Workers Architecture (ожидается)
- ⏳ ADR-013: Scaling Strategy (ожидается)

---

## 7. Готовность к старту

### ✅ Готово

- Все архитектурные решения для MVP приняты
- Backlog структурирован и приоритизирован
- Sprint planning готов
- Детальный план Sprint 1-2 создан

### ⏳ В ожидании (не блокирует)

- ADR-012: Workers Architecture
- ADR-013: Scaling Strategy

### 🚀 Следующий шаг

**Начать Sprint 1-2: Foundation**
- E1-S1: Выделить `packages/core`
- E1-S2: Выделить `packages/db`
- E1-S3: Выделить `packages/shared`
- E1-S4: Выделить `packages/sdk`

**Блокеров нет. Готов к старту.**

---

## 8. Метрики успеха

| Метрика | Цель | Текущее состояние |
|---------|------|-------------------|
| Принятых решений | 100% | 7/9 (78%) |
| Stories готовых к работе | 4+ | 4 (Sprint 1-2) |
| Блокеров | 0 | 0 ✅ |
| Документация | Полная | ✅ Готово |

---

**Статус:** ✅ Анализ завершен, проект готов к началу реализации Sprint 1-2.
