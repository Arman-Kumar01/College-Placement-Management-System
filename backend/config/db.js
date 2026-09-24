const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();

let activeDb = null;
let isReady = false;
const queryQueue = [];

function executeQueue() {
  isReady = true;
  while (queryQueue.length > 0) {
    const { sql, params, callback } = queryQueue.shift();
    dbWrapper.query(sql, params, callback);
  }
}

// Function to seed initial data
async function seedDefaultData(dbClient) {
  try {
    dbClient.query("SELECT COUNT(*) as count FROM users", async (err, rows) => {
      if (!err && rows && rows[0] && rows[0].count === 0) {
        console.log("🌱 Database is empty. Seeding initial demo users and jobs...");
        const adminPass = await bcrypt.hash("admin123", 10);
        const studentPass = await bcrypt.hash("student123", 10);
        const recruiterPass = await bcrypt.hash("recruiter123", 10);

        dbClient.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          ["Admin Officer", "admin@placement.com", adminPass, "admin"],
          () => {}
        );
        dbClient.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          ["Rahul Sharma", "student@placement.com", studentPass, "student"],
          () => {}
        );
        dbClient.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          ["Pooja HR", "recruiter@placement.com", recruiterPass, "recruiter"],
          () => {}
        );

        // Seed demo jobs
        dbClient.query(
          "INSERT INTO jobs (title, description, recruiter_id) VALUES (?, ?, ?)",
          [
            "Full Stack Developer (React & Node.js)",
            "We are hiring a Full Stack Developer proficient in React, Node.js, Express, and SQL. Package: ₹8 - 12 LPA. Location: Bangalore / Hybrid.",
            1
          ],
          () => {}
        );

        dbClient.query(
          "INSERT INTO jobs (title, description, recruiter_id) VALUES (?, ?, ?)",
          [
            "Frontend Engineer",
            "Looking for a frontend specialist experienced in building responsive, modern web applications. Package: ₹6 - 9 LPA. Location: Pune / Remote.",
            1
          ],
          () => {}
        );

        dbClient.query(
          "INSERT INTO jobs (title, description, recruiter_id) VALUES (?, ?, ?)",
          [
            "Data Analyst",
            "Role involves data modeling, SQL querying, dashboards, and reporting. Package: ₹7 - 10 LPA. Location: Gurgaon / Hybrid.",
            1
          ],
          () => {}
        );

        console.log("✅ Seed complete! Demo accounts:");
        console.log("   Admin:     admin@placement.com / admin123");
        console.log("   Student:   student@placement.com / student123");
        console.log("   Recruiter: recruiter@placement.com / recruiter123");
      }
    });
  } catch (seedErr) {
    console.warn("Seeding note:", seedErr.message);
  }
}

// Function to initialize SQLite fallback
function initSqlite() {
  console.log("⚡ Initializing built-in SQLite database (placement.sqlite)...");
  let DatabaseSync;
  try {
    DatabaseSync = require("node:sqlite").DatabaseSync;
  } catch (err) {
    console.error("Failed to load node:sqlite:", err);
    throw err;
  }

  const dbPath = path.resolve(__dirname, "..", "placement.sqlite");
  const sqlite = new DatabaseSync(dbPath);

  // Enable WAL mode for better concurrency
  sqlite.exec("PRAGMA journal_mode = WAL;");

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student'
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      recruiter_id INTEGER DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      status TEXT DEFAULT 'applied',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  activeDb = {
    type: "sqlite",
    query: (sql, params, callback) => {
      if (typeof params === "function") {
        callback = params;
        params = [];
      } else if (!params) {
        params = [];
      } else if (!Array.isArray(params)) {
        params = [params];
      }

      setImmediate(() => {
        try {
          const trimmedSql = sql.trim();
          const upperSql = trimmedSql.toUpperCase();

          if (upperSql.startsWith("SELECT") || upperSql.startsWith("PRAGMA")) {
            const stmt = sqlite.prepare(trimmedSql);
            const rows = stmt.all(...params);
            if (callback) callback(null, rows);
          } else {
            const stmt = sqlite.prepare(trimmedSql);
            const info = stmt.run(...params);
            const result = {
              insertId: Number(info.lastInsertRowid),
              affectedRows: info.changes,
              changedRows: info.changes
            };
            if (callback) callback(null, result);
          }
        } catch (err) {
          console.error("SQLite query error:", err.message, "SQL:", sql);
          if (callback) callback(err);
        }
      });
    }
  };

  console.log(" Connected to SQLite Database successfully (" + dbPath + ")");
  seedDefaultData(activeDb);
  executeQueue();
}

// Try MySQL first
function tryConnectMySQL() {
  const mysqlConn = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "campus_placement"
  });

  mysqlConn.connect((err) => {
    if (err) {
      console.warn("⚠️ MySQL connection failed (" + err.message + ").");
      console.warn("ℹ️ Automatically falling back to built-in SQLite engine for zero-config execution.");
      initSqlite();
    } else {
      console.log("Connected to MySQL Database (" + (process.env.DB_NAME || "campus_placement") + ")");

      // Create MySQL tables if not exist
      const createUsers = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'student'
        )
      `;
      const createJobs = `
        CREATE TABLE IF NOT EXISTS jobs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          recruiter_id INT DEFAULT NULL
        )
      `;
      const createApps = `
        CREATE TABLE IF NOT EXISTS applications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          job_id INT NOT NULL,
          status VARCHAR(50) DEFAULT 'applied',
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      mysqlConn.query(createUsers, () => {
        mysqlConn.query(createJobs, () => {
          mysqlConn.query(createApps, () => {
            activeDb = {
              type: "mysql",
              query: (sql, params, callback) => mysqlConn.query(sql, params, callback)
            };
            seedDefaultData(activeDb);
            executeQueue();
          });
        });
      });
    }
  });

  mysqlConn.on("error", (err) => {
    if (!activeDb || activeDb.type !== "sqlite") {
      console.error("MySQL connection error:", err.message);
      if (!activeDb) initSqlite();
    }
  });
}

tryConnectMySQL();

const dbWrapper = {
  query: (sql, params, callback) => {
    if (!isReady || !activeDb) {
      queryQueue.push({ sql, params, callback });
    } else {
      activeDb.query(sql, params, callback);
    }
  }
};

module.exports = dbWrapper;
