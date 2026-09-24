const db = require("../config/db");

// Apply for a job
const applyForJob = (req, res) => {
  const { jobId } = req.body;
  const studentId = req.user.id; // user info comes from token

  if (!jobId) {
    return res.status(400).json({ message: "Job ID required" });
  }

  const sql = "INSERT INTO applications (student_id, job_id) VALUES (?, ?)";
  db.query(sql, [studentId, jobId], (err, result) => {
    if (err) {
      console.error("Error applying for job:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Applied successfully" });
  });
};

// Get applications for logged-in student
const getApplications = (req, res) => {
  const studentId = req.user.id;

  const sql = `
    SELECT applications.id, jobs.title, jobs.description
    FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    WHERE applications.student_id = ?
  `;
  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching applications:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

module.exports = { applyForJob, getApplications };
