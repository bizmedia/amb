/**
 * Legacy bootstrap tenant (slug `default`, fixed UUID) used only when:
 * - `AMB_BOOTSTRAP=true` upserts this tenant on API start, or
 * - `POST /api/projects` runs without tenant scope (e2e / legacy) and auto-creates a tenant.
 *
 * There is no default **project** in application code; projects are user-created after signup.
 */
export const DEFAULT_TENANT_ID = "11111111-1111-4111-8111-111111111111";
export const DEFAULT_TENANT_SLUG = "default";
