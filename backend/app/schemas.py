from pydantic import BaseModel


class SensorDataCreate(BaseModel):

    appliance_id: int

    temperature: float

    humidity: float

    occupancy: int

    power_kw: float

    voltage: float

    current_amp: float