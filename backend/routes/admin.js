const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/stats", authenticateToken, authorizeRoles("admin"), (req, res) => {
  const queries = {
    total_jobs: "SELECT COUNT(*) AS count FROM jobs",
    total_users: "SELECT COUNT(*) AS count FROM users",
    total_applications: "SELECT COUNT(*) AS count FROM applications",
    pending: "SELECT COUNT(*) AS count FROM applications WHERE status = 'applied' OR status='pending'",
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, q]) => {
    db.query(q, (err, rows) => {
      if (err) {
        results[key] = 0;
      } else {
        results[key] = rows[0].count;
      }
      completed++;
      if (completed === total) res.json(results);
    });
  });
});

module.exports = router;
