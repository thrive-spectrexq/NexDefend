#!/bin/bash
echo "--- Starting NexDefend Monolith ---"

# 1. Start ZincSearch (Background)
# Zinc typically listens on 4080 by default config, but we ensure env vars are set
echo "Starting Search Engine..."
DATA_PATH=/data/zinc /usr/local/bin/zincsearch &
sleep 5

# 2. Start Python AI Engine (Background)
# Python API listens on 5000
echo "Starting AI API..."
cd /app/nexdefend-ai
python api.py &

# 3. Start SOAR Engine (Background)
# FIX: Force SOAR to use port 8081 instead of inheriting Render's PORT=8080
echo "Starting SOAR Engine..."
PORT=8081 /nexdefend-soar-bin &

# 4. Start Go Backend (Foreground)
# Core API listens on 8080
echo "Starting Core API..."
cd /app
/nexdefend
