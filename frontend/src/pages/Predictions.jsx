import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getBillPrediction,
    getAnomalies,
    getAlerts
} from "../services/api";

import PredictionCard
    from "../components/PredictionCard";


function Predictions() {

    // =========================================
    // STATE
    // =========================================

    const [prediction, setPrediction] =
        useState(null);

    const [anomalies, setAnomalies] =
        useState([]);

    const [alerts, setAlerts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // =========================================
    // LOAD DATA
    // =========================================

    const loadData = useCallback(
        async (showLoading = false) => {

            try {

                if (showLoading) {

                    setLoading(true);

                } else {

                    setRefreshing(true);

                }


                setError("");


                const [
                    predictionData,
                    anomalyData,
                    alertData
                ] = await Promise.all([

                    getBillPrediction(),

                    getAnomalies(),

                    getAlerts()

                ]);


                // =================================
                // PREDICTION
                // =================================

                setPrediction(
                    predictionData || null
                );


                // =================================
                // ANOMALIES
                // =================================

                setAnomalies(

                    Array.isArray(
                        anomalyData?.anomalies
                    )

                        ? anomalyData.anomalies

                        : []

                );


                // =================================
                // ALERTS
                // =================================

                setAlerts(

                    Array.isArray(
                        alertData?.alerts
                    )

                        ? alertData.alerts

                        : []

                );

            }

            catch (err) {

                console.error(
                    "Prediction page error:",
                    err
                );


                setError(
                    "Unable to load AI prediction data. Please check that the backend is running."
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

        loadData(true);


        const interval =
            setInterval(() => {

                loadData(false);

            }, 15000);


        return () => {

            clearInterval(interval);

        };

    }, [loadData]);


    // =========================================
    // ALERT GROUPS
    // =========================================

    const criticalAlerts =
        useMemo(
            () =>
                alerts.filter(
                    alert =>
                        alert.severity ===
                        "CRITICAL"
                ),
            [alerts]
        );


    const warningAlerts =
        useMemo(
            () =>
                alerts.filter(
                    alert =>
                        alert.severity ===
                        "WARNING"
                ),
            [alerts]
        );


    const normalAlerts =
        useMemo(
            () =>
                alerts.filter(
                    alert =>
                        alert.severity ===
                        "INFO"
                ),
            [alerts]
        );


    // =========================================
    // INITIAL LOADING
    // =========================================

    if (loading) {

        return (

            <div className="page-container">

                <div className="loading-card">

                    <div className="loading-spinner">
                        🧠
                    </div>


                    <h2>
                        Analyzing Energy Data
                    </h2>


                    <p>
                        AI is calculating your energy
                        forecast and checking for
                        unusual consumption.
                    </p>

                </div>

            </div>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <div className="page-container">

                <div className="error-card">

                    <div className="loading-spinner">
                        ⚠️
                    </div>


                    <h2>
                        Prediction unavailable
                    </h2>


                    <p>
                        {error}
                    </p>


                    <button
                        className="retry-button"
                        onClick={() =>
                            loadData(true)
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // =========================================
    // PREDICTION VALUES
    // =========================================

    const predictedEnergy =
        Number(
            prediction?.predicted_energy_kwh || 0
        );


    const predictedBill =
        Number(
            prediction?.predicted_bill || 0
        );


    const daysAnalyzed =
        Number(
            prediction?.days_analyzed || 0
        );


    // =========================================
    // PAGE
    // =========================================

    return (

        <div className="page-container">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="page-header">

                <div>

                    <p className="eyebrow">
                        AI ENERGY INTELLIGENCE
                    </p>


                    <h1>
                        Predictions & Alerts
                    </h1>


                    <p>
                        Forecast future energy usage,
                        estimate your electricity bill,
                        and detect unusual consumption.
                    </p>

                </div>


                {/* =================================
                    AI STATUS
                ================================= */}

                <div className="ai-status">

                    <span className="ai-status-dot">
                        ●
                    </span>


                    <div>

                        <strong>
                            {refreshing
                                ? "Updating AI Analysis"
                                : "AI System Active"}
                        </strong>


                        <small>
                            Live analysis • 15 sec refresh
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================
                FORECAST SUMMARY
            ================================= */}

            <div className="prediction-grid">


                <PredictionCard
                    icon="⚡"
                    title="Predicted Energy"
                    value={
                        `${predictedEnergy.toFixed(1)} kWh`
                    }
                    description="Estimated monthly consumption"
                />


                <PredictionCard
                    icon="₹"
                    title="Predicted Monthly Bill"
                    value={
                        `₹${predictedBill.toFixed(2)}`
                    }
                    description="Estimated electricity cost"
                />


                <PredictionCard
                    icon="📅"
                    title="Days Analyzed"
                    value={
                        daysAnalyzed
                    }
                    description="Historical usage records"
                />


                <PredictionCard
                    icon="🚨"
                    title="AI Anomalies"
                    value={
                        anomalies.length
                    }
                    description="Unusual consumption patterns"
                />

            </div>


            {/* =================================
                FORECAST EXPLANATION
            ================================= */}

            <div className="prediction-explanation">

                <div className="panel-header">

                    <div>

                        <h2>
                            🔮 AI Energy Forecast
                        </h2>


                        <p>
                            Estimated future consumption
                            based on historical household
                            energy patterns.
                        </p>

                    </div>


                    <span className="ai-badge">

                        {
                            prediction?.model ||
                            "AI MODEL"
                        }

                    </span>

                </div>


                <div className="forecast-content">

                    <div className="forecast-icon">
                        📈
                    </div>


                    <div>

                        <h3>
                            Monthly Consumption Forecast
                        </h3>


                        <p>

                            Smart Energy Coach analyzed{" "}

                            <strong>
                                {daysAnalyzed} days
                            </strong>

                            {" "}of historical energy usage
                            to estimate future monthly
                            consumption.

                        </p>


                        <div className="forecast-highlight">

                            <span>
                                Expected Monthly Usage
                            </span>


                            <strong>
                                {predictedEnergy.toFixed(1)}
                                {" "}kWh
                            </strong>

                        </div>


                        <div className="forecast-highlight">

                            <span>
                                Estimated Monthly Bill
                            </span>


                            <strong>
                                ₹{predictedBill.toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================
                AI INSIGHT
            ================================= */}

            <div className="prediction-panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            🧠 What the AI Found
                        </h2>


                        <p>
                            A quick summary of the current
                            energy intelligence results.
                        </p>

                    </div>

                </div>


                <div className="ai-process-grid">


                    {/* ENERGY FORECAST */}

                    <div className="ai-process-card">

                        <div className="ai-process-number">
                            ⚡
                        </div>


                        <h3>
                            Energy Forecast
                        </h3>


                        <p>

                            Expected monthly consumption is{" "}

                            <strong>
                                {predictedEnergy.toFixed(1)}
                                {" "}kWh
                            </strong>.

                        </p>

                    </div>


                    {/* BILL FORECAST */}

                    <div className="ai-process-card">

                        <div className="ai-process-number">
                            💰
                        </div>


                        <h3>
                            Bill Forecast
                        </h3>


                        <p>

                            Estimated monthly electricity
                            cost is{" "}

                            <strong>
                                ₹{predictedBill.toFixed(2)}
                            </strong>.

                        </p>

                    </div>


                    {/* ANOMALY DETECTION */}

                    <div className="ai-process-card">

                        <div className="ai-process-number">
                            🔍
                        </div>


                        <h3>
                            Anomaly Detection
                        </h3>


                        <p>

                            The AI detected{" "}

                            <strong>
                                {anomalies.length}
                            </strong>

                            {" "}unusual consumption
                            records.

                        </p>

                    </div>


                    {/* ALERTS */}

                    <div className="ai-process-card">

                        <div className="ai-process-number">
                            🚨
                        </div>


                        <h3>
                            Alerts
                        </h3>


                        <p>

                            There are{" "}

                            <strong>
                                {criticalAlerts.length}
                            </strong>

                            {" "}critical and{" "}

                            <strong>
                                {warningAlerts.length}
                            </strong>

                            {" "}warning alerts requiring
                            attention.

                        </p>

                    </div>

                </div>

            </div>


            {/* =================================
                ALERT SUMMARY
            ================================= */}

            <div className="alert-summary-grid">


                {/* CRITICAL */}

                <div className="alert-summary-card">

                    <div className="alert-summary-icon">
                        🚨
                    </div>


                    <div>

                        <span>
                            Critical Alerts
                        </span>


                        <strong>
                            {criticalAlerts.length}
                        </strong>

                    </div>

                </div>


                {/* WARNING */}

                <div className="alert-summary-card">

                    <div className="alert-summary-icon">
                        ⚠️
                    </div>


                    <div>

                        <span>
                            Warning Alerts
                        </span>


                        <strong>
                            {warningAlerts.length}
                        </strong>

                    </div>

                </div>


                {/* INFORMATION */}

                <div className="alert-summary-card">

                    <div className="alert-summary-icon">
                        ℹ️
                    </div>


                    <div>

                        <span>
                            Informational Alerts
                        </span>


                        <strong>
                            {normalAlerts.length}
                        </strong>

                    </div>

                </div>


                {/* TOTAL */}

                <div className="alert-summary-card">

                    <div className="alert-summary-icon">
                        🔔
                    </div>


                    <div>

                        <span>
                            Total AI Alerts
                        </span>


                        <strong>
                            {alerts.length}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================
                ANOMALIES
            ================================= */}

            <div className="prediction-panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            🔍 Detected Anomalies
                        </h2>


                        <p>
                            Unusual appliance consumption
                            identified by the AI detection system.
                        </p>

                    </div>


                    <span className="panel-count">
                        {anomalies.length}
                    </span>

                </div>


                {anomalies.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✅
                        </div>


                        <h3>
                            No anomalies detected
                        </h3>


                        <p>
                            Your appliance consumption
                            currently looks normal.
                        </p>

                    </div>

                ) : (

                    <div className="anomaly-list">

                        {anomalies
                            .slice(0, 10)
                            .map(
                                (anomaly, index) => (

                                    <div
                                        className={
                                            `anomaly-item ${
                                                anomaly.severity
                                                    ?.toLowerCase()
                                            }`
                                        }
                                        key={
                                            anomaly.sensor_id ||
                                            `${anomaly.appliance_id}-${index}`
                                        }
                                    >


                                        {/* ANOMALY ICON */}

                                        <div className="anomaly-icon">

                                            {
                                                anomaly.severity ===
                                                "CRITICAL"

                                                    ? "🚨"

                                                    : "⚠️"
                                            }

                                        </div>


                                        {/* ANOMALY CONTENT */}

                                        <div className="anomaly-content">

                                            <div className="anomaly-title-row">

                                                <strong>

                                                    Appliance #
                                                    {anomaly.appliance_id}

                                                </strong>


                                                <span
                                                    className={
                                                        `severity-badge ${
                                                            anomaly.severity
                                                                ?.toLowerCase()
                                                        }`
                                                    }
                                                >
                                                    {anomaly.severity}
                                                </span>

                                            </div>


                                            <p>

                                                {
                                                    anomaly.reason ||
                                                    "Unusual power consumption detected."
                                                }

                                            </p>


                                            <div className="anomaly-details">

                                                <span>

                                                    Power:

                                                    <strong>
                                                        {" "}
                                                        {Number(
                                                            anomaly.power_kw ||
                                                            0
                                                        ).toFixed(3)}
                                                        {" "}kW
                                                    </strong>

                                                </span>


                                                <span>

                                                    Rated:

                                                    <strong>
                                                        {" "}
                                                        {Number(
                                                            anomaly.rated_power_kw ||
                                                            0
                                                        ).toFixed(3)}
                                                        {" "}kW
                                                    </strong>

                                                </span>


                                                <span>

                                                    Ratio:

                                                    <strong>
                                                        {" "}
                                                        {Number(
                                                            anomaly.power_ratio ||
                                                            0
                                                        ).toFixed(2)}
                                                        ×
                                                    </strong>

                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                    </div>

                )}

            </div>


            {/* =================================
                AI ALERTS
            ================================= */}

            <div className="prediction-panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            🚨 AI Alerts
                        </h2>


                        <p>
                            Important consumption events
                            requiring attention.
                        </p>

                    </div>


                    <span className="panel-count">
                        {alerts.length}
                    </span>

                </div>


                {alerts.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✅
                        </div>


                        <h3>
                            No active alerts
                        </h3>


                        <p>
                            Everything looks good.
                        </p>

                    </div>

                ) : (

                    <div className="alert-list">

                        {alerts.map(
                            (alert, index) => (

                                <div
                                    className={
                                        `ai-alert-item ${
                                            alert.severity
                                                ?.toLowerCase()
                                        }`
                                    }
                                    key={
                                        `${alert.appliance_id}-${index}`
                                    }
                                >


                                    {/* ALERT ICON */}

                                    <div className="alert-icon">

                                        {
                                            alert.severity ===
                                            "CRITICAL"

                                                ? "🚨"

                                                : alert.severity ===
                                                  "WARNING"

                                                    ? "⚠️"

                                                    : "ℹ️"
                                        }

                                    </div>


                                    {/* ALERT CONTENT */}

                                    <div className="alert-content">

                                        <div className="alert-title-row">

                                            <strong>
                                                {alert.appliance}
                                            </strong>


                                            <span
                                                className={
                                                    `severity-badge ${
                                                        alert.severity
                                                            ?.toLowerCase()
                                                    }`
                                                }
                                            >
                                                {alert.severity}
                                            </span>

                                        </div>


                                        <p>
                                            {alert.message}
                                        </p>


                                        <div className="alert-details">

                                            <span>

                                                Current:

                                                <strong>
                                                    {" "}
                                                    {Number(
                                                        alert.power_kw ||
                                                        0
                                                    ).toFixed(3)}
                                                    {" "}kW
                                                </strong>

                                            </span>


                                            <span>

                                                Rated:

                                                <strong>
                                                    {" "}
                                                    {Number(
                                                        alert.rated_power_kw ||
                                                        0
                                                    ).toFixed(3)}
                                                    {" "}kW
                                                </strong>

                                            </span>


                                            {alert.power_ratio && (

                                                <span>

                                                    Ratio:

                                                    <strong>
                                                        {" "}
                                                        {Number(
                                                            alert.power_ratio
                                                        ).toFixed(2)}
                                                        ×
                                                    </strong>

                                                </span>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


        </div>

    );

}


export default Predictions;