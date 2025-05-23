const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.sqlite");

let db;

function init() {
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

// Wrap db with Promises so you can use async/await cleanly
function getDB() {
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

module.exports = {
  init,
  getDB,
};
