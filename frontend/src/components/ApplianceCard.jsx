function ApplianceCard({
    appliance,
    onToggle,
    updatingApplianceId
}) {
    const isOn = appliance.status === "ON";

    const isUpdating =
        updatingApplianceId === appliance.id;

    return (
        <div className="appliance-card">
            <div className="appliance-info">
                <div className="appliance-icon">
                    ⚡
                </div>

                <div>
                    <h3>
                        {appliance.name}
                    </h3>

                    <p>
                        {appliance.category}
                    </p>
                </div>
            </div>

            <div className="appliance-control">
                <span
                    className={
                        isOn
                            ? "status on"
                            : "status off"
                    }
                >
                    {isOn ? "ON" : "OFF"}
                </span>

                <button
                    className={
                        isOn
                            ? "toggle-button active"
                            : "toggle-button"
                    }
                    disabled={isUpdating}
                    onClick={() =>
                        onToggle(
                            appliance.id,
                            isOn ? "OFF" : "ON"
                        )
                    }
                >
                    {isUpdating
                        ? "Updating..."
                        : isOn
                            ? "Turn Off"
                            : "Turn On"}
                </button>
            </div>
        </div>
    );
}

export default ApplianceCard;