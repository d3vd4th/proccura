FROM python:3.12-slim

WORKDIR /app

# Install system deps for psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements (strip the git editable install line)
COPY requirements.txt /tmp/requirements.txt
RUN grep -v "^-e git+" /tmp/requirements.txt > /tmp/filtered-requirements.txt \
    && pip install --no-cache-dir -r /tmp/filtered-requirements.txt \
    && rm /tmp/requirements.txt /tmp/filtered-requirements.txt

# Copy application code
COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
