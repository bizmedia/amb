function uuid() {
    return crypto.randomUUID();
}
function now() {
    return new Date().toISOString();
}
export class InMemoryMessageBusStorage {
    agents = [];
    threads = [];
    messages = [];
    async listAgents(projectId) {
        return this.agents
            .filter((a) => a.projectId === projectId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async createAgent(input) {
        const agent = {
            id: uuid(),
            projectId: input.projectId,
            name: input.name,
            role: input.role,
            status: "online",
            capabilities: input.capabilities ?? null,
            createdAt: now(),
            lastSeen: null,
        };
        this.agents.push(agent);
        return agent;
    }
    async searchAgents(projectId, query) {
        if (!query)
            return this.listAgents(projectId);
        const q = query.toLowerCase();
        return this.agents
            .filter((a) => a.projectId === projectId &&
            (a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    async getAgentById(projectId, agentId) {
        return this.agents.find((a) => a.projectId === projectId && a.id === agentId) ?? null;
    }
    async listThreads(projectId) {
        return this.threads
            .filter((t) => t.projectId === projectId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async createThread(input) {
        const thread = {
            id: uuid(),
            projectId: input.projectId,
            title: input.title,
            status: input.status,
            createdAt: now(),
        };
        this.threads.push(thread);
        return thread;
    }
    async getThreadById(projectId, threadId) {
        return this.threads.find((t) => t.projectId === projectId && t.id === threadId) ?? null;
    }
    async listThreadMessages(projectId, threadId) {
        return this.messages
            .filter((m) => m.projectId === projectId && m.threadId === threadId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    async updateThreadStatus(projectId, threadId, status) {
        const i = this.threads.findIndex((t) => t.projectId === projectId && t.id === threadId);
        if (i === -1)
            throw new Error("Thread not found");
        this.threads[i] = { ...this.threads[i], status };
        return this.threads[i];
    }
    async deleteThread(projectId, threadId) {
        this.messages = this.messages.filter((m) => !(m.projectId === projectId && m.threadId === threadId));
        this.threads = this.threads.filter((t) => !(t.projectId === projectId && t.id === threadId));
    }
    async createMessage(data) {
        const message = {
            id: uuid(),
            projectId: data.projectId,
            threadId: data.threadId,
            fromAgentId: data.fromAgentId,
            toAgentId: data.toAgentId,
            payload: data.payload,
            status: data.status,
            retries: data.retries,
            parentId: data.parentId,
            createdAt: now(),
        };
        this.messages.push(message);
        return message;
    }
    async getMessageById(projectId, messageId) {
        return this.messages.find((m) => m.projectId === projectId && m.id === messageId) ?? null;
    }
    async updateMessageStatus(projectId, messageId, status, retries) {
        const i = this.messages.findIndex((m) => m.projectId === projectId && m.id === messageId);
        if (i === -1)
            throw new Error("Message not found");
        this.messages[i] = {
            ...this.messages[i],
            status,
            ...(retries !== undefined ? { retries } : {}),
        };
        return this.messages[i];
    }
    async getInboxAndMarkDelivered(projectId, agentId) {
        for (let i = 0; i < this.messages.length; i++) {
            const m = this.messages[i];
            if (m.projectId !== projectId ||
                m.status !== "pending" ||
                m.fromAgentId === agentId)
                continue;
            if (m.toAgentId !== null && m.toAgentId !== agentId)
                continue;
            this.messages[i] = { ...m, status: "delivered" };
        }
        return this.findMessages(projectId, {
            status: "delivered",
            fromAgentId: { not: agentId },
        }).then((list) => list.filter((m) => m.toAgentId === agentId || m.toAgentId === null));
    }
    async findMessages(projectId, filter) {
        let list = this.messages.filter((m) => m.projectId === projectId);
        if (filter.status !== undefined)
            list = list.filter((m) => m.status === filter.status);
        if (filter.toAgentId !== undefined) {
            if (filter.toAgentId === null)
                list = list.filter((m) => m.toAgentId === null);
            else
                list = list.filter((m) => m.toAgentId === filter.toAgentId);
        }
        if (filter.fromAgentId?.not)
            list = list.filter((m) => m.fromAgentId !== filter.fromAgentId.not);
        if (filter.createdAtLt)
            list = list.filter((m) => new Date(m.createdAt) < filter.createdAtLt);
        return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    async updateManyMessages(projectId, filter, data) {
        let count = 0;
        for (let i = 0; i < this.messages.length; i++) {
            const m = this.messages[i];
            if (m.projectId !== projectId || m.status !== filter.status)
                continue;
            if (filter.toAgentId !== undefined) {
                if (filter.toAgentId === null && m.toAgentId !== null)
                    continue;
                if (filter.toAgentId !== null && m.toAgentId !== filter.toAgentId)
                    continue;
            }
            if (filter.fromAgentId?.not && m.fromAgentId === filter.fromAgentId.not)
                continue;
            this.messages[i] = { ...m, status: data.status };
            count++;
        }
        return count;
    }
    async deleteManyMessages(projectId, filter) {
        const before = this.messages.length;
        this.messages = this.messages.filter((m) => {
            if (m.projectId !== projectId)
                return true;
            if (!filter.status.in.includes(m.status))
                return true;
            if (new Date(m.createdAt) >= filter.createdAtLt)
                return true;
            return false;
        });
        return before - this.messages.length;
    }
    async updateManyMessagesToStatus(projectId, filter, data) {
        let count = 0;
        for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].projectId !== projectId || this.messages[i].status !== filter.status)
                continue;
            this.messages[i] = {
                ...this.messages[i],
                status: data.status,
                ...(data.retries !== undefined ? { retries: data.retries } : {}),
            };
            count++;
        }
        return count;
    }
}
