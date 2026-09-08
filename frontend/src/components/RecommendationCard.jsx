function RecommendationCard({
    recommendation
}) {

    return (

        <div className="recommendation-card">

            <div className="recommendation-icon">
                💡
            </div>

            <div className="recommendation-content">

                <div className="recommendation-header">

                    <h3>
                        {recommendation.title}
                    </h3>

                    <span
                        className={
                            `priority ${
                                recommendation.priority
                                    .toLowerCase()
                            }`
                        }
                    >
                        {recommendation.priority}
                    </span>

                </div>


                <p>
                    {recommendation.description}
                </p>

            </div>

        </div>
    );
}


export default RecommendationCard;