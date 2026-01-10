#!/bin/bash
VERSION=${1:-"1.0.0"}
BUNDLE_DIR="nexdefend_installer"

echo "🚀 Building NexDefend Enterprise v${VERSION}..."

mkdir -p $BUNDLE_DIR/configs
mkdir -p $BUNDLE_DIR/database

# 1. Build Production Images
echo "🔨 Building API..."
docker build -t nexdefend-api:latest -f Dockerfile .

echo "🔨 Building Frontend (Production)..."
# Note: Using Dockerfile.prod here!
docker build -t nexdefend-frontend:latest -f nexdefend-frontend/Dockerfile.prod nexdefend-frontend/

echo "🔨 Building AI Service..."
docker build -t nexdefend-ai:latest -f nexdefend-ai/Dockerfile nexdefend-ai/

# 2. Pull Infrastructure Images
echo "⬇️  Pulling dependencies..."
docker pull postgres:15-alpine
docker pull jasonish/suricata:latest
docker pull opensearchproject/opensearch:latest
docker pull otel/opentelemetry-collector:0.87.0

# 3. Save Images to Archive
echo "💾 Saving images to offline archive..."
docker save \
    nexdefend-api:latest \
    nexdefend-frontend:latest \
    nexdefend-ai:latest \
    postgres:15-alpine \
    jasonish/suricata:latest \
    opensearchproject/opensearch:latest \
    otel/opentelemetry-collector:0.87.0 \
    | gzip > $BUNDLE_DIR/images.tar.gz

# 4. Copy Configs & Scripts
echo "📂 Copying configurations..."
cp docker-compose.prod.yml $BUNDLE_DIR/docker-compose.yml
cp database/init.sql $BUNDLE_DIR/database/
cp otel-collector-config.yaml $BUNDLE_DIR/configs/
cp sample_eve.json $BUNDLE_DIR/configs/
cp install.sh $BUNDLE_DIR/
cp install.ps1 $BUNDLE_DIR/

# 5. Compress Final Bundle
echo "📦 Finalizing Bundle..."
tar -czf nexdefend-enterprise-v${VERSION}.tar.gz $BUNDLE_DIR
rm -rf $BUNDLE_DIR

echo "✅ DONE! Artifact: nexdefend-enterprise-v${VERSION}.tar.gz"
