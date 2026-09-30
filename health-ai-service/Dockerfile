FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for compilation and PostgreSQL client
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code and datasets
COPY . .

# Train models on build/startup if pkl files don't exist
RUN python training/train_intent.py && \
    python training/train_disease.py && \
    python training/train_urgency.py && \
    python training/train_expiry.py && \
    python training/train_forecasting.py

EXPOSE 8000

ENV PORT=8000 \
    HOST=0.0.0.0 \
    ENVIRONMENT=production

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
