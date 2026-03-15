export function listAgents(storage, projectId) {
    return storage.listAgents(projectId);
}
export function createAgent(storage, input) {
    return storage.createAgent(input);
}
export function searchAgents(storage, projectId, query) {
    return storage.searchAgents(projectId, query);
}
