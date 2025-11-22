import { defineConfig } from 'drizzle-kit';

//? Make sure you are cd into "src" directory before running a migration.
export default defineConfig({
  out: './drizzle',
  schema: './schema/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
