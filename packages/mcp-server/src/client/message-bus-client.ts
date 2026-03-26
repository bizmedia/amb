/**
 * Порт доступа к HTTP API шины сообщений.
 * Реализации можно подменять (тесты, другой транспорт) без изменения обработчиков инструментов.
 */
export interface MessageBusClient {
  /** Выполняет запрос и возвращает поле `data` из JSON-ответа API. */
  requestJson<T = unknown>(path: string, init?: RequestInit): Promise<T>;
}
