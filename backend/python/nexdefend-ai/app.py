import logging

import requests  # Import requests to make HTTP requests
from flask import Flask, jsonify, request
from scanner import scan_open_ports  # Import the scanner function
from threat_model import detect_threat

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)

# URL to access the Go backend threat detection service
GO_BACKEND_URL = "http://api:8080/api/v1/threats"


@app.route("/detect", methods=["POST"])
def detect_threat_api():
    data = request.json
    features = data.get("features", [])

    # Validate input
    if not features:
        return jsonify({"error": "Invalid input"}), 400

    try:
        # Forward the request to the Go backend
        response = requests.post(GO_BACKEND_URL, json={"features": features})

        # Check if the request to the Go backend was successful
        if response.status_code == 200:
            result = response.json()
            logging.info(f"Threat detection result from Go backend: {result}")
            return jsonify(result)
        else:
            logging.error(
                f"Go backend returned an error: {response.status_code} {response.text}"
            )
            return (
                jsonify({"error": "Error from backend service"}),
                response.status_code,
            )
    except Exception as e:
        logging.error(f"Error during threat detection: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/scan", methods=["POST"])
def scan_ports():
    data = request.json
    ip_address = data.get("ip_address")
    port_range = data.get("port_range", "1-1024")  # Default to scanning ports 1-1024

    # Validate input
    if not ip_address:
        return jsonify({"error": "IP address is required"}), 400

    try:
        open_ports = scan_open_ports(ip_address, port_range)
        logging.info(f"Open ports on {ip_address}: {open_ports}")
        return jsonify({"open_ports": open_ports})
    except Exception as e:
        logging.error(f"Error during port scan: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
