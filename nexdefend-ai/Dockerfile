# Use the official Python slim image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# --- NEW: Install nmap ---
# Install system dependencies: nmap
# We update, install, and then clean up apt lists to keep the image slim
RUN apt-get update && \
    apt-get install -y nmap && \
    rm -rf /var/lib/apt/lists/*

# Copy only the requirements.txt first to leverage Docker caching
COPY ./requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY ./ ./

# Command to run the application
CMD ["./start.sh"]
