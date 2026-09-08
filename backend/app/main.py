from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import appliances
from .routers import sensors
from .routers import energy
from .routers import dashboard
from .routers import predictions


app = FastAPI(
    title="Smart Energy Coach",
    description="AI powered smart energy management system",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


app.include_router(
    appliances.router
)

app.include_router(
    sensors.router
)

app.include_router(
    energy.router
)
app.include_router(
    dashboard.router
)
app.include_router(predictions.router)


@app.get("/")
def root():

    return {
        "message":
        "Smart Energy Coach API is running"
    }