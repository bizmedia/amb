# Database Schema Documentation

## Overview

Agent Message Bus использует SQLite через Prisma для локальной разработки.

## Models

### Agent

Представляет зарегистрированного агента в системе.

- `id` (String, UUID) - уникальный идентификатор
- `name` (String) - имя агента
- `role` (String) - роль агента (например, "dev", "qa", "architect")
- `status` (String, default: "online") - статус агента
- `capabilities` (Json, optional) - дополнительные возможности агента
- `createdAt` (DateTime) - время создания
- `lastSeen` (DateTime, optional) - последнее время активности

### Thread

Представляет поток сообщений (беседу) между агентами.

- `id` (String, UUID) - уникальный идентификатор
- `title` (String) - заголовок треда
- `status` (String, default: "open") - статус треда (open, closed)
- `createdAt` (DateTime) - время создания
- `messages` (Message[]) - сообщения в треде

### Message

Представляет сообщение в треде.

- `id` (String, UUID) - уникальный идентификатор
- `threadId` (String) - ID треда
- `thread` (Thread) - связь с тредом
- `fromAgentId` (String) - ID агента-отправителя
- `toAgentId` (String, optional) - ID агента-получателя (null для broadcast)
- `payload` (Json) - содержимое сообщения
- `status` (String, default: "pending") - статус: pending, delivered, ack, dlq
- `retries` (Int, default: 0) - количество попыток доставки
- `parentId` (String, optional) - ID родительского сообщения (для цепочек ответов)
- `parent` (Message, optional) - связь с родительским сообщением
- `replies` (Message[]) - ответы на это сообщение
- `createdAt` (DateTime) - время создания

## Indexes

Для оптимизации запросов созданы индексы:

- `Message.threadId` - быстрый поиск сообщений в треде
- `Message.toAgentId` - быстрый поиск входящих сообщений (inbox)
- `Message.fromAgentId` - быстрый поиск исходящих сообщений
- `Message.status` - фильтрация по статусу
- `Message.createdAt` - сортировка по времени

## Relations

- Thread → Message (one-to-many)
- Message → Thread (many-to-one)
- Message → Message (self-relation для replies)

## Database Choice: SQLite

**ADR**: Выбран SQLite для локальной разработки по следующим причинам:

1. **Простота**: Не требует отдельного сервера БД
2. **Локальность**: Файл `dev.db` хранится в проекте
3. **Достаточность**: Для MVP и локальной разработки SQLite покрывает все потребности
4. **Скорость**: Быстрая работа для небольших объемов данных
5. **Миграции**: Prisma поддерживает SQLite миграции

Для production можно легко переключиться на PostgreSQL, изменив `provider` в `datasource db`.
