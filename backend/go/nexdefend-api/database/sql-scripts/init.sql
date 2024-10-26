-- Initialize the database schema for NexDefend

-- Drop tables if they already exist
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS threats CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;

-- Create 'users' table to store user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'threats' table to store detected threats
CREATE TABLE threats (
    id SERIAL PRIMARY KEY,
    threat_type VARCHAR(100) NOT NULL, -- e.g., "malware", "phishing"
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP
);

-- Create 'alerts' table to store alert data
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    threat_id INT REFERENCES threats(id) ON DELETE CASCADE,
    alert_message TEXT NOT NULL,
    alert_level VARCHAR(10) NOT NULL, -- e.g., "low", "medium", "high"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add any indexes for faster lookups
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_threats_detected_at ON threats (detected_at);
CREATE INDEX idx_alerts_created_at ON alerts (created_at);
