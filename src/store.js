import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';

const migrationSql = readFileSync(new URL('../migrations/001_create_messages.sql', import.meta.url), 'utf8');

function openDatabase(databasePath) {
  mkdirSync(dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.exec(migrationSql);
  return db;
}

export function migrateDatabase(databasePath) {
  const db = openDatabase(databasePath);
  db.close();
}

export function createMessageStore(databasePath) {
  const db = openDatabase(databasePath);
  const insertMessage = db.prepare(`
    INSERT INTO messages (room, user_name, body, created_at)
    VALUES (@room, @user, @body, @createdAt)
  `);
  const listMessages = db.prepare(`
    SELECT room, user_name AS user, body, created_at AS createdAt
    FROM messages
    WHERE room = ?
    ORDER BY id
  `);

  return {
    addMessage(message) {
      insertMessage.run(message);
      return message;
    },
    listMessages(room) {
      return listMessages.all(room);
    },
    close() {
      db.close();
    }
  };
}
