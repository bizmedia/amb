import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export type CreateAgentInput = {
  name: string;
  role: string;
  capabilities?: Prisma.InputJsonValue | null;
};

export async function listAgents() {
  return prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createAgent(input: CreateAgentInput) {
  return prisma.agent.create({
    data: {
      name: input.name,
      role: input.role,
      capabilities: input.capabilities ?? undefined,
    },
  });
}
