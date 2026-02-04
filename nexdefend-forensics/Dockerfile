FROM python:3.9-slim

WORKDIR /app

# Install dependencies for pytsk3 (sleuthkit)
RUN apt-get update && apt-get install -y \
    libtsk-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
