from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Appliance, SensorData
from ..services.energy_service import (
    calculate_energy,
    calculate_cost
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# -----------------------------------------
# DASHBOARD
# -----------------------------------------

@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # GET ALL APPLIANCES
    # -----------------------------------------

    appliances = (
        db.query(Appliance)
        .order_by(Appliance.id)
        .all()
    )


    # -----------------------------------------
    # CURRENT POWER
    # -----------------------------------------

    latest_records = []

    for appliance in appliances:

        latest = (
            db.query(SensorData)
            .filter(
                SensorData.appliance_id == appliance.id
            )
            .order_by(
                SensorData.recorded_at.desc()
            )
            .first()
        )

        if latest:
            latest_records.append(latest)


    current_power = sum(
        float(record.power_kw or 0)
        for record in latest_records
    )


    # -----------------------------------------
    # TODAY'S ENERGY
    # -----------------------------------------

    now = datetime.now()

    start_of_day = datetime(
        now.year,
        now.month,
        now.day
    )


    # Get today's records
    today_records = (
        db.query(SensorData)
        .filter(
            SensorData.recorded_at >= start_of_day
        )
        .order_by(
            SensorData.appliance_id,
            SensorData.recorded_at
        )
        .all()
    )


    # -----------------------------------------
    # GET PREVIOUS READING
    # -----------------------------------------

    appliance_ids = {
        record.appliance_id
        for record in today_records
    }

    previous_records = []

    for appliance_id in appliance_ids:

        previous = (
            db.query(SensorData)
            .filter(
                SensorData.appliance_id == appliance_id,
                SensorData.recorded_at < start_of_day
            )
            .order_by(
                SensorData.recorded_at.desc()
            )
            .first()
        )

        if previous:
            previous_records.append(previous)


    # Combine previous + today's readings
    all_records = (
        previous_records +
        today_records
    )


    all_records = sorted(
        all_records,
        key=lambda record: (
            record.appliance_id,
            record.recorded_at
        )
    )


    # -----------------------------------------
    # CALCULATE TODAY'S ENERGY
    # -----------------------------------------

    energy_by_appliance = {}

    previous_by_appliance = {}

    for record in all_records:

        appliance_id = record.appliance_id

        if appliance_id not in energy_by_appliance:
            energy_by_appliance[
                appliance_id
            ] = 0.0


        if appliance_id in previous_by_appliance:

            previous = previous_by_appliance[
                appliance_id
            ]

            seconds = (
                record.recorded_at -
                previous.recorded_at
            ).total_seconds()


            # Only calculate reasonable intervals
            if 0 < seconds <= 2 * 60 * 60:

                previous_power = float(
                    previous.power_kw or 0
                )

                current_record_power = float(
                    record.power_kw or 0
                )

                average_power = (
                    previous_power +
                    current_record_power
                ) / 2


                energy = calculate_energy(
                    average_power,
                    seconds
                )


                # Only count energy generated
                # from the start of today
                interval_end = (
                    record.recorded_at
                )

                if interval_end >= start_of_day:

                    energy_by_appliance[
                        appliance_id
                    ] += energy


        previous_by_appliance[
            appliance_id
        ] = record


    # -----------------------------------------
    # TOTAL ENERGY
    # -----------------------------------------

    total_energy = sum(
        energy_by_appliance.values()
    )


    estimated_cost = calculate_cost(
        total_energy
    )


    # -----------------------------------------
    # ACTIVE APPLIANCES
    # -----------------------------------------

    active_appliances = [
        {
            "id": appliance.id,
            "name": appliance.name,
            "category": appliance.category,
            "power_kw": float(
                appliance.rated_power_kw or 0
            )
        }
        for appliance in appliances
        if appliance.status == "ON"
    ]


    # -----------------------------------------
    # HIGHEST CONSUMING APPLIANCE
    # -----------------------------------------

    highest_appliance = None

    if energy_by_appliance:

        highest_id = max(
            energy_by_appliance,
            key=energy_by_appliance.get
        )

        highest_energy = (
            energy_by_appliance[highest_id]
        )


        appliance = (
            db.query(Appliance)
            .filter(
                Appliance.id == highest_id
            )
            .first()
        )


        if appliance:

            highest_appliance = {
                "id": appliance.id,
                "name": appliance.name,
                "energy_kwh": round(
                    highest_energy,
                    3
                ),
                "estimated_cost": round(
                    calculate_cost(
                        highest_energy
                    ),
                    2
                )
            }


    # -----------------------------------------
    # RESPONSE
    # -----------------------------------------

    return {
        "current_power_kw": round(
            current_power,
            3
        ),

        "today": {
            "energy_kwh": round(
                total_energy,
                3
            ),
            "estimated_cost": round(
                estimated_cost,
                2
            )
        },

        "active_appliances": active_appliances,

        "active_appliance_count": len(
            active_appliances
        ),

        "highest_consuming_appliance":
            highest_appliance
    }