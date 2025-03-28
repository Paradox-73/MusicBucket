import { openDB, IDBPDatabase } from 'idb';
import { BucketItem } from './schema';

const DB_NAME = 'spotify-bucket-list';
const STORE_NAME = 'bucket-items';
const DB_VERSION = 1;

export class DBClient {
  private static instance: DBClient;
  private db: Promise<IDBPDatabase>;

  private constructor() {
    this.db = this.initDB();
  }

  static getInstance(): DBClient {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient();
    }
    return DBClient.instance;
  }

  private async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async addItem(item: BucketItem): Promise<void> {
    const db = await this.db;
    await db.put(STORE_NAME, item);
  }

  async getItems(): Promise<BucketItem[]> {
    const db = await this.db;
    return db.getAll(STORE_NAME);
  }

  async updateItem(id: string, updates: Partial<BucketItem>): Promise<void> {
    const db = await this.db;
    const item = await db.get(STORE_NAME, id);
    if (item) {
      await db.put(STORE_NAME, { ...item, ...updates });
    }
  }

  async deleteItem(id: string): Promise<void> {
    const db = await this.db;
    await db.delete(STORE_NAME, id);
  }

  async backup(): Promise<string> {
    const items = await this.getItems();
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bucket-list-backup-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return url;
  }

  async restore(file: File): Promise<void> {
    try {
      const text = await file.text();
      const items = JSON.parse(text) as BucketItem[];
      const db = await this.db;
      
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await tx.objectStore(STORE_NAME).clear();
      
      for (const item of items) {
        await tx.objectStore(STORE_NAME).add(item);
      }
      
      await tx.done;
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error('Failed to restore backup');
    }
  }
}