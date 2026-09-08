TARIFF_PER_KWH = 8.0


def calculate_energy(power_kw, seconds):
    """
    Calculate energy consumed.

    Energy (kWh) = Power (kW) × Time (hours)
    """

    hours = seconds / 3600

    return power_kw * hours


def calculate_cost(energy_kwh):
    """
    Calculate estimated electricity cost.

    This is a prototype tariff of ₹8 per kWh.
    """

    return energy_kwh * TARIFF_PER_KWH