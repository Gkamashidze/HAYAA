import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const maxAttempts = Number(process.env.DB_DEPLOY_MAX_ATTEMPTS ?? 8);
const baseDelayMs = Number(process.env.DB_DEPLOY_RETRY_DELAY_MS ?? 5_000);

function ensureEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be set and at least 8 characters before seeding."
    );
  }
}

function localBin(name: string) {
  const extension = process.platform === "win32" ? ".cmd" : "";
  const binPath = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    `${name}${extension}`
  );

  if (!existsSync(binPath)) {
    throw new Error(`Missing local binary: ${binPath}. Run npm install first.`);
  }

  return binPath;
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      shell: false,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(`${command} ${args.join(" ")} failed with ${signal ?? code}`)
      );
    });
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deploySchemaAndSeed() {
  const prisma = localBin("prisma");
  const tsx = localBin("tsx");

  await run(prisma, ["db", "push"]);
  await run(tsx, ["prisma/seed.ts"]);
}

async function main() {
  ensureEnv();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`Database deploy attempt ${attempt}/${maxAttempts}`);
      await deploySchemaAndSeed();
      console.log("Database deploy completed");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const delayMs = Math.min(baseDelayMs * attempt, 30_000);
      console.warn(
        `Database deploy attempt ${attempt} failed; retrying in ${Math.round(
          delayMs / 1000
        )}s...`
      );
      await sleep(delayMs);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
