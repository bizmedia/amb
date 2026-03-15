/**
 * RLS (Row-Level Security) helpers — заглушки для готовности к RLS в PostgreSQL.
 * В будущем: установка app.tenant_id / app.project_id в транзакциях, проверки политик.
 */
/** Установить контекст tenant для текущей транзакции (заглушка). */
export async function setTenantContext(_tx, _tenantId) {
    // TODO: SET LOCAL app.tenant_id = ...
}
/** Установить контекст project для текущей транзакции (заглушка). */
export async function setProjectContext(_tx, _projectId) {
    // TODO: SET LOCAL app.project_id = ...
}
