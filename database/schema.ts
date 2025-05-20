// src/database/schema.ts
import * as SQLite from "expo-sqlite";

// Инициализация и создание таблиц
export const initDatabase = () => {
  // Открытие БД синхронно (Expo SDK 50+)
  const db = SQLite.openDatabaseSync("markers.db");

  // Создание таблиц, если не существуют
  db.execAsync(`
    CREATE TABLE IF NOT EXISTS markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      label TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS marker_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marker_id INTEGER NOT NULL,
      uri TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
    );
  `);

  return db;
};
