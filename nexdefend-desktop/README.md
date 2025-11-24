# NexDefend Desktop

This is the standalone desktop version of the NexDefend platform, built with [Wails](https://wails.io). It packages the Frontend and a simplified "Lite" version of the Backend into a single installable binary.

## Prerequisites

*   **Go** 1.21+
*   **Node.js** 16+
*   **Wails CLI**: Install with `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

## Installation

1.  Clone the repository.
2.  Navigate to this directory:
    ```bash
    cd nexdefend-desktop
    ```
3.  Install frontend dependencies:
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## Development

To run the app in development mode (with hot reload):

```bash
wails dev
```

This will start the Go backend and the Vite frontend dev server.

## Building for Production

To build a standalone binary (exe/app/dmg):

```bash
wails build
```

The output binary will be located in `build/bin/`.

## Architecture "Lite"

Unlike the full cloud platform, this desktop app uses embedded replacements for heavy infrastructure:

*   **Database**: SQLite (replaces PostgreSQL)
*   **Messaging**: Internal Go Channels (replaces Kafka)
*   **Search**: Simple SQL queries (replaces OpenSearch)
*   **Agent**: Runs as an internal goroutine (replaces standalone binary)
