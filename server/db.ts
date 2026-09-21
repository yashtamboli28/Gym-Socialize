import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Ensure PostgreSQL is running locally if running in container environment
function ensurePostgresRunning() {
  try {
    execSync('pg_isready -q', { stdio: 'ignore' });
  } catch {
    try {
      execSync('mkdir -p /var/run/postgresql && chown -R postgres:postgres /var/run/postgresql && su - postgres -c "pg_ctl -D /tmp/pgdata -l /tmp/pgdata/logfile start"', {
        stdio: 'ignore',
      });
      // Brief pause to allow socket to open
      execSync('sleep 1');
    } catch (e) {
      console.warn('[DB] Warning: Could not auto-start local postgres daemon:', e);
    }
  }
}

// Resolve Database URL: If DATABASE_URL contains placeholder or is unset, use local postgres
export function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl || envUrl.includes('[YOUR-PASSWORD]')) {
    return 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';
  }
  return envUrl;
}

ensurePostgresRunning();

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
