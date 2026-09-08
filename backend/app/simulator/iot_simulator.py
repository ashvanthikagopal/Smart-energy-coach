import random
import time
import requests


API_BASE_URL = "http://127.0.0.1:8000"

SENSOR_API_URL = (
    f"{API_BASE_URL}/sensors/"
)

APPLIANCE_API_URL = (
    f"{API_BASE_URL}/appliances/"
)


# Appliance power ratings
BASE_POWER = {
    1: 1.20,   # AC
    2: 0.08,   # TV
    3: 0.15,   # Refrigerator
    4: 0.04,   # Lights
    5: 0.50,   # Washing Machine
    6: 2.00    # Water Heater
}


def get_appliances():

    try:

        response = requests.get(
            APPLIANCE_API_URL,
            timeout=5
        )

        if response.status_code == 200:

            return response.json()

        print(
            "Unable to get appliances:",
            response.status_code
        )

        return []

    except requests.exceptions.RequestException as error:

        print(
            "Connection error while getting appliances:",
            error
        )

        return []


def generate_sensor_data(
    appliance,
    temperature,
    humidity,
    occupancy
):

    appliance_id = appliance["id"]

    status = appliance["status"]

    base_power = BASE_POWER.get(
        appliance_id,
        0
    )


    # -----------------------------------------
    # Calculate power
    # -----------------------------------------

    if status == "OFF":

        power = 0

    else:

        power = (
            base_power *
            random.uniform(0.8, 1.2)
        )


    # -----------------------------------------
    # Voltage
    # -----------------------------------------

    voltage = random.uniform(
        220,
        240
    )


    # -----------------------------------------
    # Current
    # -----------------------------------------

    if power == 0:

        current = 0

    else:

        current = (
            power * 1000
        ) / voltage


    return {

        "appliance_id":
            appliance_id,

        "temperature":
            round(
                temperature,
                2
            ),

        "humidity":
            round(
                humidity,
                2
            ),

        "occupancy":
            occupancy,

        "power_kw":
            round(
                power,
                3
            ),

        "voltage":
            round(
                voltage,
                2
            ),

        "current_amp":
            round(
                current,
                2
            )
    }


def send_data(data):

    try:

        response = requests.post(
            SENSOR_API_URL,
            json=data,
            timeout=5
        )


        if response.status_code == 200:

            print(
                "Data sent:",
                data
            )

        else:

            print(
                "API error:",
                response.status_code,
                response.text
            )


    except requests.exceptions.RequestException as error:

        print(
            "Connection error:",
            error
        )


def main():

    print(
        "======================================"
    )

    print(
        "       SMART ENERGY COACH"
    )

    print(
        "       IoT Simulator Started"
    )

    print(
        "======================================"
    )


    while True:

        # -----------------------------------------
        # Get latest appliance status
        # -----------------------------------------

        appliances = get_appliances()


        if not appliances:

            print(
                "No appliance data received."
            )

            time.sleep(5)

            continue


        # -----------------------------------------
        # Simulate environment
        # -----------------------------------------

        temperature = random.uniform(
            28,
            36
        )

        humidity = random.uniform(
            55,
            85
        )

        occupancy = random.randint(
            0,
            4
        )


        print(
            "\n--------------------------------------"
        )

        print(
            f"Temperature : "
            f"{temperature:.2f} °C"
        )

        print(
            f"Humidity    : "
            f"{humidity:.2f} %"
        )

        print(
            f"Occupancy   : "
            f"{occupancy} people"
        )

        print(
            "--------------------------------------"
        )


        # -----------------------------------------
        # Generate data for each appliance
        # -----------------------------------------

        for appliance in appliances:

            data = generate_sensor_data(
                appliance,
                temperature,
                humidity,
                occupancy
            )


            print(
                f"{appliance['name']:<20}"
                f"Status: "
                f"{appliance['status']:<4}"
                f"Power: "
                f"{data['power_kw']} kW"
            )


            send_data(data)


        # -----------------------------------------
        # Wait before next reading
        # -----------------------------------------

        time.sleep(10)


if __name__ == "__main__":

    main()