import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { AllExceptionsFilter } from "../src/common/http-exception.filter";

describe("API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
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
});
