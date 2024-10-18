import logging

from flask import Flask, jsonify, request
from threat_model import detect_threat

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)


@app.route("/detect", methods=["POST"])
def detect_threat_api():
    data = request.json
    features = data.get("features", [])

    if not features:
        return jsonify({"error": "Invalid input"}), 400

    try:
        result = detect_threat(features)
        response = {"threat_detected": result, "severity": "high" if result else "low"}
        logging.info(f"Threat detection result: {response}")
        return jsonify(response)
    except Exception as e:
        logging.error(f"Error during threat detection: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
