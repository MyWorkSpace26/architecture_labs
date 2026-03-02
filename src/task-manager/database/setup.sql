-- PostgreSQL Database Setup for Task Manager
-- Run this script to create the database and initial setup

-- Create database (run as postgres user)
CREATE DATABASE taskmanager;

-- Create user (optional - you can use existing postgres user)
-- CREATE USER taskmanager_user WITH PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskmanager_user;

-- Connect to the taskmanager database and run these commands:
-- \c taskmanager;

-- The schema will be created automatically by Prisma migrations
-- Just run: npm run prisma:migrate

-- Sample data (optional - can be created through the app)
-- INSERT INTO users (id, username, email, password_hash, role, created_at) 
-- VALUES 
-- ('admin-id', 'admin', 'admin@example.com', '$2a$10$...', 'ADMIN', NOW()),
-- ('moderator-id', 'moderator', 'moderator@example.com', '$2a$10$...', 'MODERATOR', NOW()),
-- ('viewer-id', 'viewer', 'viewer@example.com', '$2a$10$...', 'VIEWER', NOW());

-- Note: Password hashes above are bcrypt hashes. Use a real hash in production.
