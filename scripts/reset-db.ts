#!/usr/bin/env tsx
/**
 * Reset Database Script
 *
 * Clears all data and re-seeds agents and threads.
 * USE WITH CAUTION - this deletes all messages!
 */

import { execSync } from "child_process";
import readline from "readline";

const API_URL = process.env.MESSAGE_BUS_URL ?? "http://localhost:3333";

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

async function deleteAllMessages(): Promise<number> {
  // Get all threads
  const threadsRes = await fetch(`${API_URL}/api/threads`);
  if (!threadsRes.ok) return 0;
  const threads = (await threadsRes.json()).data as { id: string }[];

  let deleted = 0;

  // Delete each thread (cascades to messages)
  for (const thread of threads) {
    const res = await fetch(`${API_URL}/api/threads/${thread.id}`, {
      method: "DELETE",
    });
    if (res.ok) deleted++;
  }

  return deleted;
}

async function deleteAllAgents(): Promise<number> {
  // Note: We don't have a delete agents endpoint, so we'll use prisma directly
  // For now, just return 0 - agents will be recreated by seed
  return 0;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  ⚠️  DATABASE RESET                                         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("This will:");
  console.log("  1. Delete all threads and messages");
  console.log("  2. Run prisma migrate reset");
  console.log("  3. Re-seed agents");
  console.log("  4. Re-seed threads\n");

  const skipConfirm = process.argv.includes("--force") || process.argv.includes("-f");

  if (!skipConfirm) {
    const confirmed = await confirm("Are you sure you want to reset the database?");
    if (!confirmed) {
      console.log("\n❌ Aborted.");
      process.exit(0);
    }
  }

  console.log("\n🗑️  Deleting threads and messages...");
  const deletedThreads = await deleteAllMessages();
  console.log(`   Deleted ${deletedThreads} threads`);

  console.log("\n🔄 Running prisma migrate reset...");
  try {
    execSync("pnpm prisma migrate reset --force", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (err) {
    console.error("   ❌ Prisma reset failed:", err);
    process.exit(1);
  }

  console.log("\n🌱 Seeding agents...");
  try {
    execSync("pnpm seed:agents", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (err) {
    console.error("   ❌ Agent seeding failed:", err);
  }

  console.log("\n🌱 Seeding threads...");
  try {
    execSync("pnpm seed:threads", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (err) {
    console.error("   ❌ Thread seeding failed:", err);
  }

  console.log("\n✅ Database reset complete!");
  console.log("   Run 'pnpm dev' to start the server.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
