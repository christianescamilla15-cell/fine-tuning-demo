FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and data
COPY data/ data/
COPY src/ src/

# Prepare data splits
RUN python -m src.prepare_data

# Default: run training (1 epoch for demo)
CMD ["python", "-m", "src.train"]
