# NexDefend SOAR

The NexDefend SOAR (Security Orchestration, Automation, and Response) service is a Go-based service that consumes from the `incidents` Kafka topic.

## Features

-   **Automated SOAR Playbooks**: The SOAR service runs automated response playbooks based on the `playbooks.yml` file.
-   **Incident-Driven Response**: When a "High" or "Critical" incident is detected, the SOAR service automatically triggers a playbook, such as initiating an Nmap scan on the incident's source IP.
