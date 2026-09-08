import random
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import SensorData


# Number of days of historical data
DAYS = 30


def get_occupancy(hour):
    """
    Simulate the number of people at home
    based on the time of day.
    """

    if 0 <= hour < 6:
        return random.randint(0, 1)

    elif 6 <= hour < 9:
        return random.randint(1, 3)

    elif 9 <= hour < 17:
        return random.randint(0, 1)

    elif 17 <= hour < 23:
        return random.randint(1, 4)

    else:
        return random.randint(0, 2)


def get_temperature(hour):
    """
    Simulate outdoor/indoor temperature.
    """

    if 0 <= hour < 7:
        base_temperature = 29

    elif 7 <= hour < 12:
        base_temperature = 31

    elif 12 <= hour < 17:
        base_temperature = 35

    elif 17 <= hour < 21:
        base_temperature = 32

    else:
        base_temperature = 30

    return random.uniform(
        base_temperature - 1.5,
        base_temperature + 1.5
    )


def get_humidity(temperature):
    """
    Higher temperature generally means slightly lower humidity.
    """

    humidity = 85 - ((temperature - 25) * 2)

    humidity += random.uniform(-5, 5)

    return max(45, min(90, humidity))


def get_appliance_power(appliance_id, hour, occupancy, current_date):
    """
    Generate realistic power consumption for each appliance.
    """

    # --------------------------------
    # AC
    # --------------------------------
    if appliance_id == 1:

        if occupancy > 0 and (
            13 <= hour < 17 or
            20 <= hour < 23
        ):
            return random.uniform(0.9, 1.4)

        return 0


    # --------------------------------
    # TV
    # --------------------------------
    elif appliance_id == 2:

        if occupancy > 0 and 19 <= hour < 23:
            return random.uniform(0.06, 0.10)

        return 0


    # --------------------------------
    # Refrigerator
    # --------------------------------
    elif appliance_id == 3:

        # Refrigerator normally runs continuously.
        power = random.uniform(0.12, 0.18)

        # Occasional abnormal consumption
        # during a few days for anomaly detection.
        if current_date.day % 13 == 0:
            power = random.uniform(0.30, 0.40)

        return power


    # --------------------------------
    # Lights
    # --------------------------------
    elif appliance_id == 4:

        if occupancy > 0 and 18 <= hour < 23:
            return random.uniform(0.03, 0.05)

        return 0


    # --------------------------------
    # Washing Machine
    # --------------------------------
    elif appliance_id == 5:

        # Randomly operate on some days.
        if current_date.day % 3 == 0 and (
            7 <= hour < 9
        ):
            return random.uniform(0.40, 0.60)

        elif current_date.day % 5 == 0 and (
            18 <= hour < 20
        ):
            return random.uniform(0.40, 0.60)

        return 0


    # --------------------------------
    # Water Heater
    # --------------------------------
    elif appliance_id == 6:

        if (
            6 <= hour < 7
            or 20 <= hour < 21
        ):
            return random.uniform(1.7, 2.2)

        return 0


    return 0


def generate_historical_data():

    db = SessionLocal()

    try:

        end_time = datetime.now().replace(
            minute=0,
            second=0,
            microsecond=0
        )

        start_time = end_time - timedelta(days=DAYS)

        current_time = start_time

        records = []

        while current_time < end_time:

            hour = current_time.hour

            occupancy = get_occupancy(hour)

            temperature = get_temperature(hour)

            humidity = get_humidity(temperature)

            for appliance_id in range(1, 7):

                power = get_appliance_power(
                    appliance_id,
                    hour,
                    occupancy,
                    current_time
                )

                voltage = random.uniform(220, 240)

                if power > 0:
                    current = (power * 1000) / voltage
                else:
                    current = 0

                record = SensorData(
                    appliance_id=appliance_id,
                    temperature=round(temperature, 2),
                    humidity=round(humidity, 2),
                    occupancy=occupancy,
                    power_kw=round(power, 3),
                    voltage=round(voltage, 2),
                    current_amp=round(current, 2),
                    recorded_at=current_time
                )

                records.append(record)

            current_time += timedelta(hours=1)


        print("Preparing database records...")

        db.bulk_save_objects(records)

        db.commit()

        print("--------------------------------------")
        print("Historical data generated successfully")
        print(f"Days       : {DAYS}")
        print(f"Records    : {len(records)}")
        print("--------------------------------------")


    except Exception as error:

        db.rollback()

        print("Error generating historical data:")
        print(error)


    finally:

        db.close()


if __name__ == "__main__":
    generate_historical_data()