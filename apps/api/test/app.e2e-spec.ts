import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createHmac } from "node:crypto";
import { AppModule } from "../src/app.module";
import { AllExceptionsFilter } from "../src/common/http-exception.filter";

const DEFAULT_TENANT_ID = "11111111-1111-4111-8111-111111111111";

function base64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signJwt(
  payload: Record<string, unknown>,
  secret: string
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

describe("API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/projects", () => {
    it("returns 200 and list of projects", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/projects")
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /api/projects", () => {
    it("creates project and returns 200 with data", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: "E2E Test Project" })
        .expect(201);
      expect(res.body.data).toMatchObject({
        name: "E2E Test Project",
        slug: expect.any(String),
      });
      expect(res.body.data.id).toBeDefined();
    });

    it("returns 400 for invalid body", async () => {
      await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: "" })
        .expect(400);
    });
  });

  describe("GET /api/agents", () => {
    it("returns 400 without project context", async () => {
      await request(app.getHttpServer()).get("/api/agents").expect(400);
    });

    it("returns 200 and list with x-project-id", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E2E Agents List ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      const res = await request(app.getHttpServer())
        .get("/api/agents")
        .set("x-project-id", projectId)
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /api/agents", () => {
    it("creates agent and returns 200", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E2E Agent Create ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      const res = await request(app.getHttpServer())
        .post("/api/agents")
        .set("x-project-id", projectId)
        .send({ name: "e2e-agent", role: "e2e-tester" })
        .expect(201);
      expect(res.body.data).toMatchObject({
        name: "e2e-agent",
        role: "e2e-tester",
      });
      expect(res.body.data.id).toBeDefined();
    });

    it("returns 400 for invalid body", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E2E Agent Invalid ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      await request(app.getHttpServer())
        .post("/api/agents")
        .set("x-project-id", projectId)
        .send({ name: "", role: "x" })
        .expect(400);
    });
  });

  describe("GET /api/threads", () => {
    it("returns 400 without project context", async () => {
      await request(app.getHttpServer()).get("/api/threads").expect(400);
    });

    it("returns 200 and list with x-project-id", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E2E Threads List ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      const res = await request(app.getHttpServer())
        .get("/api/threads")
        .set("x-project-id", projectId)
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /api/threads", () => {
    it("creates thread and returns 200", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E2E Thread Create ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      const res = await request(app.getHttpServer())
        .post("/api/threads")
        .set("x-project-id", projectId)
        .send({ title: "E2E thread" })
        .expect(201);
      expect(res.body.data).toMatchObject({ title: "E2E thread" });
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe("messages (send, inbox, ack)", () => {
    let projectId: string;
    let threadId: string;
    let fromAgentId: string;
    let toAgentId: string;
    let messageId: string;

    beforeAll(async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E2E Messages ${Date.now().toString(36)}` })
        .expect(201);
      projectId = projectRes.body.data.id as string;

      const [threadRes, agentsRes] = await Promise.all([
        request(app.getHttpServer())
          .post("/api/threads")
          .set("x-project-id", projectId)
          .send({ title: "E2E messages" }),
        request(app.getHttpServer()).get("/api/agents").set("x-project-id", projectId),
      ]);
      threadId = threadRes.body.data.id;
      const agents = agentsRes.body.data as Array<{ id: string; role: string }>;
      fromAgentId = agents[0]?.id ?? "";
      toAgentId = agents[1]?.id ?? agents[0]?.id ?? "";
      if (!fromAgentId || !toAgentId) {
        const createRes = await request(app.getHttpServer())
          .post("/api/agents")
          .set("x-project-id", projectId)
          .send({ name: "from-e2e", role: "from-e2e" });
        fromAgentId = createRes.body.data.id;
        toAgentId = fromAgentId;
      }
    });

    it("POST /api/messages/send returns 201", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/messages/send")
        .set("x-project-id", projectId)
        .send({
          threadId,
          fromAgentId,
          toAgentId,
          payload: { type: "test" },
        })
        .expect(201);
      expect(res.body.data.id).toBeDefined();
      messageId = res.body.data.id;
    });

    it("GET /api/messages/inbox returns 200", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/messages/inbox")
        .set("x-project-id", projectId)
        .query({ agentId: toAgentId })
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/messages/:id/ack returns 201", async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/messages/${messageId}/ack`)
        .set("x-project-id", projectId)
        .expect(201);
      expect(res.body.data.id).toBe(messageId);
    });
  });

  describe("tasks (project-scoped)", () => {
    let projectId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get("/api/projects")
        .expect(200);
      const projects = res.body.data as Array<{ id: string }>;
      projectId = projects[0]?.id ?? "";
      if (!projectId) {
        const createRes = await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: "E2E Tasks Project" });
        projectId = createRes.body.data.id;
      }
    });

    it("GET /api/projects/:projectId/tasks returns 200", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks`)
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/projects/:projectId/tasks creates task with key", async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectId}/tasks`)
        .send({ title: "E2E task" })
        .expect(201);
      expect(res.body.data).toMatchObject({ title: "E2E task" });
      expect(res.body.data.id).toBeDefined();
      expect(typeof res.body.data.key).toBe("string");
      expect(res.body.data.key.length).toBeGreaterThan(0);
    });

    it("GET /api/projects/:projectId/tasks/:id returns 404 for bad id", async () => {
      await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/tasks/00000000-0000-0000-0000-000000000099`)
        .expect(404);
    });
  });

  describe("GET /api/dlq", () => {
    it("returns 200 and list", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E2E DLQ ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      const res = await request(app.getHttpServer())
        .get("/api/dlq")
        .set("x-project-id", projectId)
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("project isolation (E2-S4)", () => {
    let projectAId: string;
    let projectBId: string;
    let agentAId: string;
    let threadAId: string;
    let messageAId: string;
    let taskAId: string;

    beforeAll(async () => {
      const suffix = Date.now().toString(36);

      const [projectARes, projectBRes] = await Promise.all([
        request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: `E2E Isolation A ${suffix}` })
          .expect(201),
        request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: `E2E Isolation B ${suffix}` })
          .expect(201),
      ]);

      projectAId = projectARes.body.data.id;
      projectBId = projectBRes.body.data.id;

      const agentRes = await request(app.getHttpServer())
        .post("/api/agents")
        .set("x-project-id", projectAId)
        .send({ name: `iso-agent-${suffix}`, role: "iso-role" })
        .expect(201);
      agentAId = agentRes.body.data.id;

      const threadRes = await request(app.getHttpServer())
        .post("/api/threads")
        .set("x-project-id", projectAId)
        .send({ title: `iso-thread-${suffix}` })
        .expect(201);
      threadAId = threadRes.body.data.id;

      const messageRes = await request(app.getHttpServer())
        .post("/api/messages/send")
        .set("x-project-id", projectAId)
        .send({
          threadId: threadAId,
          fromAgentId: agentAId,
          toAgentId: agentAId,
          payload: { type: "isolation-test" },
        })
        .expect(201);
      messageAId = messageRes.body.data.id;

      const taskRes = await request(app.getHttpServer())
        .post(`/api/projects/${projectAId}/tasks`)
        .send({ title: `iso-task-${suffix}` })
        .expect(201);
      taskAId = taskRes.body.data.id;
    });

    it("does not leak agents across projects", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/agents")
        .set("x-project-id", projectBId)
        .expect(200);

      const ids = (res.body.data as Array<{ id: string }>).map((a) => a.id);
      expect(ids).not.toContain(agentAId);
    });

    it("returns 404 for thread from another project", async () => {
      await request(app.getHttpServer())
        .get(`/api/threads/${threadAId}`)
        .set("x-project-id", projectBId)
        .expect(404);
    });

    it("rejects sending message to thread from another project", async () => {
      await request(app.getHttpServer())
        .post("/api/messages/send")
        .set("x-project-id", projectBId)
        .send({
          threadId: threadAId,
          fromAgentId: agentAId,
          payload: { type: "cross-project" },
        })
        .expect(404);
    });

    it("returns empty inbox for agent from another project", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/messages/inbox")
        .set("x-project-id", projectBId)
        .query({ agentId: agentAId })
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it("returns 404 on ack from another project", async () => {
      await request(app.getHttpServer())
        .post(`/api/messages/${messageAId}/ack`)
        .set("x-project-id", projectBId)
        .expect(404);
    });

    it("does not expose tasks across projects", async () => {
      await request(app.getHttpServer())
        .get(`/api/projects/${projectBId}/tasks/${taskAId}`)
        .expect(404);
    });

    it("rejects mismatched projectId between query and header", async () => {
      await request(app.getHttpServer())
        .get("/api/threads")
        .set("x-project-id", projectAId)
        .query({ projectId: projectBId })
        .expect(400);
    });
  });

  describe("jwt guard (E3-S1)", () => {
    let projectId: string;
    let token: string;

    beforeAll(async () => {
      const suffix = Date.now().toString(36);
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 JWT Project ${suffix}` })
        .expect(201);
      projectId = projectRes.body.data.id;

      const now = Math.floor(Date.now() / 1000);
      token = signJwt(
        {
          sub: "user",
          userId: "00000000-0000-0000-0000-0000000000c1",
          tenantId: DEFAULT_TENANT_ID,
          projectId,
          roles: ["tenant-admin"],
          iat: now,
          exp: now + 3600,
        },
        process.env.JWT_SECRET!
      );
    });

    it("returns 401 for invalid bearer token", async () => {
      await request(app.getHttpServer())
        .get("/api/agents")
        .set("Authorization", "Bearer invalid.token.signature")
        .expect(401);
    });

    it("accepts valid JWT and resolves project from claims", async () => {
      await request(app.getHttpServer())
        .post("/api/agents")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "jwt-agent", role: "jwt-role" })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get("/api/agents")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(
        (res.body.data as Array<{ name: string }>).some((a) => a.name === "jwt-agent")
      ).toBe(true);
    });

    it("returns 400 for project mismatch between claims and query/header", async () => {
      const otherProjectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 JWT Other ${Date.now().toString(36)}` })
        .expect(201);
      const otherProjectId = otherProjectRes.body.data.id as string;

      await request(app.getHttpServer())
        .get("/api/threads")
        .set("Authorization", `Bearer ${token}`)
        .query({ projectId: otherProjectId })
        .expect(400);

      await request(app.getHttpServer())
        .get("/api/threads")
        .set("Authorization", `Bearer ${token}`)
        .set("x-project-id", otherProjectId)
        .expect(400);
    });

    it("returns 400 for project mismatch between claims and route params", async () => {
      const otherProjectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 JWT Route ${Date.now().toString(36)}` })
        .expect(201);
      const otherProjectId = otherProjectRes.body.data.id as string;

      await request(app.getHttpServer())
        .get(`/api/projects/${otherProjectId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });
  });

  describe("user tokens and login (E3-S2)", () => {
    it("returns 401 for invalid credentials", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "wrong-password" })
        .expect(401);
    });

    it("returns user JWT for valid credentials", async () => {
      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "ChangeMe123!" })
        .expect(200);

      const token = loginRes.body.data?.accessToken as string;
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
      expect(loginRes.body.data?.tokenType).toBe("Bearer");
      expect(loginRes.body.data?.user?.email).toBe("admin@local.test");
      expect(loginRes.body.data?.user?.roles).toContain("tenant-admin");

      const payload = JSON.parse(
        Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8")
      ) as {
        sub: string;
        tenantId: string;
        roles: string[];
      };

      expect(payload.sub).toBe("user");
      expect(payload.tenantId).toBe(DEFAULT_TENANT_ID);
      expect(Array.isArray(payload.roles)).toBe(true);
      expect(payload.roles).toContain("tenant-admin");
    });

    it("allows project-scoped endpoints with user token and explicit x-project-id", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 Login Project ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "ChangeMe123!" })
        .expect(200);
      const token = loginRes.body.data?.accessToken as string;

      await request(app.getHttpServer())
        .get("/api/agents")
        .set("Authorization", `Bearer ${token}`)
        .set("x-project-id", projectId)
        .expect(200);
    });

    it("changes password with user token and restores default credentials", async () => {
      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "ChangeMe123!" })
        .expect(200);
      const token = loginRes.body.data?.accessToken as string;

      await request(app.getHttpServer())
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "wrong-password", newPassword: "TempPass999!" })
        .expect(401);

      await request(app.getHttpServer())
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "ChangeMe123!", newPassword: "TempPass999!" })
        .expect(200);

      await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "TempPass999!" })
        .expect(200);

      const loginAfter = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "TempPass999!" })
        .expect(200);
      const tokenAfter = loginAfter.body.data?.accessToken as string;

      await request(app.getHttpServer())
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${tokenAfter}`)
        .send({ currentPassword: "TempPass999!", newPassword: "ChangeMe123!" })
        .expect(200);

      await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "ChangeMe123!" })
        .expect(200);
    });
  });

  describe("project tokens (E3-S3)", () => {
    it("issues project token for tenant-admin user", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 Project Token ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "ChangeMe123!" })
        .expect(200);
      const userToken = loginRes.body.data?.accessToken as string;

      const issueRes = await request(app.getHttpServer())
        .post("/api/auth/project-tokens")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "integration-main", projectId })
        .expect(201);

      const projectToken = issueRes.body.data?.accessToken as string;
      expect(typeof projectToken).toBe("string");
      expect(projectToken.split(".")).toHaveLength(3);
      expect(issueRes.body.data?.claims?.sub).toBe("project");
      expect(issueRes.body.data?.claims?.projectId).toBe(projectId);
      expect(issueRes.body.data?.claims?.tenantId).toBe(DEFAULT_TENANT_ID);
      expect(typeof issueRes.body.data?.claims?.jti).toBe("string");

      const payload = JSON.parse(
        Buffer.from(projectToken.split(".")[1] ?? "", "base64url").toString("utf8")
      ) as { sub: string; projectId: string; tenantId: string; type: string };

      expect(payload.sub).toBe("project");
      expect(payload.type).toBe("project");
      expect(payload.projectId).toBe(projectId);
      expect(payload.tenantId).toBe(DEFAULT_TENANT_ID);

      await request(app.getHttpServer())
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${projectToken}`)
        .send({ currentPassword: "any", newPassword: "Newpass123!" })
        .expect(401);
    });

    it("returns 403 for non-admin user token", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 Project Token Reader ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const now = Math.floor(Date.now() / 1000);
      const readerToken = signJwt(
        {
          sub: "user",
          userId: "00000000-0000-0000-0000-0000000000b1",
          tenantId: DEFAULT_TENANT_ID,
          roles: ["reader"],
          iat: now,
          exp: now + 3600,
        },
        process.env.JWT_SECRET!
      );

      await request(app.getHttpServer())
        .post("/api/auth/project-tokens")
        .set("Authorization", `Bearer ${readerToken}`)
        .send({ name: "reader-attempt", projectId })
        .expect(403);
    });

    it("allows using issued project token on project-scoped endpoint", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 Project Token Use ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "ChangeMe123!" })
        .expect(200);
      const userToken = loginRes.body.data?.accessToken as string;

      const issueRes = await request(app.getHttpServer())
        .post("/api/auth/project-tokens")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "integration-usage", projectId })
        .expect(201);
      const projectToken = issueRes.body.data?.accessToken as string;

      await request(app.getHttpServer())
        .get("/api/threads")
        .set("Authorization", `Bearer ${projectToken}`)
        .expect(200);
    });
  });

  describe("admin project tokens API (E3-S4)", () => {
    it("supports create/list/revoke/delete for tenant-admin", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 Admin Tokens ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "admin@local.test", password: "ChangeMe123!" })
        .expect(200);
      const userToken = loginRes.body.data?.accessToken as string;

      const createRes = await request(app.getHttpServer())
        .post(`/api/admin/projects/${projectId}/tokens`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "admin-issued", expiresIn: 3600 })
        .expect(201);
      const projectToken = createRes.body.data?.accessToken as string;
      const tokenId = createRes.body.data?.claims?.jti as string;
      expect(tokenId).toBeDefined();

      const listRes = await request(app.getHttpServer())
        .get(`/api/admin/projects/${projectId}/tokens`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      expect(
        (listRes.body.data as Array<{ id: string; name: string }>).some(
          (item) => item.id === tokenId && item.name === "admin-issued"
        )
      ).toBe(true);

      await request(app.getHttpServer())
        .get("/api/threads")
        .set("Authorization", `Bearer ${projectToken}`)
        .expect(200);

      const revokeRes = await request(app.getHttpServer())
        .post(`/api/admin/projects/${projectId}/tokens/${tokenId}/revoke`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(201);
      expect(revokeRes.body.data?.revokedAt).toBeTruthy();

      await request(app.getHttpServer())
        .get("/api/threads")
        .set("Authorization", `Bearer ${projectToken}`)
        .expect(401);

      const auditRes = await request(app.getHttpServer())
        .get(`/api/admin/projects/${projectId}/tokens/${tokenId}/audit`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
      const auditEvents = (auditRes.body.data as Array<{ event: string }>).map(
        (row) => row.event
      );
      expect(auditEvents).toContain("created");
      expect(auditEvents).toContain("used");
      expect(auditEvents).toContain("revoked");

      await request(app.getHttpServer())
        .delete(`/api/admin/projects/${projectId}/tokens/${tokenId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);
    });

    it("returns 403 for reader on admin API", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E3 Admin Tokens Reader ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const now = Math.floor(Date.now() / 1000);
      const readerToken = signJwt(
        {
          sub: "user",
          userId: "00000000-0000-0000-0000-0000000000d1",
          tenantId: DEFAULT_TENANT_ID,
          roles: ["reader"],
          iat: now,
          exp: now + 3600,
        },
        process.env.JWT_SECRET!
      );

      await request(app.getHttpServer())
        .post(`/api/admin/projects/${projectId}/tokens`)
        .set("Authorization", `Bearer ${readerToken}`)
        .send({ name: "nope", expiresIn: 3600 })
        .expect(403);
    });
  });

  describe("rate limiting (E6-S1)", () => {
    it("returns 429 when per-project limit is exceeded", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E6 RL ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const prevMax = process.env.RATE_LIMIT_MAX_REQUESTS;
      const prevWindow = process.env.RATE_LIMIT_WINDOW_MS;
      process.env.RATE_LIMIT_MAX_REQUESTS = "2";
      process.env.RATE_LIMIT_WINDOW_MS = "60000";

      try {
        await request(app.getHttpServer())
          .get("/api/agents")
          .set("x-project-id", projectId)
          .set("x-forwarded-for", "198.51.100.10")
          .expect(200);

        await request(app.getHttpServer())
          .get("/api/agents")
          .set("x-project-id", projectId)
          .set("x-forwarded-for", "198.51.100.10")
          .expect(200);

        await request(app.getHttpServer())
          .get("/api/agents")
          .set("x-project-id", projectId)
          .set("x-forwarded-for", "198.51.100.10")
          .expect(429);
      } finally {
        if (prevMax === undefined) {
          delete process.env.RATE_LIMIT_MAX_REQUESTS;
        } else {
          process.env.RATE_LIMIT_MAX_REQUESTS = prevMax;
        }

        if (prevWindow === undefined) {
          delete process.env.RATE_LIMIT_WINDOW_MS;
        } else {
          process.env.RATE_LIMIT_WINDOW_MS = prevWindow;
        }
      }
    });
  });

  describe("observability metrics (E6-S2)", () => {
    it("collects request metrics and exposes snapshot endpoint", async () => {
      await request(app.getHttpServer()).get("/api/projects").expect(200);

      const res = await request(app.getHttpServer())
        .get("/api/observability/metrics")
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(
        (res.body.data as Array<{ route: string; method: string; count: number }>).some(
          (row) => row.method === "GET" && row.route.includes("projects") && row.count >= 1
        )
      ).toBe(true);
    });
  });

  describe("tracing correlation (E6-S3)", () => {
    it("returns generated x-request-id and traceparent headers", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/projects")
        .expect(200);

      const requestId = res.headers["x-request-id"] as string | undefined;
      const traceparent = res.headers["traceparent"] as string | undefined;
      expect(typeof requestId).toBe("string");
      expect(requestId && requestId.length > 0).toBe(true);
      expect(typeof traceparent).toBe("string");
      expect(traceparent).toMatch(/^00-[a-f0-9]{32}-[a-f0-9]{16}-01$/);
    });

    it("keeps incoming x-request-id for correlation", async () => {
      const customRequestId = "0123456789abcdef0123456789abcdef";
      const res = await request(app.getHttpServer())
        .get("/api/projects")
        .set("x-request-id", customRequestId)
        .expect(200);

      expect(res.headers["x-request-id"]).toBe(customRequestId);
      expect(res.headers["traceparent"]).toMatch(/^00-[a-f0-9]{32}-[a-f0-9]{16}-01$/);
    });
  });

  describe("health checks (E6-S4)", () => {
    it("returns service and db status", async () => {
      const res = await request(app.getHttpServer()).get("/api/health").expect(200);
      expect(res.body?.data?.status).toBeDefined();
      expect(res.body?.data?.checks?.db?.status).toBe("up");
      expect(typeof res.body?.data?.uptimeSec).toBe("number");
    });
  });

  describe("task keys (E9A-013)", () => {
    const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function randomPrefix(len = 3): string {
      return Array.from({ length: len }, () =>
        ALPHA[Math.floor(Math.random() * 26)]
      ).join("");
    }

    let projectId: string;
    let taskPrefix: string;

    beforeAll(async () => {
      taskPrefix = randomPrefix(3);
      const suffix = Date.now().toString(36);
      const res = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E9A Keys ${suffix}`, taskPrefix })
        .expect(201);
      projectId = res.body.data.id as string;
    });

    describe("taskPrefix validation", () => {
      it("rejects lowercase prefix on POST /api/projects (400)", async () => {
        await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: "Invalid Prefix lc", taskPrefix: "abc" })
          .expect(400);
      });

      it("rejects single-char prefix on POST /api/projects (400)", async () => {
        await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: "Invalid Prefix short", taskPrefix: "A" })
          .expect(400);
      });

      it("rejects 6-char prefix on POST /api/projects (400)", async () => {
        await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: "Invalid Prefix long", taskPrefix: "TOOLONG" })
          .expect(400);
      });

      it("rejects alphanumeric prefix on POST /api/projects (400)", async () => {
        await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: "Invalid Prefix num", taskPrefix: "AB1" })
          .expect(400);
      });

      it("rejects duplicate taskPrefix in same tenant on POST (409)", async () => {
        await request(app.getHttpServer())
          .post("/api/projects")
          .send({
            name: `E9A Dup Prefix ${Date.now().toString(36)}`,
            taskPrefix,
          })
          .expect(409);
      });

      it("rejects duplicate taskPrefix via PATCH /api/projects/:id (409)", async () => {
        const newRes = await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: `E9A PATCH Dup ${Date.now().toString(36)}` })
          .expect(201);
        const newId = newRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${newId}`)
          .send({ taskPrefix })
          .expect(409);
      });

      it("accepts valid 2-letter prefix", async () => {
        const p2 = randomPrefix(2);
        const res = await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: `E9A 2L ${Date.now().toString(36)}`, taskPrefix: p2 })
          .expect(201);
        expect(res.body.data.taskPrefix).toBe(p2);
      });

      it("accepts valid 5-letter prefix", async () => {
        const p5 = randomPrefix(5);
        const res = await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: `E9A 5L ${Date.now().toString(36)}`, taskPrefix: p5 })
          .expect(201);
        expect(res.body.data.taskPrefix).toBe(p5);
      });

      it("GET /api/projects/:id returns taskPrefix", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}`)
          .expect(200);
        expect(res.body.data.taskPrefix).toBe(taskPrefix);
      });
    });

    describe("key generation format & sequence", () => {
      it("creates task with key in PPP-NNNN format", async () => {
        const res = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9A key format check" })
          .expect(201);
        const key: string = res.body.data.key;
        expect(key).toMatch(/^[A-Z]{2,5}-\d{4}$/);
        expect(key.startsWith(`${taskPrefix}-`)).toBe(true);
      });

      it("sequential task creation produces strictly incrementing keys", async () => {
        const firstRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "Seq A" })
          .expect(201);
        const secondRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "Seq B" })
          .expect(201);

        const numA = parseInt((firstRes.body.data.key as string).split("-")[1]!, 10);
        const numB = parseInt((secondRes.body.data.key as string).split("-")[1]!, 10);
        expect(numB).toBe(numA + 1);
      });

      it("key is present and non-empty in GET list response", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect((res.body.data as Array<unknown>).length).toBeGreaterThan(0);
        for (const task of res.body.data as Array<{ key: string }>) {
          expect(typeof task.key).toBe("string");
          expect(task.key.length).toBeGreaterThan(0);
        }
      });
    });

    describe("parallel task creation — no duplicate keys", () => {
      it("5 concurrent requests produce 5 unique keys", async () => {
        const N = 5;
        const results = await Promise.all(
          Array.from({ length: N }, (_, i) =>
            request(app.getHttpServer())
              .post(`/api/projects/${projectId}/tasks`)
              .send({ title: `Parallel task ${i}` })
              .expect(201)
          )
        );
        const keys = results.map((r) => r.body.data.key as string);
        const unique = new Set(keys);
        expect(unique.size).toBe(N);
      });

      it("10 concurrent requests produce 10 unique keys", async () => {
        const N = 10;
        const results = await Promise.all(
          Array.from({ length: N }, (_, i) =>
            request(app.getHttpServer())
              .post(`/api/projects/${projectId}/tasks`)
              .send({ title: `Concurrent task ${i}` })
              .expect(201)
          )
        );
        const keys = results.map((r) => r.body.data.key as string);
        const unique = new Set(keys);
        expect(unique.size).toBe(N);
      });

      it("keys from parallel creates belong to the correct project prefix", async () => {
        const N = 3;
        const results = await Promise.all(
          Array.from({ length: N }, (_, i) =>
            request(app.getHttpServer())
              .post(`/api/projects/${projectId}/tasks`)
              .send({ title: `Prefix verify ${i}` })
              .expect(201)
          )
        );
        for (const r of results) {
          expect((r.body.data.key as string).startsWith(`${taskPrefix}-`)).toBe(true);
        }
      });
    });

    describe("search and filter by key (E9A-011)", () => {
      let knownKey: string;

      beforeAll(async () => {
        const res = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9A search target" })
          .expect(201);
        knownKey = res.body.data.key as string;
      });

      it("GET ?key=<exact> returns exactly one matching task", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .query({ key: knownKey })
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect((res.body.data as Array<{ key: string }>)[0].key).toBe(knownKey);
      });

      it("GET ?key=<exact> returns empty array for non-existent key", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .query({ key: `${taskPrefix}-9999` })
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(0);
      });

      it("GET ?search=<prefix> returns all tasks whose key starts with the prefix", async () => {
        const searchPrefix = knownKey.slice(0, -1);
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .query({ search: searchPrefix })
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect((res.body.data as Array<unknown>).length).toBeGreaterThanOrEqual(1);
        for (const task of res.body.data as Array<{ key: string }>) {
          expect(task.key.startsWith(searchPrefix)).toBe(true);
        }
      });

      it("GET ?search=<project-prefix> returns all project tasks", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .query({ search: `${taskPrefix}-` })
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect((res.body.data as Array<unknown>).length).toBeGreaterThanOrEqual(1);
        for (const task of res.body.data as Array<{ key: string }>) {
          expect(task.key.startsWith(`${taskPrefix}-`)).toBe(true);
        }
      });

      it("GET ?search=<nonexistent> returns empty array", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .query({ search: "ZZZZ-0000" })
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(0);
      });
    });

    describe("GET /api/projects/:projectId/tasks/:key — lookup by human-readable key (E9A-012)", () => {
      let knownKey: string;
      let knownId: string;

      beforeAll(async () => {
        const res = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9A key lookup target" })
          .expect(201);
        knownKey = res.body.data.key as string;
        knownId = res.body.data.id as string;
      });

      it("returns the correct task when looking up by human-readable key", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks/${knownKey}`)
          .expect(200);
        expect(res.body.data.id).toBe(knownId);
        expect(res.body.data.key).toBe(knownKey);
      });

      it("returns 404 for a non-existent human-readable key", async () => {
        await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks/${taskPrefix}-9999`)
          .expect(404);
      });

      it("lookup by UUID and by key returns identical task data", async () => {
        const [byId, byKey] = await Promise.all([
          request(app.getHttpServer())
            .get(`/api/projects/${projectId}/tasks/${knownId}`)
            .expect(200),
          request(app.getHttpServer())
            .get(`/api/projects/${projectId}/tasks/${knownKey}`)
            .expect(200),
        ]);
        expect(byId.body.data.id).toBe(byKey.body.data.id);
        expect(byId.body.data.key).toBe(byKey.body.data.key);
        expect(byId.body.data.title).toBe(byKey.body.data.title);
      });

      it("human-readable key does not resolve across projects (404)", async () => {
        const otherProjectRes = await request(app.getHttpServer())
          .post("/api/projects")
          .send({ name: `E9A Cross ${Date.now().toString(36)}` })
          .expect(201);
        const otherProjectId = otherProjectRes.body.data.id as string;

        await request(app.getHttpServer())
          .get(`/api/projects/${otherProjectId}/tasks/${knownKey}`)
          .expect(404);
      });
    });

    describe("backfill — all tasks have a populated key (E9A-005)", () => {
      it("all tasks in the test project have a non-null, non-empty key", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect((res.body.data as Array<unknown>).length).toBeGreaterThan(0);
        for (const task of res.body.data as Array<{ key: string | null | undefined }>) {
          expect(task.key).toBeDefined();
          expect(task.key).not.toBeNull();
          expect(typeof task.key).toBe("string");
          expect((task.key as string).length).toBeGreaterThan(0);
        }
      });

      it("all tasks across existing projects have a non-empty key", async () => {
        const projectsRes = await request(app.getHttpServer())
          .get("/api/projects")
          .expect(200);
        const projects = (
          projectsRes.body.data as Array<{ id: string }>
        ).slice(0, 5);

        for (const project of projects) {
          const tasksRes = await request(app.getHttpServer())
            .get(`/api/projects/${project.id}/tasks`)
            .expect(200);
          for (const task of tasksRes.body.data as Array<{
            key: string | null | undefined;
          }>) {
            expect(task.key).toBeDefined();
            expect(task.key).not.toBeNull();
            expect((task.key as string).length).toBeGreaterThan(0);
          }
        }
      });

      it("newly created task is immediately retrievable by its key", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9A backfill immediate" })
          .expect(201);
        const newKey: string = createRes.body.data.key;
        expect(newKey).toMatch(/^[A-Z]{2,5}-\d{4}$/);

        const lookupRes = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks/${newKey}`)
          .expect(200);
        expect(lookupRes.body.data.key).toBe(newKey);
        expect(lookupRes.body.data.id).toBe(createRes.body.data.id);
      });
    });
  });

  describe("epics (E9B-014)", () => {
    const EPIC_E2E_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function epicE2eTaskPrefix(): string {
      return Array.from({ length: 3 }, () =>
        EPIC_E2E_ALPHA[Math.floor(Math.random() * 26)]
      ).join("");
    }

    let projectId: string;

    beforeAll(async () => {
      const suffix = Date.now().toString(36);
      const res = await request(app.getHttpServer())
        .post("/api/projects")
        .send({
          name: `E9B E2E ${suffix}`,
          taskPrefix: epicE2eTaskPrefix(),
        })
        .expect(201);
      projectId = res.body.data.id as string;
    });

    describe("CRUD /api/projects/:projectId/epics", () => {
      it("POST creates epic with default OPEN status", async () => {
        const res = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({
            title: "E9B CRUD epic",
            description: "e2e description",
          })
          .expect(201);
        expect(res.body.data).toMatchObject({
          title: "E9B CRUD epic",
          description: "e2e description",
          status: "OPEN",
        });
        expect(res.body.data.id).toBeDefined();
      });

      it("returns 400 for invalid create body", async () => {
        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "" })
          .expect(400);
      });

      it("GET list includes non-archived epics and hides archived by default", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B List Visible" })
          .expect(201);
        const visibleId = createRes.body.data.id as string;

        const archiveRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B List Hidden" })
          .expect(201);
        const toArchiveId = archiveRes.body.data.id as string;

        await request(app.getHttpServer())
          .delete(`/api/projects/${projectId}/epics/${toArchiveId}`)
          .expect(200);

        const listRes = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/epics`)
          .expect(200);
        const ids = (listRes.body.data as Array<{ id: string }>).map((e) => e.id);
        expect(ids).toContain(visibleId);
        expect(ids).not.toContain(toArchiveId);

        const archivedRes = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/epics`)
          .query({ status: "ARCHIVED" })
          .expect(200);
        const archivedIds = (archivedRes.body.data as Array<{ id: string }>).map(
          (e) => e.id
        );
        expect(archivedIds).toContain(toArchiveId);
      });

      it("GET by id returns _count.tasks and tasks[]", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B Detail epic" })
          .expect(201);
        const epicId = createRes.body.data.id as string;

        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/epics/${epicId}`)
          .expect(200);
        expect(res.body.data._count).toEqual({ tasks: 0 });
        expect(Array.isArray(res.body.data.tasks)).toBe(true);
        expect(res.body.data.tasks).toHaveLength(0);
      });

      it("PATCH updates title and status", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B Patch Before" })
          .expect(201);
        const epicId = createRes.body.data.id as string;

        const res = await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/epics/${epicId}`)
          .send({ title: "E9B Patch After", status: "IN_PROGRESS" })
          .expect(200);
        expect(res.body.data).toMatchObject({
          title: "E9B Patch After",
          status: "IN_PROGRESS",
        });
      });

      it("DELETE soft-archives epic (status ARCHIVED)", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B To Archive" })
          .expect(201);
        const epicId = createRes.body.data.id as string;

        const res = await request(app.getHttpServer())
          .delete(`/api/projects/${projectId}/epics/${epicId}`)
          .expect(200);
        expect(res.body.data.status).toBe("ARCHIVED");
      });

      it("returns 404 for unknown epic id", async () => {
        await request(app.getHttpServer())
          .get(
            `/api/projects/${projectId}/epics/00000000-0000-4000-8000-000000000099`
          )
          .expect(404);
      });
    });

    describe("PATCH /api/projects/:projectId/tasks/:id — epicId assign / unassign", () => {
      it("assigns task to epic and returns embedded epic", async () => {
        const epicRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B Assign target" })
          .expect(201);
        const epicId = epicRes.body.data.id as string;

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9B task for epic" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        const patchRes = await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ epicId })
          .expect(200);
        expect(patchRes.body.data.epic).toMatchObject({
          id: epicId,
          title: "E9B Assign target",
        });

        const epicDetail = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/epics/${epicId}`)
          .expect(200);
        expect(epicDetail.body.data._count.tasks).toBe(1);
        expect(
          (epicDetail.body.data.tasks as Array<{ id: string }>).map((t) => t.id)
        ).toContain(taskId);
      });

      it("unassigns with epicId null", async () => {
        const epicRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B Unassign epic" })
          .expect(201);
        const epicId = epicRes.body.data.id as string;

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9B unassign task" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ epicId })
          .expect(200);

        const unassignRes = await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ epicId: null })
          .expect(200);
        expect(unassignRes.body.data.epic).toBeNull();
      });

      it("returns 404 when epicId belongs to another project", async () => {
        const otherRes = await request(app.getHttpServer())
          .post("/api/projects")
          .send({
            name: `E9B other ${Date.now().toString(36)}`,
            taskPrefix: epicE2eTaskPrefix(),
          })
          .expect(201);
        const otherProjectId = otherRes.body.data.id as string;

        const epicRes = await request(app.getHttpServer())
          .post(`/api/projects/${otherProjectId}/epics`)
          .send({ title: "E9B foreign epic" })
          .expect(201);
        const foreignEpicId = epicRes.body.data.id as string;

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9B task foreign epic" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ epicId: foreignEpicId })
          .expect(404);
      });
    });

    describe("GET /api/projects/:projectId/tasks ?epicId=", () => {
      it("filters tasks by epicId (exact)", async () => {
        const epicRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B Filter epic" })
          .expect(201);
        const epicId = epicRes.body.data.id as string;

        const assignedRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9B filtered in" })
          .expect(201);
        const assignedId = assignedRes.body.data.id as string;

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9B filtered out" })
          .expect(201);

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${assignedId}`)
          .send({ epicId })
          .expect(200);

        const filtered = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .query({ epicId })
          .expect(200);
        const rows = filtered.body.data as Array<{ id: string; epicId?: string | null }>;
        expect(rows.every((t) => t.epicId === epicId || t.epic?.id === epicId)).toBe(true);
        expect(rows.some((t) => t.id === assignedId)).toBe(true);
        expect(rows.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe("ARCHIVED epic — assign returns 409", () => {
      it("rejects PATCH task.epicId when epic is archived", async () => {
        const epicRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/epics`)
          .send({ title: "E9B archived target" })
          .expect(201);
        const epicId = epicRes.body.data.id as string;

        await request(app.getHttpServer())
          .delete(`/api/projects/${projectId}/epics/${epicId}`)
          .expect(200);

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9B task vs archived epic" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ epicId })
          .expect(409);
      });
    });

    describe("project isolation — epics & tasks", () => {
      let projectAId: string;
      let projectBId: string;
      let epicAId: string;

      beforeAll(async () => {
        const suffix = Date.now().toString(36);
        const [a, b] = await Promise.all([
          request(app.getHttpServer())
            .post("/api/projects")
            .send({
              name: `Alpha E9B Iso ${suffix}`,
              taskPrefix: epicE2eTaskPrefix(),
            })
            .expect(201),
          request(app.getHttpServer())
            .post("/api/projects")
            .send({
              name: `Beta E9B Iso ${suffix}`,
              taskPrefix: epicE2eTaskPrefix(),
            })
            .expect(201),
        ]);
        projectAId = a.body.data.id;
        projectBId = b.body.data.id;

        const epicRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectAId}/epics`)
          .send({ title: "E9B epic only in A" })
          .expect(201);
        epicAId = epicRes.body.data.id as string;
      });

      it("returns 404 when fetching epic from another project", async () => {
        await request(app.getHttpServer())
          .get(`/api/projects/${projectBId}/epics/${epicAId}`)
          .expect(404);
      });

      it("does not list project A epics under project B", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectBId}/epics`)
          .expect(200);
        const ids = (res.body.data as Array<{ id: string }>).map((e) => e.id);
        expect(ids).not.toContain(epicAId);
      });
    });
  });

  describe("sprints (E9C-017)", () => {
    const SPRINT_E2E_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function sprintE2eTaskPrefix(): string {
      return Array.from({ length: 3 }, () =>
        SPRINT_E2E_ALPHA[Math.floor(Math.random() * 26)]
      ).join("");
    }

    async function createSprintE2eProject(label: string): Promise<string> {
      const suffix = `${label}-${Date.now().toString(36)}`;
      const res = await request(app.getHttpServer())
        .post("/api/projects")
        .send({
          name: `E9C ${suffix}`,
          taskPrefix: sprintE2eTaskPrefix(),
        })
        .expect(201);
      return res.body.data.id as string;
    }

    describe("CRUD /api/projects/:projectId/sprints", () => {
      let projectId: string;

      beforeAll(async () => {
        projectId = await createSprintE2eProject("crud");
      });
      it("POST creates sprint with default PLANNED status", async () => {
        const start = new Date("2030-01-01T00:00:00.000Z");
        const end = new Date("2030-01-14T00:00:00.000Z");
        const res = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({
            name: "E9C CRUD sprint",
            goal: "ship it",
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          })
          .expect(201);
        expect(res.body.data).toMatchObject({
          name: "E9C CRUD sprint",
          goal: "ship it",
          status: "PLANNED",
        });
        expect(res.body.data.id).toBeDefined();
      });

      it("returns 400 for invalid create body", async () => {
        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "" })
          .expect(400);
      });

      it("GET list returns sprints with _count.tasks", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/sprints`)
          .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect((res.body.data as Array<unknown>).length).toBeGreaterThan(0);
        for (const s of res.body.data as Array<{ _count?: { tasks: number } }>) {
          expect(s._count?.tasks).toBeDefined();
        }
      });

      it("GET ?status= filters list", async () => {
        const plannedRes = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/sprints`)
          .query({ status: "PLANNED" })
          .expect(200);
        for (const s of plannedRes.body.data as Array<{ status: string }>) {
          expect(s.status).toBe("PLANNED");
        }
      });

      it("GET by id returns _count.tasks and tasks[]", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C detail sprint" })
          .expect(201);
        const sprintId = createRes.body.data.id as string;

        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/sprints/${sprintId}`)
          .expect(200);
        expect(res.body.data._count).toEqual({ tasks: 0 });
        expect(Array.isArray(res.body.data.tasks)).toBe(true);
        expect(res.body.data.tasks).toHaveLength(0);
      });

      it("PATCH updates name, goal, and dates", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C patch before" })
          .expect(201);
        const sprintId = createRes.body.data.id as string;

        const res = await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/sprints/${sprintId}`)
          .send({
            name: "E9C patch after",
            goal: "updated",
            startDate: "2031-02-01T00:00:00.000Z",
            endDate: "2031-02-15T00:00:00.000Z",
          })
          .expect(200);
        expect(res.body.data).toMatchObject({
          name: "E9C patch after",
          goal: "updated",
        });
      });

      it("DELETE removes only PLANNED sprint", async () => {
        const plannedRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C to delete" })
          .expect(201);
        const plannedId = plannedRes.body.data.id as string;

        await request(app.getHttpServer())
          .delete(`/api/projects/${projectId}/sprints/${plannedId}`)
          .expect(200);

        const activeRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C active for delete test" })
          .expect(201);
        const activeId = activeRes.body.data.id as string;
        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${activeId}/start`)
          .expect(200);

        await request(app.getHttpServer())
          .delete(`/api/projects/${projectId}/sprints/${activeId}`)
          .expect(409);

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${activeId}/complete`)
          .expect(200);

        const doneRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C complete for delete test" })
          .expect(201);
        const doneId = doneRes.body.data.id as string;
        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${doneId}/start`)
          .expect(200);
        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${doneId}/complete`)
          .expect(200);

        await request(app.getHttpServer())
          .delete(`/api/projects/${projectId}/sprints/${doneId}`)
          .expect(409);
      });

      it("returns 404 for unknown sprint id", async () => {
        await request(app.getHttpServer())
          .get(
            `/api/projects/${projectId}/sprints/00000000-0000-4000-8000-000000000088`
          )
          .expect(404);
      });
    });

    describe("lifecycle — start / complete", () => {
      let projectId: string;

      beforeAll(async () => {
        projectId = await createSprintE2eProject("lifecycle");
      });

      it("POST start sets PLANNED → ACTIVE", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C lifecycle start" })
          .expect(201);
        const sprintId = createRes.body.data.id as string;

        const res = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/start`)
          .expect(200);
        expect(res.body.data.status).toBe("ACTIVE");

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/complete`)
          .expect(200);
      });

      it("POST complete sets ACTIVE → COMPLETED", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C lifecycle complete" })
          .expect(201);
        const sprintId = createRes.body.data.id as string;

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/start`)
          .expect(200);

        const res = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/complete`)
          .expect(200);
        expect(res.body.data.status).toBe("COMPLETED");
      });

      it("POST start returns 409 when sprint is not PLANNED", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C double start" })
          .expect(201);
        const sprintId = createRes.body.data.id as string;

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/start`)
          .expect(200);

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/start`)
          .expect(409);

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/complete`)
          .expect(200);
      });

      it("POST complete returns 409 when sprint already COMPLETED", async () => {
        const createRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C double complete" })
          .expect(201);
        const sprintId = createRes.body.data.id as string;

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/start`)
          .expect(200);
        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/complete`)
          .expect(200);

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/complete`)
          .expect(409);
      });
    });

    describe("at most one ACTIVE sprint per project", () => {
      it("returns 409 on second POST start and on PATCH status ACTIVE when another sprint is ACTIVE", async () => {
        const projectId = await createSprintE2eProject("one-active");

        const firstRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C first active" })
          .expect(201);
        const firstId = firstRes.body.data.id as string;

        const secondRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C second active" })
          .expect(201);
        const secondId = secondRes.body.data.id as string;

        const thirdRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C third active" })
          .expect(201);
        const thirdId = thirdRes.body.data.id as string;

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${firstId}/start`)
          .expect(200);

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${secondId}/start`)
          .expect(409);

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/sprints/${thirdId}`)
          .send({ status: "ACTIVE" })
          .expect(409);
      });
    });

    describe("PATCH /api/projects/:projectId/tasks/:id — sprintId", () => {
      let projectId: string;

      beforeAll(async () => {
        projectId = await createSprintE2eProject("task-sprint");
      });

      it("assigns task to sprint and returns embedded sprint", async () => {
        const sprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C assign sprint" })
          .expect(201);
        const sprintId = sprintRes.body.data.id as string;

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9C task in sprint" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        const patchRes = await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ sprintId })
          .expect(200);
        expect(patchRes.body.data.sprint).toMatchObject({
          id: sprintId,
          name: "E9C assign sprint",
        });

        const detail = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/sprints/${sprintId}`)
          .expect(200);
        expect(detail.body.data._count.tasks).toBeGreaterThanOrEqual(1);
        expect(
          (detail.body.data.tasks as Array<{ id: string }>).some((t) => t.id === taskId)
        ).toBe(true);
      });

      it("unassigns with sprintId null", async () => {
        const sprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C unassign sprint" })
          .expect(201);
        const sprintId = sprintRes.body.data.id as string;

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9C unassign task" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ sprintId })
          .expect(200);

        const unassignRes = await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ sprintId: null })
          .expect(200);
        expect(unassignRes.body.data.sprint).toBeNull();
      });

      it("returns 409 when assigning to COMPLETED sprint", async () => {
        const sprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C completed sprint" })
          .expect(201);
        const sprintId = sprintRes.body.data.id as string;

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/start`)
          .expect(200);
        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints/${sprintId}/complete`)
          .expect(200);

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9C task vs completed sprint" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ sprintId })
          .expect(409);
      });

      it("returns 404 when sprintId belongs to another project", async () => {
        const otherRes = await request(app.getHttpServer())
          .post("/api/projects")
          .send({
            name: `E9C other ${Date.now().toString(36)}`,
            taskPrefix: sprintE2eTaskPrefix(),
          })
          .expect(201);
        const otherProjectId = otherRes.body.data.id as string;

        const sprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${otherProjectId}/sprints`)
          .send({ name: "E9C foreign sprint" })
          .expect(201);
        const foreignSprintId = sprintRes.body.data.id as string;

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9C task foreign sprint" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ sprintId: foreignSprintId })
          .expect(404);
      });

      it("deleting PLANNED sprint clears sprintId on linked tasks (onDelete SetNull)", async () => {
        const sprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C sprint delete clears task" })
          .expect(201);
        const sprintId = sprintRes.body.data.id as string;

        const taskRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9C task orphan after sprint delete" })
          .expect(201);
        const taskId = taskRes.body.data.id as string;

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${taskId}`)
          .send({ sprintId })
          .expect(200);

        await request(app.getHttpServer())
          .delete(`/api/projects/${projectId}/sprints/${sprintId}`)
          .expect(200);

        const getTask = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks/${taskId}`)
          .expect(200);
        expect(getTask.body.data.sprint).toBeNull();
        expect(getTask.body.data.sprintId ?? null).toBeNull();
      });
    });

    describe("GET /api/projects/:projectId/tasks ?sprintId=", () => {
      let projectId: string;

      beforeAll(async () => {
        projectId = await createSprintE2eProject("filter");
      });

      it("filters tasks by sprintId", async () => {
        const sprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/sprints`)
          .send({ name: "E9C filter sprint" })
          .expect(201);
        const sprintId = sprintRes.body.data.id as string;

        const inSprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9C in sprint filter" })
          .expect(201);
        const inId = inSprintRes.body.data.id as string;

        await request(app.getHttpServer())
          .post(`/api/projects/${projectId}/tasks`)
          .send({ title: "E9C not in sprint filter" })
          .expect(201);

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectId}/tasks/${inId}`)
          .send({ sprintId })
          .expect(200);

        const filtered = await request(app.getHttpServer())
          .get(`/api/projects/${projectId}/tasks`)
          .query({ sprintId })
          .expect(200);
        const rows = filtered.body.data as Array<{
          id: string;
          sprintId?: string | null;
          sprint?: { id: string } | null;
        }>;
        expect(rows.length).toBeGreaterThanOrEqual(1);
        expect(rows.some((t) => t.id === inId)).toBe(true);
        for (const t of rows) {
          const sid = t.sprintId ?? t.sprint?.id;
          expect(sid).toBe(sprintId);
        }
      });
    });

    describe("project isolation — sprints", () => {
      let projectAId: string;
      let projectBId: string;
      let sprintAId: string;

      beforeAll(async () => {
        const suffix = Date.now().toString(36);
        const [a, b] = await Promise.all([
          request(app.getHttpServer())
            .post("/api/projects")
            .send({
              name: `Gamma E9C Iso ${suffix}`,
              taskPrefix: sprintE2eTaskPrefix(),
            })
            .expect(201),
          request(app.getHttpServer())
            .post("/api/projects")
            .send({
              name: `Delta E9C Iso ${suffix}`,
              taskPrefix: sprintE2eTaskPrefix(),
            })
            .expect(201),
        ]);
        projectAId = a.body.data.id;
        projectBId = b.body.data.id;

        const sprintRes = await request(app.getHttpServer())
          .post(`/api/projects/${projectAId}/sprints`)
          .send({ name: "E9C sprint only in A" })
          .expect(201);
        sprintAId = sprintRes.body.data.id as string;
      });

      it("returns 404 when fetching sprint from another project", async () => {
        await request(app.getHttpServer())
          .get(`/api/projects/${projectBId}/sprints/${sprintAId}`)
          .expect(404);
      });

      it("does not list project A sprints under project B", async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/projects/${projectBId}/sprints`)
          .expect(200);
        const ids = (res.body.data as Array<{ id: string }>).map((s) => s.id);
        expect(ids).not.toContain(sprintAId);
      });
    });
  });

  describe("E8 agents and projects lifecycle", () => {
    it("PATCH /api/agents/:id updates name and role", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E8 Agent Patch ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      const createRes = await request(app.getHttpServer())
        .post("/api/agents")
        .set("x-project-id", projectId)
        .send({ name: "patch-me", role: "worker" })
        .expect(201);
      const agentId = createRes.body.data.id as string;

      const patchRes = await request(app.getHttpServer())
        .patch(`/api/agents/${agentId}`)
        .set("x-project-id", projectId)
        .send({ name: "patched-name", role: "lead" })
        .expect(200);
      expect(patchRes.body.data).toMatchObject({
        id: agentId,
        name: "patched-name",
        role: "lead",
      });
    });

    it("DELETE /api/agents/:id removes agent", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E8 Agent Delete ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;
      const createRes = await request(app.getHttpServer())
        .post("/api/agents")
        .set("x-project-id", projectId)
        .send({ name: "to-delete", role: "temp" })
        .expect(201);
      const agentId = createRes.body.data.id as string;

      await request(app.getHttpServer())
        .delete(`/api/agents/${agentId}`)
        .set("x-project-id", projectId)
        .expect(200);

      const list = await request(app.getHttpServer())
        .get("/api/agents")
        .set("x-project-id", projectId)
        .expect(200);
      const ids = (list.body.data as Array<{ id: string }>).map((a) => a.id);
      expect(ids).not.toContain(agentId);
    });

    it("DELETE /api/projects/:id cascades related data", async () => {
      const projectRes = await request(app.getHttpServer())
        .post("/api/projects")
        .send({ name: `E8 Project Cascade ${Date.now().toString(36)}` })
        .expect(201);
      const projectId = projectRes.body.data.id as string;

      const agentRes = await request(app.getHttpServer())
        .post("/api/agents")
        .set("x-project-id", projectId)
        .send({ name: "cascade-agent", role: "r" })
        .expect(201);
      const agentId = agentRes.body.data.id as string;

      const threadRes = await request(app.getHttpServer())
        .post("/api/threads")
        .set("x-project-id", projectId)
        .send({ title: "cascade thread" })
        .expect(201);
      const threadId = threadRes.body.data.id as string;

      await request(app.getHttpServer())
        .post("/api/messages/send")
        .set("x-project-id", projectId)
        .send({
          threadId,
          fromAgentId: agentId,
          toAgentId: agentId,
          payload: { text: "e8" },
        })
        .expect(201);

      await request(app.getHttpServer()).delete(`/api/projects/${projectId}`).expect(200);

      await request(app.getHttpServer())
        .get("/api/agents")
        .set("x-project-id", projectId)
        .expect(404);

      const projects = await request(app.getHttpServer()).get("/api/projects").expect(200);
      const stillThere = (projects.body.data as Array<{ id: string }>).some((p) => p.id === projectId);
      expect(stillThere).toBe(false);
    });
  });
});
