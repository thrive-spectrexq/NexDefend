#!/bin/bash
set -e

VERSION="v1.0.0"
echo "--- NexDefend Enterprise Builder ($VERSION) ---"

# 1. Build the Unified Core Image (Go + Python + Tools)
echo "[1/3] Building Core Image..."
docker build -t nexdefend/core:$VERSION .

# 2. Build the Frontend Image
echo "[2/3] Building Frontend Image..."
cd nexdefend-frontend
docker build -t nexdefend/frontend:$VERSION -f Dockerfile.prod .
cd ..

# 3. Pull Dependency Images (Postgres, Kafka, OpenSearch)
echo "[3/3] Pulling Dependencies..."
docker pull postgres:15-alpine
docker pull bitnami/kafka:latest
docker pull opensearchproject/opensearch:latest

# 4. Package for Offline Use
echo "--- Packaging for Offline Deployment ---"
mkdir -p release/images

# Save all images into one tarball (or separate ones)
echo "Saving Docker images (this may take a while)..."
docker save \
    nexdefend/core:$VERSION \
    nexdefend/frontend:$VERSION \
    postgres:15-alpine \
    bitnami/kafka:latest \
    opensearchproject/opensearch:latest \
    | gzip > release/images/nexdefend-offline-bundle.tar.gz

# Copy deployment configs
cp docker-compose.prod.yml release/docker-compose.yml
cp install.sh release/install.sh
chmod +x release/install.sh

echo "✅ Build Complete! Installer located in 'release/' folder."
