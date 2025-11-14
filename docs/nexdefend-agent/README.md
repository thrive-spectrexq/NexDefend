# NexDefend Agent

The NexDefend Agent is a lightweight, cross-platform agent that provides deep endpoint visibility. It streams security-relevant events to the Kafka pipeline.

## Features

-   **Cross-Platform Support**: The agent is designed to run on both Linux and macOS environments.
-   **Process Monitoring**: Captures process creation events, including PID, name, and command line arguments.
-   **File Integrity Monitoring (FIM)**: Uses `fsnotify` to monitor critical files and directories (e.g., `/etc`) for unauthorized changes.
-   **Network Connection Monitoring**: Tracks new network connections, linking them to specific processes.
