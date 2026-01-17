from flask import Flask, request, jsonify
from llm_handler import llm_agent
from forecasting import generate_forecast
from advanced_threat_detection import analyze_process_tree # Assuming existing logic
import os
import logging
import time
from prometheus_client import Counter, make_wsgi_app, Histogram
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from flask_cors import CORS

app = Flask(__name__)

# Basic Metrics Setup
app.wsgi_app = DispatcherMiddleware(app.wsgi_app, { '/metrics': make_wsgi_app() })
CORS(app)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "nexdefend-ai"})

# --- 1. GenAI Chat Endpoint ---
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_query = data.get('query', '')
    context = data.get('context', None) # e.g., an Alert JSON

    if not user_query:
        return jsonify({"error": "No query provided"}), 400
        
    response_text = llm_agent.generate_response(user_query, context)
    return jsonify({"response": response_text})

# --- 2. Forecasting Endpoint ---
@app.route('/forecast', methods=['GET'])
def forecast():
    metric = request.args.get('metric', 'cpu_load')
    # Use the new generate_forecast from forecasting.py which uses DB
    prediction = generate_forecast(metric)
    return jsonify(prediction)

# --- 3. Threat Analysis (Existing logic placeholder) ---
@app.route('/analyze', methods=['POST'])
def analyze():
    # ... existing ML logic placeholders or calls ...
    return jsonify({"status": "analyzed", "risk_score": 85})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
