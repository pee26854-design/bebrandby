USE bebrandby;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(40),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (name, username, email, phone, password_hash, created_at)
SELECT u.name, u.username, u.email, u.phone, u.password_hash, u.created_at
FROM users u
WHERE u.role = 'admin'
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  username = VALUES(username),
  email = VALUES(email),
  phone = VALUES(phone),
  password_hash = VALUES(password_hash);

DELETE FROM users WHERE role = 'admin';
