#!/bin/sh

# Start the background worker
python background_worker.py &

# Start the API server
python api.py
