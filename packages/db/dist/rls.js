"use strict";
/**
 * RLS (Row-Level Security) helpers — заглушки для готовности к RLS в PostgreSQL.
 * В будущем: установка app.tenant_id / app.project_id в транзакциях, проверки политик.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTenantContext = setTenantContext;
exports.setProjectContext = setProjectContext;
/** Установить контекст tenant для текущей транзакции (заглушка). */
async function setTenantContext(_tx, _tenantId) {
    // TODO: SET LOCAL app.tenant_id = ...
}
/** Установить контекст project для текущей транзакции (заглушка). */
async function setProjectContext(_tx, _projectId) {
    // TODO: SET LOCAL app.project_id = ...
}
