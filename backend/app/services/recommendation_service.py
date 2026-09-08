def generate_recommendations(
    appliance_usage,
    current_power,
    occupancy
):
    """
    Generate personalized energy recommendations
    using current power, occupancy, and appliance
    consumption patterns.
    """

    recommendations = []


    # -----------------------------------------
    # HIGH CURRENT POWER
    # -----------------------------------------

    if current_power >= 3.0:

        recommendations.append({
            "title": "High Energy Usage Detected",
            "description": (
                "Several appliances are currently "
                "consuming significant power. Consider "
                "turning off appliances that are not "
                "actively needed."
            ),
            "priority": "HIGH"
        })


    # -----------------------------------------
    # NO OCCUPANCY
    # -----------------------------------------

    if occupancy == 0 and current_power > 0.2:

        recommendations.append({
            "title": "Energy Used While Nobody Is Home",
            "description": (
                "The system detected energy consumption "
                "while no occupants are present. "
                "Consider switching off unnecessary "
                "appliances."
            ),
            "priority": "HIGH"
        })


    # -----------------------------------------
    # APPLIANCE-SPECIFIC RECOMMENDATIONS
    # -----------------------------------------

    for appliance in appliance_usage:

        name = appliance.get(
            "name",
            "Unknown Appliance"
        )

        energy = float(
            appliance.get(
                "energy_kwh",
                0
            )
        )


        # -----------------------------------------
        # AC
        # -----------------------------------------

        if name == "AC":

            if energy >= 20:

                recommendations.append({
                    "title": "Optimize AC Usage",
                    "description": (
                        "Your AC is one of the highest "
                        "energy-consuming appliances. "
                        "Consider increasing the temperature "
                        "setting slightly and avoid running "
                        "it when rooms are unoccupied."
                    ),
                    "priority": "MEDIUM"
                })


        # -----------------------------------------
        # WATER HEATER
        # -----------------------------------------

        elif name == "Water Heater":

            if energy >= 15:

                recommendations.append({
                    "title": "Reduce Water Heater Usage",
                    "description": (
                        "The water heater is consuming "
                        "a significant amount of energy. "
                        "Consider reducing unnecessary "
                        "heating cycles."
                    ),
                    "priority": "MEDIUM"
                })


        # -----------------------------------------
        # LIGHTS
        # -----------------------------------------

        elif name == "Lights":

            if energy >= 5:

                recommendations.append({
                    "title": "Optimize Lighting",
                    "description": (
                        "Lighting consumption is higher "
                        "than expected. Turn off lights "
                        "in rooms that are not occupied."
                    ),
                    "priority": "LOW"
                })


        # -----------------------------------------
        # REFRIGERATOR
        # -----------------------------------------

        elif name == "Refrigerator":

            if energy >= 50:

                recommendations.append({
                    "title": "Check Refrigerator",
                    "description": (
                        "Refrigerator consumption is "
                        "higher than expected. Check "
                        "whether the door is being left "
                        "open frequently or whether the "
                        "cooling system needs attention."
                    ),
                    "priority": "MEDIUM"
                })


        # -----------------------------------------
        # WASHING MACHINE
        # -----------------------------------------

        elif name == "Washing Machine":

            if energy >= 10:

                recommendations.append({
                    "title": "Optimize Washing Machine Usage",
                    "description": (
                        "Washing machine consumption is "
                        "higher than expected. Consider "
                        "running full loads and avoiding "
                        "unnecessary washing cycles."
                    ),
                    "priority": "LOW"
                })


        # -----------------------------------------
        # GENERAL HIGH CONSUMPTION
        # -----------------------------------------

        if energy >= 60:

            recommendations.append({
                "title": f"High Consumption: {name}",
                "description": (
                    f"{name} has consumed "
                    f"{energy:.2f} kWh during the "
                    "analyzed period. Consider reviewing "
                    "its usage pattern and reducing "
                    "unnecessary operating time."
                ),
                "priority": "HIGH"
            })


    # -----------------------------------------
    # FALLBACK RECOMMENDATION
    # -----------------------------------------

    if not recommendations:

        recommendations.append({
            "title": "Energy Usage Looks Good",
            "description": (
                "Your current energy consumption "
                "does not show any major efficiency "
                "issues. Continue monitoring your "
                "appliance usage to maintain efficient "
                "energy consumption."
            ),
            "priority": "LOW"
        })


    # -----------------------------------------
    # REMOVE DUPLICATES
    # -----------------------------------------

    unique_recommendations = []

    seen_titles = set()

    for recommendation in recommendations:

        title = recommendation["title"]

        if title not in seen_titles:

            seen_titles.add(title)

            unique_recommendations.append(
                recommendation
            )


    return unique_recommendations