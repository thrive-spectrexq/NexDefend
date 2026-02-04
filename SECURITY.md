# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities to security@nexdefend.example.com.
We aim to acknowledge within 24 hours and provide a fix within 7 days.

## Development Security Guidelines

- **Secrets**: Never commit secrets to the repository. Use environment variables.
- **Dependencies**: Keep dependencies updated. We use Dependabot.
- **Code**: All code must pass static analysis (go vet, pylint).
- **Subprocesses**: Use `subprocess` with `shell=False` and validated arguments.
