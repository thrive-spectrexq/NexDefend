# Use the official Python slim image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only the requirements.txt first to leverage Docker caching
COPY nexdefend-ai/requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY nexdefend-ai/ ./

# Command to run the application
CMD ["python", "app.py"]
