# Supermarket AI Backend

This is the backend for the **Supermarket AI** project, providing a robust, modular foundation for upcoming APIs.

## Technology Stack

- **Python 3.12+**
- **FastAPI** (Web framework)
- **Uvicorn** (ASGI server)
- **Pydantic** (Data validation & Settings)
- **SQLAlchemy & Alembic** (ORM and Migrations)
- **PostgreSQL** (Database)
- **python-dotenv** (Environment variables)

## Folder Structure

```
backend/
├── app/                  # Main application code
│   ├── api/              # API routers and endpoints (e.g. v1)
│   ├── core/             # Core configurations (e.g. settings)
│   ├── database/         # Database connection and sessions
│   ├── models/           # SQLAlchemy models (tables)
│   ├── schemas/          # Pydantic schemas for request/response
│   ├── services/         # Business logic
│   ├── agents/           # AI agents logic
│   ├── ml/               # Machine learning models
│   └── main.py           # FastAPI application initialization
├── tests/                # Test suite
├── .env.example          # Example environment variables
└── requirements.txt      # Python dependencies
```

## Setup & Configuration

1. **Install dependencies**:
   Ensure you have Python 3.12+ installed.
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your `DATABASE_URL` and `CORS_ORIGINS`.

## Running the Server

Start the development server using Uvicorn:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Endpoints

- **Health Check**: `GET /api/v1/health`

## API Structure

Currently implemented modules:
- `/api/v1/categories` - Product categories management
- `/api/v1/products` - Core product catalog
- `/api/v1/inventory` - Stock tracking and inventory adjustments
- `/api/v1/sales` - Point of sale and transaction handling
- `/api/v1/suppliers` - Supplier management and performance tracking
- `/api/v1/purchase-orders` - Purchase order lifecycle and inventory receiving

Pending modules:
- `/forecasts`
- `/ai-insights`
