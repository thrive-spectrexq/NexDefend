-- Initialize the database schema for NexDefend

-- Drop tables if they already exist
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS threats CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS suricata_events CASCADE;

-- Create 'users' table to store user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')), -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'suricata_events' table to store all Suricata logs
CREATE TABLE suricata_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    event_type VARCHAR(50),
    http JSONB,
    tls JSONB,
    dns JSONB,
    alert JSONB
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
    threat_id INT REFERENCES threats(id) ON DELETE CASCADE, -- Link to threats table
    alert_message TEXT NOT NULL,
    alert_level VARCHAR(10) NOT NULL CHECK (alert_level IN ('low', 'medium', 'high')), -- e.g., "low", "medium", "high"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'uploaded_files' table to store uploaded file information
CREATE TABLE uploaded_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size INT,
    analysis_result TEXT,
    alert BOOLEAN DEFAULT FALSE
);

-- Add indexes for faster lookups
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_threats_detected_at ON threats (detected_at);
CREATE INDEX idx_alerts_created_at ON alerts (created_at);
CREATE INDEX idx_uploaded_files_filename ON uploaded_files (filename);
CREATE INDEX idx_suricata_events_event_type ON suricata_events (event_type);
