import { resolveProjectId } from "@/lib/api/project-context";
import { getApiClient } from "@/lib/api/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SSEData =
  | { type: "inbox_counts"; data: Record<string, number> }
  | { type: "dlq_count"; data: { count: number } }
  | { type: "connected"; data: { timestamp: string } }
  | { type: "new_message"; data: { messageId: string; threadId: string; fromAgentId: string; toAgentId: string | null; timestamp: string } };

async function getInboxCounts(projectId: string): Promise<Record<string, number>> {
  const client = getApiClient(projectId);
  const agents = await client.listAgents();
  const counts = await Promise.all(
    agents.map(async (agent) => {
      const messages = await client.getInbox(agent.id);
      return { agentId: agent.id, count: messages.length };
    })
  );
  return counts.reduce(
    (acc, { agentId, count }) => {
      acc[agentId] = count;
      return acc;
    },
    {} as Record<string, number>
  );
}

async function getDlqCount(projectId: string): Promise<number> {
  const client = getApiClient(projectId);
  const messages = await client.getDLQ();
  return messages.length;
}

export async function GET(req: Request) {
  const project = await resolveProjectId(req);
  if (project.error) {
    return project.error;
  }

  const projectId = project.projectId;
  const encoder = new TextEncoder();

  const send = (controller: ReadableStreamDefaultController, data: SSEData) => {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(encoder.encode(message));
  };

  const stream = new ReadableStream({
    async start(controller) {
      // Send connected event
      send(controller, {
        type: "connected",
        data: { timestamp: new Date().toISOString() },
      });

      // Send initial data
      const [inboxCounts, dlqCount] = await Promise.all([
        getInboxCounts(projectId),
        getDlqCount(projectId),
      ]);

      send(controller, { type: "inbox_counts", data: inboxCounts });
      send(controller, { type: "dlq_count", data: { count: dlqCount } });

      // Poll and push updates
      const interval = setInterval(async () => {
        try {
          const [newInboxCounts, newDlqCount] = await Promise.all([
            getInboxCounts(projectId),
            getDlqCount(projectId),
          ]);

          send(controller, { type: "inbox_counts", data: newInboxCounts });
          send(controller, { type: "dlq_count", data: { count: newDlqCount } });
        } catch {
          // Silent fail, continue polling
        }
      }, 3000);

      // Cleanup on abort
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
