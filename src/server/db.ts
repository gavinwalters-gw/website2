import { neon } from "@neondatabase/serverless";

// Neon Postgres over HTTP, where RSVPs and questions are kept. DATABASE_URL lives in .env.local here and
// in the host's environment settings in production. scripts/setup-db.mjs creates the tables.
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
