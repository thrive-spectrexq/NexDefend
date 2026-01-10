#!/bin/bash
# NexDefend Offline Installer

echo "🛡️  Installing NexDefend Enterprise..."

# 1. Load Images
if [ -f "images.tar.gz" ]; then
    echo "⏳ Loading Docker images..."
    docker load < images.tar.gz
else
    echo "❌ Error: images.tar.gz not found."
    exit 1
fi

# 2. Start Services
echo "🚀 Starting Services..."
docker-compose up -d

echo "----------------------------------------"
echo "✅ Installation Complete"
echo "🌐 Access NexDefend at: http://localhost"
echo "----------------------------------------"
