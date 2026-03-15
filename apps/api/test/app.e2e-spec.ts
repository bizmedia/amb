import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createHmac } from "node:crypto";
import { AppModule } from "../src/app.module";
import { AllExceptionsFilter } from "../src/common/http-exception.filter";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

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
    it("returns 200 and list (default project)", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/agents")
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /api/agents", () => {
    it("creates agent and returns 200", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/agents")
        .send({ name: "e2e-agent", role: "e2e-tester" })
        .expect(201);
      expect(res.body.data).toMatchObject({
        name: "e2e-agent",
        role: "e2e-tester",
      });
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe("GET /api/threads", () => {
    it("returns 200 and list", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/threads")
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /api/threads", () => {
    it("creates thread and returns 200", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/threads")
        .send({ title: "E2E thread" })
        .expect(201);
      expect(res.body.data).toMatchObject({ title: "E2E thread" });
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe("messages (send, inbox, ack)", () => {
    let threadId: string;
    let fromAgentId: string;
    let toAgentId: string;
    let messageId: string;

    beforeAll(async () => {
      const [threadRes, agentsRes] = await Promise.all([
        request(app.getHttpServer()).post("/api/threads").send({ title: "E2E messages" }),
        request(app.getHttpServer()).get("/api/agents"),
      ]);
      threadId = threadRes.body.data.id;
      const agents = agentsRes.body.data as Array<{ id: string; role: string }>;
      fromAgentId = agents[0]?.id ?? "";
      toAgentId = agents[1]?.id ?? agents[0]?.id ?? "";
      if (!fromAgentId || !toAgentId) {
        const createRes = await request(app.getHttpServer())
          .post("/api/agents")
          .send({ name: "from-e2e", role: "from-e2e" });
        fromAgentId = createRes.body.data.id;
        toAgentId = fromAgentId;
      }
    });

    it("POST /api/messages/send returns 201", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/messages/send")
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
        .query({ agentId: toAgentId })
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/messages/:id/ack returns 201", async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/messages/${messageId}/ack`)
        .expect(201);
      expect(res.body.data.id).toBe(messageId);
    });
  });

  describe("issues (project-scoped)", () => {
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
          .send({ name: "E2E Issues Project" });
        projectId = createRes.body.data.id;
      }
    });

    it("GET /api/projects/:projectId/issues returns 200", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/issues`)
        .expect(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("POST /api/projects/:projectId/issues creates issue", async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/projects/${projectId}/issues`)
        .send({ title: "E2E issue" })
        .expect(201);
      expect(res.body.data).toMatchObject({ title: "E2E issue" });
      expect(res.body.data.id).toBeDefined();
    });

    it("GET /api/projects/:projectId/issues/:id returns 404 for bad id", async () => {
      await request(app.getHttpServer())
        .get(`/api/projects/${projectId}/issues/00000000-0000-0000-0000-000000000099`)
        .expect(404);
    });
  });

  describe("GET /api/dlq", () => {
    it("returns 200 and list", async () => {
      const res = await request(app.getHttpServer()).get("/api/dlq").expect(200);
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
    let issueAId: string;

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

      const issueRes = await request(app.getHttpServer())
        .post(`/api/projects/${projectAId}/issues`)
        .send({ title: `iso-issue-${suffix}` })
        .expect(201);
      issueAId = issueRes.body.data.id;
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

    it("does not expose issues across projects", async () => {
      await request(app.getHttpServer())
        .get(`/api/projects/${projectBId}/issues/${issueAId}`)
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
        .get(`/api/projects/${otherProjectId}/issues`)
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
});
