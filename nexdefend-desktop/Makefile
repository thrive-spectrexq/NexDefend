# Makefile for NexDefend Desktop (Linux/macOS)

# Use the cross-platform Node.js build script for the frontend
BUILD_CMD=node nexdefend-frontend/build-desktop.js

.PHONY: dev build clean run

# Default target
dev:
	wails dev

# Build the application
build:
	wails build

# Build for Linux explicitly (if running on Linux)
build-linux:
	wails build -platform linux/amd64

# Build for macOS explicitly (if running on macOS)
build-mac:
	wails build -platform darwin/universal

# Clean build artifacts
clean:
	rm -rf build/bin
	rm -rf frontend/dist

# Run the application (after build)
run:
	./build/bin/nexdefend-desktop

# Install dependencies (system level for Linux)
install-deps-linux:
	sudo apt-get update && sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev

# Help
help:
	@echo "NexDefend Desktop Makefile"
	@echo "--------------------------"
	@echo "make dev           - Run in development mode (wails dev)"
	@echo "make build         - Build the application"
	@echo "make build-linux   - Build for Linux"
	@echo "make build-mac     - Build for macOS"
	@echo "make clean         - Clean build artifacts"
	@echo "make install-deps-linux - Install Linux dependencies (Debian/Ubuntu)"
