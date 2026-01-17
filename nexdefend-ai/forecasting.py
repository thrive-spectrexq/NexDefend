import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import logging
import data_ingestion

def generate_forecast(metric_type="cpu_load", hours_ahead=24):
    """
    Fetches historical data for a metric and predicts future values.
    Returns a list of dicts: [{'timestamp': '...', 'value': 55.2}, ...]
    """
    logging.info(f"Generating forecast for metric: {metric_type}")

    # 1. Fetch Historical Data from Unified DB
    # We fetch the last 7 days of data to train the model
    query = """
        SELECT timestamp, value
        FROM system_metrics
        WHERE metric_type = ?
        AND timestamp >= datetime('now', '-7 days')
        ORDER BY timestamp ASC
    """

    # Adjust for PostgreSQL syntax if needed (data_ingestion handles ? vs %s replacement,
    # but specific date functions might differ. This uses SQLite syntax 'datetime'.
    # For Postgres, we might need a slight tweak or assume the simple standard SQL works.)
    if data_ingestion.DB_TYPE == "postgres":
        query = """
            SELECT timestamp, value
            FROM system_metrics
            WHERE metric_type = ?
            AND timestamp >= NOW() - INTERVAL '7 days'
            ORDER BY timestamp ASC
        """

    raw_data = data_ingestion.execute_query(query, (metric_type,))

    if not raw_data or len(raw_data) < 10:
        logging.warning(f"Insufficient data for {metric_type}: {len(raw_data) if raw_data else 0} rows")
        return {"error": "Not enough historical data to generate a forecast."}

    try:
        # 2. Prepare Dataframe
        df = pd.DataFrame(raw_data)
        # Ensure timestamp is datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'])

        # Convert timestamp to numeric (ordinal) for Regression
        # We start from the first timestamp to keep numbers smaller/stable
        start_time = df['timestamp'].iloc[0]
        df['hours_since_start'] = (df['timestamp'] - start_time) / pd.Timedelta(hours=1)

        # 3. Train Model
        X = df[['hours_since_start']].values
        y = df['value'].values

        model = LinearRegression()
        model.fit(X, y)

        # 4. Predict Future
        future_points = []
        last_real_time = df['timestamp'].iloc[-1]
        last_real_hour = df['hours_since_start'].iloc[-1]

        for i in range(1, hours_ahead + 1):
            future_hour_val = last_real_hour + i
            future_time = last_real_time + timedelta(hours=i)

            # Predict
            predicted_val = model.predict([[future_hour_val]])[0]

            # Clamp values (e.g. CPU % cannot be > 100 or < 0)
            predicted_val = max(0, min(100, predicted_val))

            future_points.append({
                "timestamp": future_time.isoformat(),
                "value": round(predicted_val, 2),
                "is_prediction": True
            })

        return future_points

    except Exception as e:
        logging.error(f"Forecasting calculation error: {e}")
        return {"error": "Failed during forecast calculation"}
