import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getRecommendations
} from "../services/api";

import RecommendationCard
    from "../components/RecommendationCard";


function Recommendations() {

    // =========================================
    // STATE
    // =========================================

    const [
        recommendations,
        setRecommendations
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // =========================================
    // LOAD RECOMMENDATIONS
    // =========================================

    const loadRecommendations = useCallback(
        async (showLoading = false) => {

            try {

                if (showLoading) {

                    setLoading(true);

                } else {

                    setRefreshing(true);

                }


                setError("");


                const data =
                    await getRecommendations();


                setRecommendations(

                    Array.isArray(
                        data?.recommendations
                    )

                        ? data.recommendations

                        : []

                );

            }

            catch (err) {

                console.error(
                    "Failed to load recommendations:",
                    err
                );


                setError(
                    "Unable to load AI recommendations. Please check that the backend is running."
                );

            }

            finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        []
    );


    // =========================================
    // AUTO REFRESH
    // =========================================

    useEffect(() => {

        loadRecommendations(true);


        const refreshInterval =
            setInterval(() => {

                loadRecommendations(false);

            }, 15000);


        return () => {

            clearInterval(refreshInterval);

        };

    }, [loadRecommendations]);


    // =========================================
    // PRIORITY GROUPS
    // =========================================

    const highPriority =
        useMemo(
            () =>
                recommendations.filter(
                    recommendation =>
                        recommendation.priority === "HIGH"
                ),
            [recommendations]
        );


    const mediumPriority =
        useMemo(
            () =>
                recommendations.filter(
                    recommendation =>
                        recommendation.priority === "MEDIUM"
                ),
            [recommendations]
        );


    const lowPriority =
        useMemo(
            () =>
                recommendations.filter(
                    recommendation =>
                        recommendation.priority === "LOW"
                ),
            [recommendations]
        );


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="loading-card">

                <div className="loading-spinner">
                    🧠
                </div>


                <h2>
                    Analyzing your energy usage...
                </h2>


                <p>
                    Smart Energy Coach is generating
                    personalized recommendations.
                </p>

            </div>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <div className="error-card">

                <div className="loading-spinner">
                    ⚠️
                </div>


                <h2>
                    Recommendations unavailable
                </h2>


                <p>
                    {error}
                </p>


                <button
                    className="retry-button"
                    onClick={() =>
                        loadRecommendations(true)
                    }
                >
                    Try Again
                </button>

            </div>

        );

    }


    // =========================================
    // PAGE
    // =========================================

    return (

        <div className="dashboard">


            {/* =================================
                HEADER
            ================================= */}

            <header className="dashboard-header">

                <div>

                    <p className="eyebrow">
                        AI ENERGY COACH
                    </p>


                    <h1>
                        Smart Recommendations
                    </h1>


                    <p className="subtitle">
                        Personalized guidance based on
                        your household energy consumption
                        patterns.
                    </p>

                </div>


                {/* =================================
                    LIVE STATUS
                ================================= */}

                <div className="live-indicator">

                    <span></span>


                    <div>

                        <strong>
                            {refreshing
                                ? "Updating"
                                : "AI Analysis Active"}
                        </strong>


                        <small>
                            Refreshes every 15 seconds
                        </small>

                    </div>

                </div>

            </header>


            {/* =================================
                SUMMARY
            ================================= */}

            <section className="stats-grid">


                {/* TOTAL */}

                <div className="stat-card">

                    <div className="stat-icon">
                        💡
                    </div>


                    <div>

                        <p className="stat-title">
                            Total Recommendations
                        </p>


                        <div className="stat-value">
                            {recommendations.length}
                        </div>

                    </div>

                </div>


                {/* HIGH */}

                <div className="stat-card">

                    <div className="stat-icon">
                        🔴
                    </div>


                    <div>

                        <p className="stat-title">
                            High Priority
                        </p>


                        <div className="stat-value">
                            {highPriority.length}
                        </div>

                    </div>

                </div>


                {/* MEDIUM */}

                <div className="stat-card">

                    <div className="stat-icon">
                        🟠
                    </div>


                    <div>

                        <p className="stat-title">
                            Medium Priority
                        </p>


                        <div className="stat-value">
                            {mediumPriority.length}
                        </div>

                    </div>

                </div>


                {/* LOW */}

                <div className="stat-card">

                    <div className="stat-icon">
                        🟢
                    </div>


                    <div>

                        <p className="stat-title">
                            Low Priority
                        </p>


                        <div className="stat-value">
                            {lowPriority.length}
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================
                AI SUMMARY
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            Your Energy Coach
                        </h2>


                        <p>
                            Smart suggestions are prioritized
                            so you can focus on the actions
                            that may have the greatest impact.
                        </p>

                    </div>


                    <span className="ai-badge">
                        AI POWERED
                    </span>

                </div>


                <div className="recommendations">


                    {/* START WITH HIGH PRIORITY */}

                    <div className="recommendation-card">

                        <div className="recommendation-icon">
                            🎯
                        </div>


                        <div className="recommendation-content">

                            <div className="recommendation-header">

                                <h3>
                                    Start with High Priority
                                </h3>

                            </div>


                            <p>

                                There are{" "}

                                <strong>
                                    {highPriority.length}
                                </strong>

                                {" "}high-priority
                                recommendation
                                {highPriority.length === 1
                                    ? ""
                                    : "s"}.

                                {" "}These should be reviewed
                                before lower-priority
                                suggestions.

                            </p>

                        </div>

                    </div>


                    {/* PERSONALIZED ANALYSIS */}

                    <div className="recommendation-card">

                        <div className="recommendation-icon">
                            🧠
                        </div>


                        <div className="recommendation-content">

                            <div className="recommendation-header">

                                <h3>
                                    Personalized Analysis
                                </h3>

                            </div>


                            <p>

                                Recommendations are generated
                                from appliance consumption,
                                current power usage and
                                household occupancy patterns.

                            </p>

                        </div>

                    </div>


                    {/* REDUCE WASTE */}

                    <div className="recommendation-card">

                        <div className="recommendation-icon">
                            ♻️
                        </div>


                        <div className="recommendation-content">

                            <div className="recommendation-header">

                                <h3>
                                    Reduce Waste
                                </h3>

                            </div>


                            <p>

                                The goal is not simply to
                                reduce electricity usage,
                                but to identify unnecessary
                                consumption while maintaining
                                normal household comfort.

                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================
                HIGH PRIORITY
            ================================= */}

            {highPriority.length > 0 && (

                <section className="panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                🔴 High Priority
                            </h2>


                            <p>
                                Actions that may have the
                                greatest impact on energy
                                consumption.
                            </p>

                        </div>


                        <span className="alert-badge">
                            {highPriority.length}
                        </span>

                    </div>


                    <div className="recommendations">

                        {highPriority.map(
                            (recommendation, index) => (

                                <RecommendationCard
                                    key={`high-${index}`}
                                    recommendation={
                                        recommendation
                                    }
                                />

                            )
                        )}

                    </div>

                </section>

            )}


            {/* =================================
                MEDIUM PRIORITY
            ================================= */}

            {mediumPriority.length > 0 && (

                <section className="panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                🟠 Medium Priority
                            </h2>


                            <p>
                                Useful optimization opportunities
                                that can improve household
                                efficiency.
                            </p>

                        </div>


                        <span className="alert-badge">
                            {mediumPriority.length}
                        </span>

                    </div>


                    <div className="recommendations">

                        {mediumPriority.map(
                            (recommendation, index) => (

                                <RecommendationCard
                                    key={`medium-${index}`}
                                    recommendation={
                                        recommendation
                                    }
                                />

                            )
                        )}

                    </div>

                </section>

            )}


            {/* =================================
                LOW PRIORITY
            ================================= */}

            {lowPriority.length > 0 && (

                <section className="panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                🟢 Low Priority
                            </h2>


                            <p>
                                Small improvements that can
                                contribute to long-term
                                energy efficiency.
                            </p>

                        </div>


                        <span className="alert-badge">
                            {lowPriority.length}
                        </span>

                    </div>


                    <div className="recommendations">

                        {lowPriority.map(
                            (recommendation, index) => (

                                <RecommendationCard
                                    key={`low-${index}`}
                                    recommendation={
                                        recommendation
                                    }
                                />

                            )
                        )}

                    </div>

                </section>

            )}


            {/* =================================
                NO RECOMMENDATIONS
            ================================= */}

            {recommendations.length === 0 && (

                <section className="panel">

                    <div className="no-alerts">

                        <span>
                            ✓
                        </span>


                        <p>

                            Your current energy usage
                            does not require any specific
                            recommendations right now.

                        </p>

                    </div>

                </section>

            )}


        </div>

    );

}


export default Recommendations;