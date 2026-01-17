import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import data_ingestion

def generate_forecast(metric_type="cpu_load", hours_ahead=24):
    """
    Fetches historical data for a metric and predicts future values.
    Returns a list of dicts: [{'timestamp': '...', 'value': 55.2}, ...]
    """
    print(f"Generating forecast for {metric_type}...")

    # 1. Fetch Historical Data from DB (Last 7 Days)
    # Using the unified DB connector we built in Phase 1
    query = """
        SELECT timestamp, value
        FROM system_metrics
        WHERE metric_type = ?
        ORDER BY timestamp ASC
    """

    # Check DB_TYPE to adjust query if needed (data_ingestion handles ? vs %s)
    raw_data = data_ingestion.execute_query(query, (metric_type,))

    if not raw_data or len(raw_data) < 10:
        return {"error": "Not enough data to forecast"}

    # 2. Prepare Dataframe
    df = pd.DataFrame(raw_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Convert timestamp to numeric (ordinal) for Regression
    df['time_ordinal'] = df['timestamp'].map(datetime.toordinal)

    # 3. Train Model
    X = df[['time_ordinal']].values # Features
    y = df['value'].values          # Target

    model = LinearRegression()
    model.fit(X, y)

    # 4. Predict Future
    future_points = []
    last_time = df['timestamp'].iloc[-1]

    for i in range(1, hours_ahead + 1):
        future_time = last_time + timedelta(hours=i)
        future_ordinal = np.array([[future_time.toordinal()]])

        predicted_value = model.predict(future_ordinal)[0]

        # Clamp values (CPU can't be < 0 or > 100)
        predicted_value = max(0, min(100, predicted_value))

        future_points.append({
            "timestamp": future_time.isoformat(),
            "value": round(predicted_value, 2),
            "is_prediction": True
        })

    return future_points
