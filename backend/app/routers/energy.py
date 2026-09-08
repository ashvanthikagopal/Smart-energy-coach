from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Appliance, SensorData
from ..services.energy_service import (
    calculate_energy,
    calculate_cost
)


router = APIRouter(
    prefix="/energy",
    tags=["Energy"]
)


# -----------------------------------------
# ENERGY CALCULATION HELPER
# -----------------------------------------

def calculate_records_energy(records):
    """
    Calculate energy using the average power
    between two consecutive readings.

    Energy is calculated using:

        Energy (kWh) = Average Power (kW)
                       × Time (hours)

    This function expects records to already be
    ordered by appliance_id and recorded_at.
    """

    total_energy = 0.0

    previous_records = {}

    for record in records:

        appliance_id = record.appliance_id

        if appliance_id in previous_records:

            previous = previous_records[
                appliance_id
            ]

            seconds = (
                record.recorded_at -
                previous.recorded_at
            ).total_seconds()

            # Ignore invalid intervals and large
            # data gaps to prevent unrealistic
            # energy calculations.
            if 0 < seconds <= 2 * 60 * 60:

                previous_power = float(
                    previous.power_kw or 0
                )

                current_power = float(
                    record.power_kw or 0
                )

                average_power = (
                    previous_power +
                    current_power
                ) / 2

                energy = calculate_energy(
                    average_power,
                    seconds
                )

                total_energy += energy

        previous_records[appliance_id] = record

    return total_energy


# -----------------------------------------
# GET RECORDS WITH PREVIOUS READING
# -----------------------------------------

def get_records_with_previous(
    db,
    start_date
):
    """
    Fetch sensor records from the requested period
    plus the latest reading before the period for
    every appliance.

    Including the previous reading allows the first
    interval of the selected period to be calculated
    correctly.
    """

    period_records = (
        db.query(SensorData)
        .filter(
            SensorData.recorded_at >= start_date
        )
        .order_by(
            SensorData.appliance_id,
            SensorData.recorded_at
        )
        .all()
    )

    appliance_ids = {
        record.appliance_id
        for record in period_records
    }

    previous_records = []

    for appliance_id in appliance_ids:

        previous = (
            db.query(SensorData)
            .filter(
                SensorData.appliance_id == appliance_id,
                SensorData.recorded_at < start_date
            )
            .order_by(
                SensorData.recorded_at.desc()
            )
            .first()
        )

        if previous:
            previous_records.append(
                previous
            )

    return previous_records + period_records


# -----------------------------------------
# TODAY
# -----------------------------------------

@router.get("/today")
def get_today_energy(
    db: Session = Depends(get_db)
):

    now = datetime.now()

    start_of_day = datetime(
        now.year,
        now.month,
        now.day
    )

    records = get_records_with_previous(
        db,
        start_of_day
    )

    records = sorted(
        records,
        key=lambda record: (
            record.appliance_id,
            record.recorded_at
        )
    )

    total_energy = calculate_records_energy(
        records
    )

    total_cost = calculate_cost(
        total_energy
    )

    return {
        "period": "today",
        "energy_kwh": round(
            total_energy,
            3
        ),
        "estimated_cost": round(
            total_cost,
            2
        )
    }


# -----------------------------------------
# DAILY
# -----------------------------------------

@router.get("/daily")
def get_daily_energy(
    db: Session = Depends(get_db)
):

    now = datetime.now()

    # Last 7 calendar days including today.
    start_date = (
        now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )
        - timedelta(days=6)
    )

    records = get_records_with_previous(
        db,
        start_date
    )

    records = sorted(
        records,
        key=lambda record: (
            record.appliance_id,
            record.recorded_at
        )
    )

    daily_energy = {}

    previous_records = {}

    for record in records:

        appliance_id = record.appliance_id

        if appliance_id in previous_records:

            previous = previous_records[
                appliance_id
            ]

            seconds = (
                record.recorded_at -
                previous.recorded_at
            ).total_seconds()

            if 0 < seconds <= 2 * 60 * 60:

                previous_power = float(
                    previous.power_kw or 0
                )

                current_power = float(
                    record.power_kw or 0
                )

                average_power = (
                    previous_power +
                    current_power
                ) / 2

                energy = calculate_energy(
                    average_power,
                    seconds
                )

                date_key = (
                    record.recorded_at.date()
                )

                if date_key not in daily_energy:
                    daily_energy[date_key] = 0.0

                daily_energy[
                    date_key
                ] += energy

        previous_records[appliance_id] = record

    result = []

    for date_key, energy in sorted(
        daily_energy.items()
    ):

        result.append({
            "date": str(date_key),
            "energy_kwh": round(
                energy,
                3
            ),
            "estimated_cost": round(
                calculate_cost(energy),
                2
            )
        })

    return result


