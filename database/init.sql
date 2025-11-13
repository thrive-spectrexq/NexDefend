-- Initialize the database schema for NexDefend

-- Drop tables if they already exist
DROP TABLE IF EXISTS dashboards CASCADE;
DROP TABLE IF EXISTS case_artifacts CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS soar_playbooks CASCADE;
DROP TABLE IF EXISTS entity_risk_scores CASCADE;
DROP TABLE IF EXISTS user_audit_log CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
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
DROP TABLE IF EXISTS agent_configs CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

-- Create 'organizations' table for multi-tenancy
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'roles' table for RBAC
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create 'users' table to store user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'user_roles' linking table for RBAC
CREATE TABLE user_roles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create 'assets' table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(255),
    os_version VARCHAR(255),
    mac_address VARCHAR(255),
    agent_version VARCHAR(50),
    status VARCHAR(50),
    last_heartbeat TIMESTAMP,
    criticality VARCHAR(50),
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'agent_configs' table
CREATE TABLE agent_configs (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
    config_jsonb JSONB,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
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
    is_analyzed BOOLEAN DEFAULT FALSE,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
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
    related_event_id INT REFERENCES suricata_events(id) ON DELETE SET NULL,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'alerts' table to store alert data
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    threat_id INT REFERENCES threats(id) ON DELETE CASCADE,
    alert_message TEXT NOT NULL,
    alert_level VARCHAR(10) NOT NULL CHECK (alert_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
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
    source_ip VARCHAR(255),
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
    parent_incident_id INT REFERENCES incidents(id) ON DELETE SET NULL,
    mitre_ttp_id VARCHAR(20),
    risk_score INT,
    entity_name VARCHAR(255),
    disposition VARCHAR(50)
);

-- Create 'uploaded_files' table to store uploaded file information
CREATE TABLE uploaded_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size BIGINT,
    hash VARCHAR(64) NOT NULL,
    analysis_result TEXT,
    alert BOOLEAN DEFAULT FALSE,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'system_metrics' table to store time-series system metrics
CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'fim_baseline' table for File Integrity Monitoring
CREATE TABLE fim_baseline (
    id SERIAL PRIMARY KEY,
    file_path TEXT UNIQUE NOT NULL,
    hash VARCHAR(64) NOT NULL,
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'malware_hash_registry' table for known malware hashes
CREATE TABLE malware_hash_registry (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(64) UNIQUE NOT NULL,
    malware_name TEXT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'user_audit_log' table
CREATE TABLE user_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details_json JSONB,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'entity_risk_scores' table for UEBA
CREATE TABLE entity_risk_scores (
    id SERIAL PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reasoning_jsonb JSONB,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE(entity_id, entity_type, organization_id)
);

-- Create 'soar_playbooks' table
CREATE TABLE soar_playbooks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trigger_conditions_json JSONB NOT NULL,
    steps_yaml TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'cases' table for case management
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    assignee_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'case_artifacts' linking table
CREATE TABLE case_artifacts (
    id SERIAL PRIMARY KEY,
    case_id INT REFERENCES cases(id) ON DELETE CASCADE,
    artifact_type VARCHAR(50) NOT NULL,
    artifact_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create 'dashboards' table for customizable dashboards
CREATE TABLE dashboards (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    layout_jsonb JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    organization_id INT REFERENCES organizations(id) ON DELETE CASCADE
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
CREATE INDEX idx_user_audit_log_user_id ON user_audit_log (user_id);
CREATE INDEX idx_user_audit_log_timestamp ON user_audit_log (timestamp);
CREATE INDEX idx_entity_risk_scores_entity ON entity_risk_scores (entity_id, entity_type);
CREATE INDEX idx_cases_assignee_id ON cases (assignee_id);
CREATE INDEX idx_case_artifacts_case_id ON case_artifacts (case_id);
CREATE INDEX idx_dashboards_user_id ON dashboards (user_id);
CREATE INDEX idx_assets_hostname ON assets (hostname);
CREATE INDEX idx_agent_configs_asset_id ON agent_configs (asset_id);
