import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "database.sqlite");

let db;

export function init() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("❌ Failed to open database:", err.message);
    } else {
      console.log("✅ Database initialized");
      db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          login TEXT NOT NULL,
          riotId TEXT NOT NULL,
          region TEXT NOT NULL,
          password TEXT NOT NULL,
          rank TEXT DEFAULT 'Unranked',
          lp TEXT DEFAULT '0 LP',
          winRate TEXT DEFAULT '0%',
          imageSrc TEXT DEFAULT 'Unranked.webp'
        );
      `);
    }
  });
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call init() first.");
  }

  return {
    all: (sql, params = []) =>
      new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),

    run: (sql, params = []) =>
      new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      }),
  };
}
