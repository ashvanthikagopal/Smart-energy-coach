# Smart Energy Coach

Smart Energy Coach is a smart-home energy management application that uses simulated IoT readings to monitor appliance usage, calculate energy consumption, estimate costs, identify anomalies, predict monthly bills, and provide energy-saving recommendations.

## Features

- Live dashboard with current power, daily energy, estimated cost, and alerts
- Appliance list with `ON`/`OFF` status controls
- Seven-day energy trends and appliance-level consumption charts
- Monthly bill prediction based on recent energy usage
- Anomaly detection for unusual appliance behavior
- Personalized recommendations based on appliance usage
- REST API documentation through FastAPI and OpenAPI

## Tech Stack

- **Frontend:** React 19, Vite, Axios, Recharts
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Database:** MySQL through PyMySQL
- **Analysis:** Pandas, NumPy, and scikit-learn

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Energy, prediction, anomaly, and recommendation logic
│   │   ├── simulator/     # Simulated IoT and historical data tools
│   │   ├── database.py
│   │   ├── models.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/api.js
│   └── package.json
└── README.md
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer and npm
- MySQL 8 or newer

Create a MySQL database for the application before starting the backend. Then create `backend/.env` with a SQLAlchemy connection string:

```env
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/smart_energy
```

Do not commit `.env` files or database credentials.

## Backend Setup

From the repository root, create and activate a virtual environment:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the API from the repository root so the `app` package resolves correctly:

```powershell
cd ..
python -m uvicorn backend.app.main:app --reload --port 8000
```

The API is available at `http://127.0.0.1:8000`. Interactive documentation is available at:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Frontend Setup

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Available frontend routes:

- `/` - Dashboard
- `/analytics` - Energy analytics
- `/predictions` - Bill predictions
- `/recommendations` - Energy recommendations

The frontend expects the backend at `http://127.0.0.1:8000`. Start the backend first so the dashboard can load data.

## API Endpoints

| Area | Endpoint | Purpose |
| --- | --- | --- |
| Dashboard | `GET /dashboard/` | Return dashboard summary data |
| Appliances | `GET /appliances/` | List appliances |
| Appliances | `GET /appliances/{id}` | Get one appliance |
| Appliances | `PUT /appliances/{id}/status` | Set appliance status to `ON` or `OFF` |
| Sensors | `POST /sensors/` | Store a sensor reading |
| Energy | `GET /energy/today` | Calculate today's energy and cost |
| Energy | `GET /energy/daily` | Return recent daily energy data |
| Energy | `GET /energy/appliances` | Return energy grouped by appliance |
| AI | `GET /ai/bill-prediction` | Predict monthly energy use and bill |
| AI | `GET /ai/recommendations` | Generate energy-saving recommendations |
| AI | `GET /ai/anomalies` | Detect unusual readings |
| AI | `GET /ai/alerts` | Return energy alerts |

Example appliance status update:

```powershell
Invoke-RestMethod `
	-Method Put `
	-Uri http://127.0.0.1:8000/appliances/1/status `
	-ContentType "application/json" `
	-Body '{"status":"OFF"}'
```

## Development Commands

Frontend checks and production build:

```powershell
cd frontend
npm run lint
npm run build
```

Backend API checks can be performed through `/docs` or with a client such as `curl` or PowerShell after the database is configured.

## Troubleshooting

- **Database connection errors:** Confirm MySQL is running, the database exists, and `DATABASE_URL` is correct.
- **Frontend shows "Unable to connect to backend":** Confirm Uvicorn is running on port `8000`.
- **Empty charts or recommendations:** Add sensor readings to the database through `POST /sensors/` or run the simulator tools.
- **PowerShell blocks virtual-environment activation:** Run `Set-ExecutionPolicy -Scope Process Bypass` for the current terminal session, then activate the environment again.
