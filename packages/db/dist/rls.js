"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTenantContext = setTenantContext;
exports.setProjectContext = setProjectContext;
/** Установить tenant-контекст для текущей транзакции. */
async function setTenantContext(tx, tenantId) {
    await tx.$executeRawUnsafe("SELECT set_config('app.tenant_id', $1, true)", tenantId);
}
/** Установить project-контекст для текущей транзакции. */
async function setProjectContext(tx, projectId) {
    await tx.$executeRawUnsafe("SELECT set_config('app.project_id', $1, true)", projectId);
}
