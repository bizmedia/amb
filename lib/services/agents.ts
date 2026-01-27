import { prisma } from "@/lib/prisma";
import { Prisma } from "../../prisma/generated/client";

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

export async function searchAgents(query: string) {
  if (!query) {
    return listAgents();
  }

  return prisma.agent.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { role: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });
}
