# API Documentation

This document provides a detailed overview of the NexDefend API endpoints.

## Authentication

Authentication is handled via JWT. The following public endpoints are available for authentication:

-   `POST /register`: Register a new user.
-   `POST /login`: Log in an existing user.

## API v1 (Authenticated)

All API v1 endpoints are prefixed with `/api/v1` and require a valid JWT token in the `Authorization` header.

### Events

-   `GET /events`: Get a list of events.

### Agents

-   `POST /agents/enroll`: Enroll a new agent.
-   `GET /agent/config/{hostname}`: Get the configuration for a specific agent.

### Threat Intelligence Platform (TIP)

-   `POST /tip/check`: Check an Indicator of Compromise (IOC).

### Enrichment

-   `GET /enrichment/users/{username}`: Get user information from Active Directory.
-   `GET /enrichment/assets/{hostname}`: Get enriched asset information from ServiceNow.

### Case Management

-   `POST /cases`: Create a new case.

### Incident Management

-   `POST /incidents`: Create a new incident.
-   `GET /incidents`: Get a list of incidents.
-   `GET /incidents/{id}`: Get a specific incident by ID.
-   `PUT /incidents/{id}`: Update a specific incident by ID.

### Vulnerability Management

-   `POST /vulnerabilities`: Create a new vulnerability.
-   `GET /vulnerabilities`: Get a list of vulnerabilities.
-   `GET /vulnerabilities/{id}`: Get a specific vulnerability by ID.
-   `PUT /vulnerabilities/{id}`: Update a specific vulnerability by ID.

### Asset Management

-   `POST /assets`: Create a new asset.
-   `GET /assets`: Get a list of assets.
-   `GET /assets/{id}`: Get a specific asset by ID.
-   `PUT /assets/{id}`: Update a specific asset by ID.
-   `DELETE /assets/{id}`: Delete a specific asset by ID.
-   `POST /assets/heartbeat`: Send a heartbeat from an asset.

### File Upload & Analysis

-   `POST /upload`: Upload a file for analysis.

### Compliance & Reporting

-   `GET /audit`: Get audit logs.
-   `GET /reports/compliance`: Generate a compliance report.

### System Metrics

-   `GET /metrics`: Get system metrics.

### Python API Integration

-   `GET /python-analysis`: Get analysis from the Python API.
-   `GET /python-anomalies`: Get anomalies from the Python API.

### Cloud Credentials

-   `POST /cloud-credentials`: Create new cloud credentials.

### Admin

-   `POST /scan`: Initiate a scan.
