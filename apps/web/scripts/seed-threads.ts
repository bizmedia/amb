#!/usr/bin/env tsx
/**
 * Seed Threads Script
 *
 * Creates default threads for all agents based on registry.json
 */

import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const API_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";
const PROJECT_ID = process.env.MESSAGE_BUS_PROJECT_ID;

type Registry = {
  project: string;
  agents: {
    id: string;
    name: string;
    role: string;
    defaultThreads?: string[];
  }[];
};

async function createThread(title: string): Promise<{ id: string; title: string } | null> {
  try {
    const res = await fetch(`${API_URL}/api/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(PROJECT_ID ? { "x-project-id": PROJECT_ID } : {}),
      },
      body: JSON.stringify({ title, status: "open" }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`   ❌ Failed: ${text}`);
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`   ❌ Error: ${err}`);
    return null;
  }
}

async function getExistingThreads(): Promise<Set<string>> {
  try {
    const res = await fetch(`${API_URL}/api/threads`, {
      headers: PROJECT_ID ? { "x-project-id": PROJECT_ID } : undefined,
    });
    if (!res.ok) return new Set();
    const json = await res.json();
    return new Set(json.data.map((t: { title: string }) => t.title));
  } catch {
    return new Set();
  }
}

async function main() {
  console.log("🌱 Seeding default threads...\n");

  // Load registry
  const registryPath = path.resolve(".cursor/agents/registry.json");
  const raw = await fs.readFile(registryPath, "utf-8");
  const registry = JSON.parse(raw) as Registry;

  // Get existing threads to avoid duplicates
  const existingThreads = await getExistingThreads();
  console.log(`📋 Existing threads: ${existingThreads.size}\n`);

  let created = 0;
  let skipped = 0;

  // Collect all unique thread titles
  const threadTitles = new Set<string>();

  for (const agent of registry.agents) {
    if (agent.defaultThreads) {
      for (const thread of agent.defaultThreads) {
        threadTitles.add(thread);
      }
    }
  }

  console.log(`📝 Threads to seed: ${threadTitles.size}\n`);

  for (const title of threadTitles) {
    if (existingThreads.has(title)) {
      console.log(`⏭️  Skip (exists): ${title}`);
      skipped++;
      continue;
    }

    const thread = await createThread(title);
    if (thread) {
      console.log(`✅ Created: ${title} → ${thread.id}`);
      created++;
    }
  }

  // Also create some common workflow threads
  const workflowThreads = [
    "general",
    "announcements",
    "incidents",
    "releases",
  ];

  console.log("\n📂 Workflow threads:");

  for (const title of workflowThreads) {
    if (existingThreads.has(title) || threadTitles.has(title)) {
      console.log(`⏭️  Skip (exists): ${title}`);
      skipped++;
      continue;
    }

    const thread = await createThread(title);
    if (thread) {
      console.log(`✅ Created: ${title} → ${thread.id}`);
      created++;
    }
  }

  console.log("\n────────────────────────────────────");
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log("🎉 Thread seeding complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
