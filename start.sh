#!/bin/bash
echo "--- Starting NexDefend Monolith ---"

# 1. Start ZincSearch (Background)
echo "Starting Search Engine..."
DATA_PATH=/data/zinc /usr/local/bin/zincsearch &
sleep 5

# 2. Start Python AI Engine (Background)
# Note: We do NOT run background_worker.py because we don't have Kafka.
# We only run api.py which is triggered by the Go backend.
echo "Starting AI API..."
cd /app/nexdefend-ai
python api.py &

# 3. Start Go Backend (Foreground)
echo "Starting Core API..."
cd /app
/nexdefend
