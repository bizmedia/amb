/**
 * RLS (Row-Level Security) helpers.
 * Используются внутри одной SQL-транзакции (SET LOCAL через set_config(..., true)).
 */
import type { Prisma } from "./generated/client";

/** Установить tenant-контекст для текущей транзакции. */
export async function setTenantContext(
  tx: Prisma.TransactionClient,
  tenantId: string
): Promise<void> {
  await tx.$executeRawUnsafe(
    "SELECT set_config('app.tenant_id', $1, true)",
    tenantId
  );
}

/** Установить project-контекст для текущей транзакции. */
export async function setProjectContext(
  tx: Prisma.TransactionClient,
  projectId: string
): Promise<void> {
  await tx.$executeRawUnsafe(
    "SELECT set_config('app.project_id', $1, true)",
    projectId
  );
}
