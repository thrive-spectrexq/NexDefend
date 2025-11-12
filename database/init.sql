-- Initialize the database schema for NexDefend

-- Drop tables if they already exist
DROP TABLE IF EXISTS system_metrics CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS threats CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS vulnerabilities CASCADE;
DROP TABLE IF EXISTS suricata_events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS fim_baseline CASCADE;
DROP TABLE IF EXISTS malware_hash_registry CASCADE;


-- Create 'users' table to store user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')), -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'suricata_events' table to store all Suricata logs
CREATE TABLE suricata_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    event_type VARCHAR(50),
    src_ip INET,
    dest_ip INET,
    dest_port INT,
    http JSONB,
    tls JSONB,
    dns JSONB,
    alert JSONB,
    is_analyzed BOOLEAN DEFAULT FALSE
);

-- Create 'threats' table to store detected threats
CREATE TABLE threats (
    id SERIAL PRIMARY KEY,
    description TEXT,
    severity VARCHAR(20),
    timestamp TIMESTAMP,
    source_ip INET,
    source_port INT,
    destination_ip INET,
    destination_port INT,
    event_type VARCHAR(50),
    related_event_id INT REFERENCES suricata_events(id) ON DELETE SET NULL
);

-- Create 'alerts' table to store alert data
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    threat_id INT REFERENCES threats(id) ON DELETE CASCADE, -- Link to threats table
    alert_message TEXT NOT NULL,
    alert_level VARCHAR(10) NOT NULL CHECK (alert_level IN ('low', 'medium', 'high')), -- e.g., "low", "medium", "high"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'vulnerabilities' table
CREATE TABLE vulnerabilities (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Detected', 'Assessed', 'Resolved')),
    host_ip INET,
    port INT,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'incidents' table
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Escalated')),
    assigned_to VARCHAR(100),
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_event_id INTEGER REFERENCES suricata_events(id),
    source_ip VARCHAR(255)
);

-- Create 'uploaded_files' table to store uploaded file information
CREATE TABLE uploaded_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size BIGINT,
    hash VARCHAR(64) NOT NULL, -- SHA-256 hash
    analysis_result TEXT,
    alert BOOLEAN DEFAULT FALSE
);

-- Create 'system_metrics' table to store time-series system metrics
CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'fim_baseline' table for File Integrity Monitoring
CREATE TABLE fim_baseline (
    id SERIAL PRIMARY KEY,
    file_path TEXT UNIQUE NOT NULL,
    hash VARCHAR(64) NOT NULL,
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'malware_hash_registry' table for known malware hashes
CREATE TABLE malware_hash_registry (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash
    malware_name TEXT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Add indexes for faster lookups
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_threats_timestamp ON threats (timestamp);
CREATE INDEX idx_alerts_created_at ON alerts (created_at);
CREATE INDEX idx_uploaded_files_hash ON uploaded_files (hash);
CREATE INDEX idx_suricata_events_event_type ON suricata_events (event_type);
CREATE INDEX idx_suricata_events_timestamp ON suricata_events (timestamp);
CREATE INDEX idx_suricata_events_alert ON suricata_events USING GIN (alert);
CREATE INDEX idx_system_metrics_type_time ON system_metrics (metric_type, timestamp);
CREATE INDEX idx_vulnerabilities_status ON vulnerabilities (status);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities (severity);
CREATE INDEX idx_incidents_status ON incidents (status);
CREATE INDEX idx_incidents_severity ON incidents (severity);
CREATE INDEX idx_malware_hash_registry_hash ON malware_hash_registry (hash);
