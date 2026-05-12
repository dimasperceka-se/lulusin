import { defineConfig } from "drizzle-kit";
import { loadEnvFile } from "node:process";

// Auto-load shared .env from api-server. Silent if file missing (CI / shell-set env still works).
try {
  loadEnvFile("../../artifacts/api-server/.env");
} catch {
  // file not found — fall back to whatever's in process.env already
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
