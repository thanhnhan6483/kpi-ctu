import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'src', 'data');

export function readDb<T>(filename: string): T[] {
  const filePath = join(DATA_DIR, `${filename}.json`);
  if (!existsSync(filePath)) {
    return [];
  }
  const data = readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as T[];
}

export function writeDb<T>(filename: string, data: T[]): void {
  const filePath = join(DATA_DIR, `${filename}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function findById<T extends { id: string }>(filename: string, id: string): T | undefined {
  const items = readDb<T>(filename);
  return items.find(item => item.id === id);
}

export function findMany<T>(filename: string, predicate: (item: T) => boolean): T[] {
  const items = readDb<T>(filename);
  return items.filter(predicate);
}

export function create<T extends { id: string }>(filename: string, item: T): T {
  const items = readDb<T>(filename);
  items.push(item);
  writeDb(filename, items);
  return item;
}

export function update<T extends { id: string }>(filename: string, id: string, updates: Partial<T>): T | undefined {
  const items = readDb<T>(filename);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) {
    return undefined;
  }
  items[index] = { ...items[index], ...updates };
  writeDb(filename, items);
  return items[index];
}

export function remove<T extends { id: string }>(filename: string, id: string): boolean {
  const items = readDb<T>(filename);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) {
    return false;
  }
  writeDb(filename, filtered);
  return true;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
