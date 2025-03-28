import Database from 'better-sqlite3';
import { BucketItem, BucketItemSchema } from './schema';

export class DBClient {
  private static instance: DBClient;
  private db: Database.Database;

  private constructor() {
    this.db = new Database('bucket-list.db');
    this.db.pragma('journal_mode = WAL');
  }

  static getInstance(): DBClient {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient();
    }
    return DBClient.instance;
  }

  async addItem(item: BucketItem): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO bucket_items (
        id, type, name, image_url, artists, added_at, listened, priority, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      item.id,
      item.type,
      item.name,
      item.imageUrl,
      item.artists ? JSON.stringify(item.artists) : null,
      item.addedAt,
      item.listened ? 1 : 0,
      item.priority,
      item.notes
    );
  }

  async getItems(): Promise<BucketItem[]> {
    const stmt = this.db.prepare('SELECT * FROM bucket_items ORDER BY added_at DESC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      ...row,
      listened: Boolean(row.listened),
      artists: row.artists ? JSON.parse(row.artists) : undefined,
    }));
  }

  async updateItem(id: string, updates: Partial<BucketItem>): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'artists') {
        sets.push('artists = ?');
        values.push(value ? JSON.stringify(value) : null);
      } else if (key === 'listened') {
        sets.push('listened = ?');
        values.push(value ? 1 : 0);
      } else if (key in updates) {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    const stmt = this.db.prepare(`
      UPDATE bucket_items
      SET ${sets.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values, id);
  }

  async deleteItem(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM bucket_items WHERE id = ?');
    stmt.run(id);
  }

  async backup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `bucket-list-backup-${timestamp}.db`;
    
    this.db.backup(backupPath)
      .then(() => console.log(`Backup created: ${backupPath}`))
      .catch(err => console.error('Backup failed:', err));
  }
}