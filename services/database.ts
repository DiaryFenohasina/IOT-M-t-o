import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'iot_meteo.db';

let database: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async () => {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  return database;
};
