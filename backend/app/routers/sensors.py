from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import SensorData
from ..schemas import SensorDataCreate


router = APIRouter(
    prefix="/sensors",
    tags=["Sensors"]
)


@router.post("/")
def create_sensor_data(
    data: SensorDataCreate,
    db: Session = Depends(get_db)
):

    sensor = SensorData(
        appliance_id=data.appliance_id,
        temperature=data.temperature,
        humidity=data.humidity,
        occupancy=data.occupancy,
        power_kw=data.power_kw,
        voltage=data.voltage,
        current_amp=data.current_amp
    )

    db.add(sensor)

    db.commit()

    db.refresh(sensor)

    return {
        "message": "Sensor data stored successfully",
        "sensor_id": sensor.id
    }