#!/bin/bash
echo "--- Starting NexDefend Monolith ---"

# 1. Start ZincSearch (Background)
echo "Starting Search Engine..."
DATA_PATH=/data/zinc /usr/local/bin/zincsearch &
sleep 5

# 2. Start Python AI Engine (Background)
echo "Starting AI API..."
cd /app/nexdefend-ai
python api.py &

# 3. Start SOAR Engine (Background)
echo "Starting SOAR Engine..."
/nexdefend-soar-bin &

# 4. Start Go Backend (Foreground)
echo "Starting Core API..."
cd /app
/nexdefend
