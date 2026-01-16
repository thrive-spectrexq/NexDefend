#!/bin/bash

echo "--- Starting NexDefend Monolith ---"

# 1. Start ZincSearch (Background)
echo "Starting Search Engine (Zinc)..."
DATA_PATH=/data/zinc /usr/local/bin/zincsearch &
sleep 5 # Give it a moment to initialize

# 2. Start Python AI Service (Background)
echo "Starting AI Engine..."
cd /app/nexdefend-ai
# Run Flask app (using gunicorn or direct python for demo)
python api.py &

# 3. Start Go Backend (Foreground)
echo "Starting Core API..."
cd /app
/nexdefend
