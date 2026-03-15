import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryMessageBusStorage } from "../storage/in-memory";
import { createAgent, listAgents, searchAgents } from "./agents";

describe("agents service", () => {
  let storage: InMemoryMessageBusStorage;

  beforeEach(() => {
    storage = new InMemoryMessageBusStorage();
  });

  it("createAgent and listAgents", async () => {
    const created = await createAgent(storage, {
      projectId: "p1",
      name: "Dev",
      role: "dev",
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe("Dev");
    expect(created.projectId).toBe("p1");

    const list = await listAgents(storage, "p1");
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Dev");
  });

  it("searchAgents filters by query", async () => {
    await createAgent(storage, { projectId: "p1", name: "Alice", role: "dev" });
    await createAgent(storage, { projectId: "p1", name: "Bob", role: "qa" });
    const found = await searchAgents(storage, "p1", "ali");
    expect(found).toHaveLength(1);
    expect(found[0].name).toBe("Alice");
  });
});
