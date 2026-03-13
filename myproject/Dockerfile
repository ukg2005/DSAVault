# Backend Dockerfile
# Builds the Django application and serves it with Gunicorn.

FROM python:3.13-slim

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (separate layer for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source
COPY . .

# Collect static files so Whitenoise can serve them
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Run database migrations then start Gunicorn.
# Using sh -c so migrations always run on container start.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120"]
