import pandas as pd


TARIFF_PER_KWH = 8.0


def predict_monthly_bill(daily_energy):
    """
    Predict monthly electricity usage and bill.

    Recent days receive higher importance because
    they better represent the user's current usage pattern.
    """

    if not daily_energy:
        return {
            "predicted_energy_kwh": 0.0,
            "predicted_bill": 0.0
        }


    # -----------------------------------------
    # CREATE DATAFRAME
    # -----------------------------------------

    df = pd.DataFrame(daily_energy)

    if "energy_kwh" not in df.columns:
        return {
            "predicted_energy_kwh": 0.0,
            "predicted_bill": 0.0
        }


    df["energy_kwh"] = pd.to_numeric(
        df["energy_kwh"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["energy_kwh"]
    )


    if df.empty:
        return {
            "predicted_energy_kwh": 0.0,
            "predicted_bill": 0.0
        }


    # -----------------------------------------
    # REMOVE NEGATIVE VALUES
    # -----------------------------------------

    df["energy_kwh"] = df[
        "energy_kwh"
    ].clip(lower=0)


    # -----------------------------------------
    # SORT BY DATE
    # -----------------------------------------

    if "date" in df.columns:

        df["date"] = pd.to_datetime(
            df["date"],
            errors="coerce"
        )

        df = df.sort_values(
            "date"
        )


    # -----------------------------------------
    # RECENT-DAY WEIGHTED AVERAGE
    # -----------------------------------------

    # Use at most the latest 7 days.
    recent_df = df.tail(7).copy()

    number_of_days = len(
        recent_df
    )


    if number_of_days == 1:

        average_daily_energy = float(
            recent_df["energy_kwh"].iloc[0]
        )

    else:

        # Older days get lower weights.
        weights = list(
            range(
                1,
                number_of_days + 1
            )
        )

        weighted_average = (
            recent_df["energy_kwh"]
            .mul(weights)
            .sum()
            / sum(weights)
        )

        average_daily_energy = float(
            weighted_average
        )


    # -----------------------------------------
    # DETERMINE DAYS IN MONTH
    # -----------------------------------------

    now = pd.Timestamp.now()

    days_in_month = (
        now.days_in_month
    )

    current_day = now.day

    remaining_days = max(
        days_in_month - current_day,
        0
    )


    # -----------------------------------------
    # PREDICT MONTHLY ENERGY
    # -----------------------------------------

    historical_energy = float(
        df["energy_kwh"].sum()
    )


    # If we have data covering the current month,
    # use the actual energy already consumed.
    current_month_energy = 0.0

    if "date" in df.columns:

        current_month_records = df[
            (
                df["date"].dt.year
                == now.year
            )
            &
            (
                df["date"].dt.month
                == now.month
            )
        ]

        if not current_month_records.empty:

            current_month_energy = float(
                current_month_records[
                    "energy_kwh"
                ].sum()
            )


    # If current month data exists,
    # predict only the remaining days.
    if current_month_energy > 0:

        predicted_energy = (
            current_month_energy
            +
            (
                average_daily_energy
                * remaining_days
            )
        )

    else:

        # Fallback for historical data
        # that does not contain the current month.
        predicted_energy = (
            average_daily_energy
            * days_in_month
        )


    # -----------------------------------------
    # SAFETY CHECK
    # -----------------------------------------

    predicted_energy = max(
        0.0,
        predicted_energy
    )


    # -----------------------------------------
    # CALCULATE BILL
    # -----------------------------------------

    predicted_bill = (
        predicted_energy
        * TARIFF_PER_KWH
    )


    return {
        "predicted_energy_kwh": round(
            predicted_energy,
            2
        ),
        "predicted_bill": round(
            predicted_bill,
            2
        )
    }