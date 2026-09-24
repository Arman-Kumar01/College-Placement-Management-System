const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });

  // Check existing
  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length) return res.status(400).json({ error: "Email already registered" });

    const jwtSecret = process.env.JWT_SECRET || "supersecret_campus_placement_jwt_key_2026";
    const hashed = await bcrypt.hash(password, 10);
    db.query("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hashed, role || "student"],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message || "Signup failed" });
        const user = { id: result.insertId, email, role: role || "student", name };
        const token = jwt.sign(user, jwtSecret, { expiresIn: "8h" });
        res.json({ message: "Signup success", token, user });
      });
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  db.query("SELECT id, name, email, password, role FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message || "Database error" });
    if (!results.length) return res.status(400).json({ error: "Invalid credentials" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const jwtSecret = process.env.JWT_SECRET || "supersecret_campus_placement_jwt_key_2026";
    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "8h" });
    res.json({ message: "Login success", token, user: payload });
  });
});

module.exports = router;
