
# Lightweight image for FastAPI app
FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN pip install --no-cache-dir --upgrade pip

# Copy and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY . .

EXPOSE 8080
CMD ["python","main.py"]
