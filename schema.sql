-- Campus Placement Automation System Database Schema

CREATE DATABASE IF NOT EXISTS campus_placement;
USE campus_placement;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student'
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company VARCHAR(255) DEFAULT 'Tech Corp',
  location VARCHAR(255) DEFAULT 'Remote',
  salary VARCHAR(100) DEFAULT '₹8 - 12 LPA',
  recruiter_id INT DEFAULT NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Demo initial data
-- Passwords below are hashed for 'admin123', 'student123', 'recruiter123'
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@placement.com', '$2b$10$w8.3fPj8t0o3U7Fm2zQk/ey.tFeqo/eLzfvJ1g5/XmO7/qQ83cMfa', 'admin'),
(2, 'Rahul Sharma', 'student@placement.com', '$2b$10$oE080RzS0eRzfvVbYmE5eueBqgG2J5YFhR1s75DfqeWlU60g1f43S', 'student'),
(3, 'Pooja Recruiter', 'recruiter@placement.com', '$2b$10$5j2bS59Fw2z5g.tfeqo/eLzfvJ1g5/XmO7/qQ83cMfa.eBqgG2J5YF', 'recruiter');

INSERT IGNORE INTO jobs (id, title, description, company, location, salary, recruiter_id) VALUES
(1, 'Full Stack Developer (MERN)', 'Develop and maintain web applications using React, Node.js, Express, and databases. Good understanding of REST APIs.', 'Infosys Technologies', 'Bangalore / Hybrid', '₹7.5 - 10 LPA', 1),
(2, 'Frontend Engineer', 'Build responsive, accessible, and performant web interfaces with React, modern CSS, and state management.', 'TCS Digital', 'Hyderabad / Remote', '₹6 - 8.5 LPA', 1),
(3, 'Data Analyst & BI Specialist', 'Design analytical dashboards, extract business insights using SQL and Python, and work with stakeholder teams.', 'Wipro Analytics', 'Pune / Onsite', '₹6.5 - 9 LPA', 1);
