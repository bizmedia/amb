/**
 * Seed default threads from .cursor/agents/registry.json into the Message Bus API.
 * Reads registry from current working directory (project that installed the package).
 */
import "dotenv/config";
export declare function runSeedThreads(registryPath?: string): Promise<void>;
