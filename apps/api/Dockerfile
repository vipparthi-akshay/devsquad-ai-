FROM python:3.13-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen

COPY . .

EXPOSE 8000

# Bind to the platform-provided port when present (Render/Heroku set $PORT),
# defaulting to 8000 for local docker-compose. Shell form so $PORT expands.
CMD uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
