#!/usr/bin/env tsx
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Handle different migration commands
const command = process.argv[2];

switch (command) {
  case 'push':
    console.log('🔄 Pushing schema changes to database...');
    // This would use drizzle-kit push command
    break;
  case 'generate':
    console.log('🔄 Generating migration files...');
    // This would use drizzle-kit generate command
    break;
  case 'migrate':
  default:
    runMigrations();
    break;
}