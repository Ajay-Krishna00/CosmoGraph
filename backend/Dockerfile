# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

RUN pip install --upgrade pip

# Install PyTorch CPU version first using the correct index URL
RUN pip install --no-cache-dir torch==2.8.0 --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose port 8080 (required by Cloud Run)
EXPOSE 8080

# Start the FastAPI app with uvicorn
CMD uvicorn main:app --host 0.0.0.0 --port $PORT