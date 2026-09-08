from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Numeric
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy import Text

from sqlalchemy.sql import func

from .database import Base


class Appliance(Base):

    __tablename__ = "appliances"


    id = Column(
        Integer,
        primary_key=True
    )


    name = Column(
        String(100),
        nullable=False
    )


    category = Column(
        String(50)
    )


    rated_power_kw = Column(
        Numeric(10, 3)
    )


    status = Column(
        String(10),
        default="OFF"
    )


    created_at = Column(
        DateTime,
        server_default=func.now()
    )


class SensorData(Base):

    __tablename__ = "sensor_data"


    id = Column(
        Integer,
        primary_key=True
    )


    appliance_id = Column(
        Integer,
        ForeignKey("appliances.id"),
        nullable=False
    )


    temperature = Column(
        Numeric(5, 2)
    )


    humidity = Column(
        Numeric(5, 2)
    )


    occupancy = Column(
        Integer
    )


    power_kw = Column(
        Numeric(10, 3)
    )


    voltage = Column(
        Numeric(10, 2)
    )


    current_amp = Column(
        Numeric(10, 2)
    )


    recorded_at = Column(
        DateTime,
        server_default=func.now()
    )