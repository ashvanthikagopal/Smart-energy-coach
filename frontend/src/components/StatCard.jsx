function StatCard({
    title,
    value,
    unit,
    icon
}) {

    return (

        <div className="stat-card">

            <div className="stat-icon">
                {icon}
            </div>

            <div className="stat-content">

                <p className="stat-title">
                    {title}
                </p>

                <div className="stat-value">

                    {value}

                    <span>
                        {unit}
                    </span>

                </div>

            </div>

        </div>
    );
}


export default StatCard;