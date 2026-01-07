import numpy as np
from sklearn.linear_model import LinearRegression

def forecast_resource_usage(history):
    """
    Forecasts resource usage for the next 24 hours based on historical data.

    Args:
        history (list): A list of dictionaries with 'timestamp' and 'value'.
                        Example: [{'timestamp': 1700000000, 'value': 45.5}, ...]

    Returns:
        list: Forecasted values for the next 24 hours (hourly intervals).
    """
    if not history or len(history) < 2:
        return []

    # Prepare data for regression
    # X = timestamps (converted to hours from start to normalize), y = values
    start_time = history[0]['timestamp']
    X = np.array([(h['timestamp'] - start_time) / 3600 for h in history]).reshape(-1, 1)
    y = np.array([h['value'] for h in history])

    model = LinearRegression()
    model.fit(X, y)

    # Forecast next 24 hours
    last_hour = X[-1][0]
    future_X = np.array([[last_hour + i] for i in range(1, 25)])
    future_y = model.predict(future_X)

    forecast = []
    for i, val in enumerate(future_y):
        # Clamp values between 0 and 100 for percentages
        clamped_val = max(0, min(100, val))
        forecast.append({
            'timestamp': start_time + int((last_hour + i + 1) * 3600),
            'value': round(clamped_val, 2)
        })

    return forecast
