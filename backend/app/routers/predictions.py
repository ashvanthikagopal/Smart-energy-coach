from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Appliance, SensorData

from ..services.energy_service import (
    calculate_energy,
    calculate_cost
)

from ..services.prediction_service import (
    predict_monthly_bill
)

from ..services.anomaly_service import (
    detect_anomalies
)

from ..services.recommendation_service import (
    generate_recommendations
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


# ==================================================
# BILL PREDICTION
# ==================================================

@router.get("/bill-prediction")
def get_bill_prediction(
    db: Session = Depends(get_db)
):

    records = (
        db.query(SensorData)
        .order_by(
            SensorData.recorded_at
        )
        .all()
    )

    if not records:

        return {
            "model": "Recent Weighted Average",
            "days_analyzed": 0,
            "predicted_energy_kwh": 0.0,
            "predicted_bill": 0.0
        }

    # --------------------------------------------------
    # Group records by date
    # --------------------------------------------------

    daily_energy = {}

    previous_records = {}

    sorted_records = sorted(
        records,
        key=lambda record: (
            record.appliance_id,
            record.recorded_at
        )
    )

    for record in sorted_records:

        appliance_id = (
            record.appliance_id
        )

        if appliance_id in previous_records:

            previous = previous_records[
                appliance_id
            ]

            seconds = (
                record.recorded_at
                - previous.recorded_at
            ).total_seconds()

            # Ignore gaps larger than 2 hours.
            if 0 < seconds <= 2 * 60 * 60:

                previous_power = float(
                    previous.power_kw or 0
                )

                current_power = float(
                    record.power_kw or 0
                )

                average_power = (
                    previous_power
                    + current_power
                ) / 2

                energy = calculate_energy(
                    average_power,
                    seconds
                )

                date_key = (
                    record.recorded_at.date()
                )

                if date_key not in daily_energy:

                    daily_energy[
                        date_key
                    ] = 0.0

                daily_energy[
                    date_key
                ] += energy

        previous_records[
            appliance_id
        ] = record

    daily_data = []

    for date_key, energy in sorted(
        daily_energy.items()
    ):

        daily_data.append({
            "date": str(date_key),
            "energy_kwh": round(
                energy,
                3
            )
        })

    prediction = predict_monthly_bill(
        daily_data
    )

    return {
        "model": "Recent Weighted Average",
        "days_analyzed": len(
            daily_data
        ),
        "predicted_energy_kwh":
            prediction[
                "predicted_energy_kwh"
            ],
        "predicted_bill":
            prediction[
                "predicted_bill"
            ]
    }


# ==================================================
# AI ANOMALIES
# ==================================================

@router.get("/anomalies")
def get_ai_anomalies(
    db: Session = Depends(get_db)
):

    records = (
        db.query(SensorData)
        .order_by(
            SensorData.recorded_at
        )
        .all()
    )

    appliances = (
        db.query(Appliance)
        .order_by(
            Appliance.id
        )
        .all()
    )

    anomalies = detect_anomalies(
        records,
        appliances
    )

    return {
        "anomaly_count": len(
            anomalies
        ),
        "anomalies": anomalies
    }


# ==================================================
# AI RECOMMENDATIONS
# ==================================================

@router.get("/recommendations")
def get_ai_recommendations(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # Get appliances
    # --------------------------------------------------

    appliances = (
        db.query(Appliance)
        .order_by(
            Appliance.id
        )
        .all()
    )

    # --------------------------------------------------
    # Get latest sensor reading
    # --------------------------------------------------

    latest_records = []

    for appliance in appliances:

        latest = (
            db.query(SensorData)
            .filter(
                SensorData.appliance_id
                == appliance.id
            )
            .order_by(
                SensorData.recorded_at.desc()
            )
            .first()
        )

        if latest:
            latest_records.append(
                latest
            )

    # --------------------------------------------------
    # Current power
    # --------------------------------------------------

    current_power = sum(
        float(
            record.power_kw or 0
        )
        for record in latest_records
    )

    # --------------------------------------------------
    # Occupancy
    # --------------------------------------------------

    occupancy = 0

    if latest_records:

        latest_overall = max(
            latest_records,
            key=lambda record:
                record.recorded_at
        )

        occupancy = int(
            latest_overall.occupancy or 0
        )

    # --------------------------------------------------
    # Calculate appliance energy
    # --------------------------------------------------

    appliance_usage = []

    for appliance in appliances:

        appliance_records = (
            db.query(SensorData)
            .filter(
                SensorData.appliance_id
                == appliance.id
            )
            .order_by(
                SensorData.recorded_at
            )
            .all()
        )

        if not appliance_records:

            continue

        energy = calculate_records_energy(
            appliance_records
        )

        appliance_usage.append({
            "appliance_id":
                appliance.id,

            "name":
                appliance.name,

            "energy_kwh":
                round(
                    energy,
                    3
                )
        })

    # --------------------------------------------------
    # Generate recommendations
    # --------------------------------------------------

    recommendations = (
        generate_recommendations(
            appliance_usage,
            current_power,
            occupancy
        )
    )

    return {
        "current_power_kw":
            round(
                current_power,
                3
            ),

        "occupancy":
            occupancy,

        "recommendations":
            recommendations,

        "recommendation_count":
            len(
                recommendations
            )
    }


# ==================================================
# HELPER FOR RECOMMENDATIONS
# ==================================================

def calculate_records_energy(
    records
):

    if not records:
        return 0.0

    total_energy = 0.0

    previous = None

    for record in records:

        if previous:

            seconds = (
                record.recorded_at
                - previous.recorded_at
            ).total_seconds()

            if 0 < seconds <= 2 * 60 * 60:

                previous_power = float(
                    previous.power_kw or 0
                )

                current_power = float(
                    record.power_kw or 0
                )

                average_power = (
                    previous_power
                    + current_power
                ) / 2

                total_energy += (
                    calculate_energy(
                        average_power,
                        seconds
                    )
                )

        previous = record

    return total_energy


# ==================================================
# AI ALERTS
# ==================================================

@router.get("/alerts")
def get_ai_alerts(
    db: Session = Depends(get_db)
):

    records = (
        db.query(SensorData)
        .order_by(
            SensorData.recorded_at
        )
        .all()
    )

    appliances = (
        db.query(Appliance)
        .order_by(
            Appliance.id
        )
        .all()
    )

    # --------------------------------------------------
    # Detect anomalies
    # --------------------------------------------------

    anomalies = detect_anomalies(
        records,
        appliances
    )

    # --------------------------------------------------
    # Appliance lookup
    # --------------------------------------------------

    appliance_lookup = {
        appliance.id: appliance
        for appliance in appliances
    }

    # --------------------------------------------------
    # Keep only the most relevant alert
    # for each appliance.
    #
    # This prevents the dashboard from showing
    # the same appliance repeatedly.
    # --------------------------------------------------

    appliance_alerts = {}

    severity_priority = {
        "CRITICAL": 3,
        "WARNING": 2,
        "INFO": 1
    }

    for anomaly in anomalies:

        appliance_id = (
            anomaly["appliance_id"]
        )

        appliance = appliance_lookup.get(
            appliance_id
        )

        if not appliance:
            continue

        severity = anomaly.get(
            "severity",
            "INFO"
        )

        existing = appliance_alerts.get(
            appliance_id
        )

        # Replace existing alert if:
        #
        # 1. New alert has higher severity
        # OR
        # 2. Same severity but newer timestamp
        #
        should_replace = False

        if existing is None:

            should_replace = True

        else:

            current_priority = severity_priority.get(
                existing["severity"],
                0
            )

            new_priority = severity_priority.get(
                severity,
                0
            )

            if new_priority > current_priority:

                should_replace = True

            elif (
                new_priority == current_priority
                and
                anomaly["recorded_at"]
                > existing["recorded_at"]
            ):

                should_replace = True

        if not should_replace:
            continue

        detected_power = float(
            anomaly["power_kw"] or 0
        )

        rated_power = float(
            anomaly["rated_power_kw"] or 0
        )

        power_ratio = float(
            anomaly.get(
                "power_ratio",
                0
            )
        )

        if severity == "CRITICAL":

            message = (
                f"{appliance.name} is consuming "
                f"approximately "
                f"{detected_power:.2f} kW, "
                f"which is {power_ratio:.1f}× "
                f"its rated power of "
                f"{rated_power:.2f} kW."
            )

        elif severity == "WARNING":

            message = (
                f"{appliance.name} is consuming "
                f"{detected_power:.2f} kW, "
                f"which is {power_ratio:.1f}× "
                f"its rated power of "
                f"{rated_power:.2f} kW."
            )

        else:

            message = (
                f"Minor unusual power "
                f"consumption detected for "
                f"{appliance.name}."
            )

        appliance_alerts[
            appliance_id
        ] = {
            "appliance":
                appliance.name,

            "appliance_id":
                appliance.id,

            "message":
                message,

            "power_kw":
                round(
                    detected_power,
                    3
                ),

            "rated_power_kw":
                round(
                    rated_power,
                    3
                ),

            "power_ratio":
                round(
                    power_ratio,
                    2
                ),

            "severity":
                severity,

            "recorded_at":
                anomaly[
                    "recorded_at"
                ]
        }

    # --------------------------------------------------
    # Convert dictionary to list
    # --------------------------------------------------

    alerts = list(
        appliance_alerts.values()
    )

    # --------------------------------------------------
    # Sort by severity first,
    # then newest timestamp.
    # --------------------------------------------------

    alerts.sort(
        key=lambda alert: (
            severity_priority.get(
                alert["severity"],
                0
            ),
            alert["recorded_at"]
        ),
        reverse=True
    )

    # --------------------------------------------------
    # Limit dashboard alerts
    # --------------------------------------------------

    alerts = alerts[:10]

    # --------------------------------------------------
    # Count severity
    # --------------------------------------------------

    critical_count = sum(
        1
        for alert in alerts
        if alert["severity"]
        == "CRITICAL"
    )

    warning_count = sum(
        1
        for alert in alerts
        if alert["severity"]
        == "WARNING"
    )

    info_count = sum(
        1
        for alert in alerts
        if alert["severity"]
        == "INFO"
    )

    return {
        "alert_count":
            len(alerts),

        "critical_count":
            critical_count,

        "warning_count":
            warning_count,

        "info_count":
            info_count,

        "alerts":
            alerts
    }