# -----------------------------------------
# WEEKLY
# -----------------------------------------

@router.get("/weekly")
def get_weekly_energy(
    db: Session = Depends(get_db)
):

    now = datetime.now()

    # Last 28 calendar days.
    start_date = (
        now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )
        - timedelta(days=27)
    )

    records = get_records_with_previous(
        db,
        start_date
    )

    records = sorted(
        records,
        key=lambda record: (
            record.appliance_id,
            record.recorded_at
        )
    )

    weekly_energy = {}

    previous_records = {}

    for record in records:

        appliance_id = record.appliance_id

        if appliance_id in previous_records:

            previous = previous_records[
                appliance_id
            ]

            seconds = (
                record.recorded_at -
                previous.recorded_at
            ).total_seconds()

            if 0 < seconds <= 2 * 60 * 60:

                previous_power = float(
                    previous.power_kw or 0
                )

                current_power = float(
                    record.power_kw or 0
                )

                average_power = (
                    previous_power +
                    current_power
                ) / 2

                energy = calculate_energy(
                    average_power,
                    seconds
                )

                date = record.recorded_at.date()

                week_start = (
                    date -
                    timedelta(
                        days=date.weekday()
                    )
                )

                if week_start not in weekly_energy:
                    weekly_energy[
                        week_start
                    ] = 0.0

                weekly_energy[
                    week_start
                ] += energy

        previous_records[appliance_id] = record

    result = []

    for week_start, energy in sorted(
        weekly_energy.items()
    ):

        result.append({
            "week_start": str(
                week_start
            ),
            "energy_kwh": round(
                energy,
                3
            ),
            "estimated_cost": round(
                calculate_cost(energy),
                2
            )
        })

    return result


# -----------------------------------------
# MONTHLY
# -----------------------------------------

@router.get("/monthly")
def get_monthly_energy(
    db: Session = Depends(get_db)
):

    now = datetime.now()

    # Last 30 calendar days.
    start_date = (
        now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )
        - timedelta(days=29)
    )

    records = get_records_with_previous(
        db,
        start_date
    )

    records = sorted(
        records,
        key=lambda record: (
            record.appliance_id,
            record.recorded_at
        )
    )

    monthly_energy = {}

    previous_records = {}

    for record in records:

        appliance_id = record.appliance_id

        if appliance_id in previous_records:

            previous = previous_records[
                appliance_id
            ]

            seconds = (
                record.recorded_at -
                previous.recorded_at
            ).total_seconds()

            if 0 < seconds <= 2 * 60 * 60:

                previous_power = float(
                    previous.power_kw or 0
                )

                current_power = float(
                    record.power_kw or 0
                )

                average_power = (
                    previous_power +
                    current_power
                ) / 2

                energy = calculate_energy(
                    average_power,
                    seconds
                )

                month_key = (
                    record.recorded_at.year,
                    record.recorded_at.month
                )

                if month_key not in monthly_energy:
                    monthly_energy[
                        month_key
                    ] = 0.0

                monthly_energy[
                    month_key
                ] += energy

        previous_records[appliance_id] = record

    result = []

    for month_key, energy in sorted(
        monthly_energy.items()
    ):

        result.append({
            "year": month_key[0],
            "month": month_key[1],
            "energy_kwh": round(
                energy,
                3
            ),
            "estimated_cost": round(
                calculate_cost(energy),
                2
            )
        })

    return result


# -----------------------------------------
# APPLIANCE-WISE
# -----------------------------------------

@router.get("/appliances")
def get_appliance_energy(
    db: Session = Depends(get_db)
):

    records = (
        db.query(SensorData)
        .order_by(
            SensorData.appliance_id,
            SensorData.recorded_at
        )
        .all()
    )

    appliance_data = {}

    for record in records:

        appliance_id = record.appliance_id

        if appliance_id not in appliance_data:

            appliance_data[
                appliance_id
            ] = []

        appliance_data[
            appliance_id
        ].append(record)

    result = []

    for appliance_id, appliance_records in sorted(
        appliance_data.items()
    ):

        energy = calculate_records_energy(
            appliance_records
        )

        # Get appliance details so the frontend
        # receives the appliance name.
        appliance = (
            db.query(Appliance)
            .filter(
                Appliance.id == appliance_id
            )
            .first()
        )

        result.append({
            "appliance_id": appliance_id,
            "name": (
                appliance.name
                if appliance
                else f"Appliance {appliance_id}"
            ),
            "energy_kwh": round(
                energy,
                3
            ),
            "estimated_cost": round(
                calculate_cost(energy),
                2
            )
        })

    # Show highest energy consumers first.
    result.sort(
        key=lambda item: item["energy_kwh"],
        reverse=True
    )

    return result