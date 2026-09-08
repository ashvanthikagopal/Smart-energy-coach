from collections import defaultdict

import numpy as np
from sklearn.ensemble import IsolationForest


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

# Minimum number of historical records required
# before Isolation Forest is used.
MIN_RECORDS_FOR_AI = 20

# Ignore very small deviations from rated power.
# This prevents normal simulator variation from
# being treated as an anomaly.
MIN_POWER_RATIO = 1.50

# Major abnormal consumption.
WARNING_POWER_RATIO = 2.0

# Extremely abnormal consumption.
CRITICAL_POWER_RATIO = 3.0

# Maximum number of anomalies returned.
MAX_ANOMALIES = 50


# --------------------------------------------------
# DETECT ANOMALIES
# --------------------------------------------------

def detect_anomalies(
    records,
    appliances=None
):
    """
    Detect abnormal appliance power consumption.

    Hybrid approach:

    1. Compare power against appliance rated power.
    2. Ignore normal small variations.
    3. Use Isolation Forest for historical patterns.
    4. Give priority to serious over-consumption.
    """

    if not records:
        return []

    # --------------------------------------------------
    # Create appliance lookup
    # --------------------------------------------------

    appliance_lookup = {}

    if appliances:

        for appliance in appliances:
            appliance_lookup[
                appliance.id
            ] = appliance

    # --------------------------------------------------
    # Group records by appliance
    # --------------------------------------------------

    appliance_records = defaultdict(list)

    for record in records:

        appliance_records[
            record.appliance_id
        ].append(record)

    anomalies = []

    # --------------------------------------------------
    # Process each appliance
    # --------------------------------------------------

    for appliance_id, appliance_data in (
        appliance_records.items()
    ):

        if not appliance_data:
            continue

        appliance = appliance_lookup.get(
            appliance_id
        )

        if not appliance:
            continue

        rated_power = float(
            appliance.rated_power_kw or 0
        )

        if rated_power <= 0:
            continue

        # --------------------------------------------------
        # Analyze power values
        # --------------------------------------------------

        power_values = np.array([
            float(record.power_kw or 0)
            for record in appliance_data
        ])

        # --------------------------------------------------
        # Determine whether Isolation Forest can run
        # --------------------------------------------------

        ai_predictions = np.ones(
            len(appliance_data),
            dtype=int
        )

        if len(appliance_data) >= MIN_RECORDS_FOR_AI:

            power_matrix = (
                power_values.reshape(-1, 1)
            )

            model = IsolationForest(
                contamination=0.03,
                random_state=42,
                n_estimators=100
            )

            ai_predictions = (
                model.fit_predict(
                    power_matrix
                )
            )

        # --------------------------------------------------
        # Process records
        # --------------------------------------------------

        for index, record in enumerate(
            appliance_data
        ):

            detected_power = float(
                record.power_kw or 0
            )

            if detected_power <= 0:
                continue

            power_ratio = (
                detected_power /
                rated_power
            )

            ai_anomaly = (
                ai_predictions[index] == -1
            )

            # --------------------------------------------------
            # RULE 1
            # Serious over-consumption
            # Always considered an anomaly.
            # --------------------------------------------------

            if power_ratio >= CRITICAL_POWER_RATIO:

                anomalies.append({
                    "sensor_id": record.id,
                    "appliance_id": appliance_id,
                    "power_kw": detected_power,
                    "rated_power_kw": rated_power,
                    "power_ratio": round(
                        power_ratio,
                        2
                    ),
                    "severity": "CRITICAL",
                    "reason": (
                        "Power consumption is "
                        "significantly higher "
                        "than the rated power."
                    ),
                    "recorded_at":
                        record.recorded_at
                })

                continue

            # --------------------------------------------------
            # RULE 2
            # Warning-level over-consumption
            # --------------------------------------------------

            if power_ratio >= WARNING_POWER_RATIO:

                anomalies.append({
                    "sensor_id": record.id,
                    "appliance_id": appliance_id,
                    "power_kw": detected_power,
                    "rated_power_kw": rated_power,
                    "power_ratio": round(
                        power_ratio,
                        2
                    ),
                    "severity": "WARNING",
                    "reason": (
                        "Power consumption is "
                        "higher than the normal "
                        "rated power."
                    ),
                    "recorded_at":
                        record.recorded_at
                })

                continue

            # --------------------------------------------------
            # RULE 3
            # AI anomaly
            #
            # Only accept AI anomalies when the
            # reading is also meaningfully above
            # the rated power.
            # --------------------------------------------------

            if (
                ai_anomaly
                and
                power_ratio >= MIN_POWER_RATIO
            ):

                anomalies.append({
                    "sensor_id": record.id,
                    "appliance_id": appliance_id,
                    "power_kw": detected_power,
                    "rated_power_kw": rated_power,
                    "power_ratio": round(
                        power_ratio,
                        2
                    ),
                    "severity": "WARNING",
                    "reason": (
                        "AI detected an unusual "
                        "power consumption pattern."
                    ),
                    "recorded_at":
                        record.recorded_at
                })

    # --------------------------------------------------
    # Sort newest first
    # --------------------------------------------------

    anomalies.sort(
        key=lambda anomaly:
            anomaly["recorded_at"],
        reverse=True
    )

    # --------------------------------------------------
    # Return only the most relevant anomalies
    # --------------------------------------------------

    return anomalies[
        :MAX_ANOMALIES
    ]