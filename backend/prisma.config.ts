import { join } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config();
config({ path: join(process.cwd(), "..", ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
