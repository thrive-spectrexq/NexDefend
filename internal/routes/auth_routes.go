package routes

// This file is intentionally left empty.
// All auth handler logic (RegisterHandler, LoginHandler) has been
// consolidated into internal/auth/auth.go and is wired
// into the main router in internal/routes/routes.go.
// This file is kept to prevent "package routes" declaration errors
// but its contents are removed to fix build-time redeclaration conflicts.
