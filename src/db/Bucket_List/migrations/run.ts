import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new Database('bucket-list.db');

try {
  const migration = readFileSync(join(__dirname, '001_initial.sql'), 'utf8');
  db.exec(migration);
  console.log('Migrations completed successfully');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
} finally {
  db.close();
}