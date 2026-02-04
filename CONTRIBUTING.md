# Contributing to NexDefend

We welcome contributions! Please follow these guidelines to ensure a smooth process.

## Getting Started

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/your-username/NexDefend.git`
3. Copy `.env.example` to `.env` and configure it.

## Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Implement your changes.
3. **Verify your work**:
    - Go: `go vet ./internal/...` and `go test ./internal/...`
    - Python: `pytest nexdefend-ai`
4. Commit with descriptive messages.
5. Push to your fork and submit a Pull Request.

## Coding Standards

- **Go**: Use standard formatting (`go fmt`).
- **Python**: PEP 8 compliance.
- **Security**:
    - Validate all inputs (use Pydantic for Python, Validator for Go).
    - Sanitize logs (no PII).
    - Use timeouts for external calls.

## Reporting Issues

Use the GitHub Issues tracker to report bugs or request features.
