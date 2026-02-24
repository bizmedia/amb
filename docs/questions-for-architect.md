# Вопросы для Architect

**Дата:** 2026-01-28  
**От:** Product Owner  
**Статус:** Требуется решение

---

## 🎯 Workers Architecture

### Контекст

Текущая реализация использует простые скрипты:
- `scripts/retry-worker.ts` — retry логика для timed-out messages
- `scripts/cleanup.ts` — cleanup старых данных
- `scripts/orchestrator.ts` — оркестрация workflow

Для Product vNext (Nest.js backend, multi-tenant) нужно решить архитектуру workers.

### Вопросы

1. **Архитектура workers:**
   - Единые воркеры на весь сервис (один процесс обрабатывает все tenant'ы)?
   - Или шардированные воркеры (по tenant/project)?

2. **Интеграция с Nest.js:**
   - Background jobs внутри Nest.js приложения (через @nestjs/bull или @nestjs/schedule)?
   - Или отдельные worker процессы (отдельные контейнеры в Kubernetes)?

3. **Scaling strategy:**
   - Как масштабировать workers при росте нагрузки?
   - Horizontal scaling (несколько worker инстансов)?
   - Как избежать дублирования работы (distributed locks)?

4. **Multi-tenant considerations:**
   - Нужна ли изоляция workers по tenant?
   - Как обрабатывать retry для разных tenant'ов параллельно?

### Текущее состояние

```typescript
// scripts/retry-worker.ts
// Простой скрипт, который:
// 1. Находит timed-out messages (status="delivered", createdAt < threshold)
// 2. Retry или перемещает в DLQ
// 3. Завершается
```

### Требования

- **MVP:** Простое решение для начала
- **Production:** Масштабируемое и надежное
- **Multi-tenant:** Изоляция данных между tenant'ами

### Ожидаемый результат

ADR с решением по:
- Архитектуре workers (единые vs шардированные)
- Интеграции с Nest.js
- Scaling strategy
- Multi-tenant considerations

---

## 📊 Scaling Strategy

### Контекст

Product vNext должен поддерживать:
- Множество tenant'ов
- Множество проектов на tenant
- Высокую нагрузку на messaging

### Вопросы

1. **Horizontal scaling:**
   - Как масштабировать `apps/api` (Nest.js)?
   - Нужен ли load balancer?
   - Stateless ли приложение (можно ли запускать несколько инстансов)?

2. **Database scaling:**
   - PostgreSQL connection pooling
   - Read replicas для чтения?
   - Sharding по tenant'ам (если нужно)?

3. **Caching:**
   - Нужен ли Redis для кеширования?
   - Какие данные кешировать?
   - Session storage для JWT?

4. **Message throughput:**
   - Как обрабатывать высокую нагрузку на messaging?
   - Очереди (Bull/BullMQ) для асинхронной обработки?
   - Batch processing?

### Требования

- **MVP:** Простое решение (single instance)
- **Production:** Масштабируемое решение
- **Cost-effective:** Не переусложнять на старте

### Ожидаемый результат

ADR с решением по:
- Horizontal scaling strategy
- Database scaling approach
- Caching strategy (если нужен)
- Message throughput optimization

---

## 📝 Примечания

- Начать с простого решения для MVP
- Предусмотреть путь масштабирования
- Учесть multi-tenant изоляцию
- Документировать trade-offs
