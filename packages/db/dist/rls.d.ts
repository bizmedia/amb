/**
 * RLS (Row-Level Security) helpers.
 * Используются внутри одной SQL-транзакции (SET LOCAL через set_config(..., true)).
 */
import type { Prisma } from "./generated/client";
/** Установить tenant-контекст для текущей транзакции. */
export declare function setTenantContext(tx: Prisma.TransactionClient, tenantId: string): Promise<void>;
/** Установить project-контекст для текущей транзакции. */
export declare function setProjectContext(tx: Prisma.TransactionClient, projectId: string): Promise<void>;
//# sourceMappingURL=rls.d.ts.map