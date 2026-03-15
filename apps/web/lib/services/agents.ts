import { prisma } from "@/lib/prisma";
import { Prisma } from "@amb-app/db";

export type CreateAgentInput = {
  projectId: string;
  name: string;
  role: string;
  capabilities?: Prisma.InputJsonValue | null;
};

export async function listAgents(projectId: string) {
  return prisma.agent.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAgent(input: CreateAgentInput) {
  return prisma.agent.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      role: input.role,
      capabilities: input.capabilities ?? undefined,
    },
  });
}

export async function searchAgents(projectId: string, query: string) {
  if (!query) {
    return listAgents(projectId);
  }

  return prisma.agent.findMany({
    where: {
      projectId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { role: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });
}
