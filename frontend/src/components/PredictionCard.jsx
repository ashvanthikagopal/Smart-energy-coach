function PredictionCard({
    icon,
    title,
    value,
    description
}) {

    return (
        <div className="prediction-card">

            <div className="prediction-card-icon">
                {icon}
            </div>

            <div className="prediction-card-content">

                <span className="prediction-card-title">
                    {title}
                </span>

                <strong className="prediction-card-value">
                    {value}
                </strong>

                <span className="prediction-card-description">
                    {description}
                </span>

            </div>

        </div>
    );
}


export default PredictionCard;