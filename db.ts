import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./schema";

// Configure WebSocket BEFORE the database connection definition
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:password@helium/heliumdb?sslmode=disable";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
