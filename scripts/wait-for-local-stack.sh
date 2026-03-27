#!/usr/bin/env bash
# Ждёт HTTP-ответ от веб-контейнера после `podman compose up -d`.
# Первый запуск часто занимает несколько минут (install + build внутри образа).

set -euo pipefail

PORT="${WEB_PORT:-3333}"
URL="${WAIT_URL:-http://127.0.0.1:${PORT}}"
MAX_ATTEMPTS="${WAIT_MAX_ATTEMPTS:-120}"
SLEEP="${WAIT_SLEEP_SEC:-5}"

echo ""
echo "Контейнеры запущены, но Dashboard ещё может собираться."
echo "Ожидаю ответ по ${URL} (до ~$((MAX_ATTEMPTS * SLEEP / 60)) мин, шаг ${SLEEP}s)…"
echo "Логи в другом терминале: podman compose logs -f web"
echo ""

for i in $(seq 1 "${MAX_ATTEMPTS}"); do
  if curl -fsS --connect-timeout 2 --max-time 15 "${URL}" >/dev/null 2>&1; then
    echo "Готово: откройте ${URL} в браузере."
    echo ""
    exit 0
  fi
  printf "  [%s/%s] сервер в процессе запуска…\n" "${i}" "${MAX_ATTEMPTS}"
  sleep "${SLEEP}"
done

echo ""
echo "Таймаут: ${URL} не ответил."
echo "Проверьте: podman compose ps && podman compose logs --tail=80 web"
echo ""
exit 1
