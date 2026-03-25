import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  connectionString: 'postgresql://neondb_owner:npg_KsyDTEdz92Bw@ep-divine-paper-agf9wpl2-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

const sql = fs.readFileSync(
  path.join(__dirname, '../src/lib/db/migrations/001_initial_schema.sql'),
  'utf-8'
);

try {
  await client.connect();
  console.log('Connected to Neon');
  await client.query(sql);
  console.log('Migration completed successfully');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
