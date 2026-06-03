import { join } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config();
config({ path: join(process.cwd(), "..", ".env") });

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
