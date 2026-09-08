import {
    useEffect,
    useState,
    useRef
} from "react";

import StatCard
    from "../components/StatCard";

import ApplianceCard
    from "../components/ApplianceCard";

import RecommendationCard
    from "../components/RecommendationCard";

import {
    DailyEnergyChart,
    ApplianceEnergyChart
} from "../components/EnergyChart";

import {
    getDashboard,
    getAppliances,
    getDailyEnergy,
    getBillPrediction,
    getRecommendations,
    getApplianceEnergy,
    getAlerts,
    updateApplianceStatus
} from "../services/api";


function Dashboard() {

    // =========================================
    // STATE
    // =========================================

    const [dashboard, setDashboard] =
        useState(null);

    const [appliances, setAppliances] =
        useState([]);

    const [dailyEnergy, setDailyEnergy] =
        useState([]);

    const [billPrediction, setBillPrediction] =
        useState(null);

    const [recommendations, setRecommendations] =
        useState([]);

    const [applianceEnergy, setApplianceEnergy] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [lastUpdated, setLastUpdated] =
        useState(null);

    const [alerts, setAlerts] =
        useState([]);

    const [updatingApplianceId, setUpdatingApplianceId] =
        useState(null);


    // =========================================
    // REFRESH CONTROL
    // =========================================

    const isRefreshing =
        useRef(false);


    // =========================================
    // LOAD DASHBOARD DATA
    // =========================================

    const loadData = async (
        showLoading = false
    ) => {

        try {

            // Show loading screen only
            // during initial page load
            if (showLoading) {
                setLoading(true);
            }

            setError("");


            const [
                dashboardData,
                applianceData,
                dailyData,
                applianceEnergyData,
                predictionData,
                recommendationData,
                alertData
            ] = await Promise.all([

                getDashboard(),

                getAppliances(),

                getDailyEnergy(),

                getApplianceEnergy(),

                getBillPrediction(),

                getRecommendations(),

                getAlerts()

            ]);


            // =================================
            // UPDATE STATE
            // =================================

            setDashboard(
                dashboardData
            );


            setAppliances(
                applianceData
            );


            setDailyEnergy(
                dailyData
            );


            setApplianceEnergy(
                applianceEnergyData
            );


            setBillPrediction(
                predictionData
            );


            setRecommendations(
                recommendationData.recommendations || []
            );


            setAlerts(
                alertData.alerts || []
            );


            setLastUpdated(
                new Date()
            );

        }

        catch (err) {

            console.error(
                "Failed to load dashboard data:",
                err
            );


            /*
             * Only show the full error screen
             * if the initial load fails.
             *
             * If background refresh fails,
             * keep the existing dashboard visible.
             */

            if (showLoading) {

                setError(
                    "Unable to connect to backend."
                );

            }

        }

        finally {

            if (showLoading) {

                setLoading(false);

            }

        }

    };


    // =========================================
    // AUTO REFRESH
    // =========================================

    useEffect(() => {

        // Initial load
        loadData(true);


        /*
         * The IoT simulator generates data
         * every 10 seconds.
         *
         * Dashboard refreshes every 12 seconds.
         */

        const interval =
            setInterval(async () => {

                /*
                 * Prevent overlapping
                 * refresh requests.
                 */

                if (isRefreshing.current) {
                    return;
                }


                isRefreshing.current = true;


                try {

                    await loadData();

                }

                finally {

                    isRefreshing.current = false;

                }

            }, 12000);


        // Cleanup
        return () => {

            clearInterval(interval);

        };

    }, []);


    // =========================================
    // APPLIANCE ON/OFF CONTROL
    // =========================================

    const handleToggle = async (
        applianceId,
        status
    ) => {

        /*
         * Prevent multiple appliance updates
         * at the same time.
         */

        if (updatingApplianceId !== null) {
            return;
        }


        try {

            setUpdatingApplianceId(
                applianceId
            );


            await updateApplianceStatus(
                applianceId,
                status
            );


            /*
             * Refresh dashboard data silently
             * after changing appliance status.
             */

            await loadData(false);

        }

        catch (error) {

            console.error(
                "Failed to update appliance status:",
                error
            );

        }

        finally {

            setUpdatingApplianceId(
                null
            );

        }

    };


    // =========================================
    // APPLIANCE CHART DATA
    // =========================================

    /*
     * Convert API appliance energy data
     * into chart-friendly data.
     *
     * The backend returns appliance_id.
     *
     * We match that ID with the appliance list
     * to get the actual appliance name.
     */

    const applianceChartData =
        applianceEnergy.map(item => {

            const appliance =
                appliances.find(
                    appliance =>
                        appliance.id ===
                        item.appliance_id
                );


            return {

                name:
                    appliance
                        ? appliance.name
                        : `Appliance ${item.appliance_id}`,

                energy_kwh:
                    Number(
                        item.energy_kwh || 0
                    )

            };

        });


    // =========================================
    // SORT APPLIANCE CHART
    // =========================================

    /*
     * Sort appliances by energy consumption.
     *
     * Highest consumption appears first.
     */

    const sortedApplianceChartData =
        [...applianceChartData]
            .sort(
                (a, b) =>
                    b.energy_kwh -
                    a.energy_kwh
            );


    // =========================================
    // INITIAL LOADING
    // =========================================

    if (loading) {

        return (

            <div className="loading">

                Loading Smart Energy Coach...

            </div>

        );

    }


    // =========================================
    // INITIAL ERROR
    // =========================================

    if (error) {

        return (

            <div className="error-message">

                <p>
                    {error}
                </p>


                <button
                    onClick={() =>
                        loadData(true)
                    }
                >
                    Retry
                </button>

            </div>

        );

    }


    // =========================================
    // SAFETY CHECK
    // =========================================

    if (
        !dashboard ||
        !billPrediction
    ) {

        return (

            <div className="loading">

                Loading dashboard data...

            </div>

        );

    }


    // =========================================
    // MAIN DASHBOARD
    // =========================================

    return (

        <div className="dashboard">


            {/* =================================
                HEADER
            ================================= */}

            <header className="dashboard-header">

                <div>

                    <p className="eyebrow">
                        SMART HOME ENERGY
                    </p>


                    <h1>
                        Smart Energy Coach
                    </h1>


                    <p className="subtitle">
                        Monitor, understand and
                        optimize your energy usage.
                    </p>

                </div>


                {/* =================================
                    LIVE INDICATOR
                ================================= */}

                <div className="live-indicator">

                    <span></span>

                    <div>

                        <strong>
                            Live
                        </strong>


                        {lastUpdated && (

                            <small>

                                Updated{" "}

                                {
                                    lastUpdated
                                        .toLocaleTimeString()
                                }

                            </small>

                        )}

                    </div>

                </div>

            </header>


            {/* =================================
                STATISTICS
            ================================= */}

            <section className="stats-grid">


                <StatCard
                    title="Today's Energy"
                    value={
                        dashboard
                            .today
                            .energy_kwh
                    }
                    unit=" kWh"
                    icon="⚡"
                />


                <StatCard
                    title="Current Power"
                    value={
                        dashboard
                            .current_power_kw
                    }
                    unit=" kW"
                    icon="🔌"
                />


                <StatCard
                    title="Today's Cost"
                    value={
                        `₹${
                            dashboard
                                .today
                                .estimated_cost
                        }`
                    }
                    unit=""
                    icon="💰"
                />


                <StatCard
                    title="Predicted Monthly Bill"
                    value={
                        `₹${
                            billPrediction
                                .predicted_bill
                        }`
                    }
                    unit=""
                    icon="📈"
                />

            </section>


            {/* =================================
                MAIN CONTENT
            ================================= */}

            <section className="main-grid">


                {/* =================================
                    DAILY ENERGY
                ================================= */}

                <div className="panel chart-panel daily-energy-panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                Energy Consumption
                            </h2>


                            <p>
                                Last 7 days
                            </p>

                        </div>

                    </div>


                    <DailyEnergyChart
                        data={dailyEnergy}
                    />

                </div>


                {/* =================================
                    TOP ENERGY CONSUMER
                ================================= */}

                <div className="panel top-consumer-panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                Top Energy Consumer
                            </h2>


                            <p>
                                Highest usage appliance
                            </p>

                        </div>

                    </div>


                    {
                        dashboard
                            .highest_consuming_appliance
                            ? (

                                <div className="top-consumer">

                                    <div className="large-icon">
                                        ⚡
                                    </div>


                                    <h3>

                                        {
                                            dashboard
                                                .highest_consuming_appliance
                                                .name
                                        }

                                    </h3>


                                    <strong>

                                        {
                                            dashboard
                                                .highest_consuming_appliance
                                                .energy_kwh
                                        }

                                        {" "}
                                        kWh

                                    </strong>


                                    <p>

                                        Estimated cost: ₹

                                        {
                                            dashboard
                                                .highest_consuming_appliance
                                                .estimated_cost
                                        }

                                    </p>

                                </div>

                            )

                            : (

                                <div className="top-consumer">

                                    <div className="large-icon">
                                        ⚡
                                    </div>

                                    <h3>
                                        No Data
                                    </h3>

                                    <p>
                                        No consumption data available.
                                    </p>

                                </div>

                            )
                    }

                </div>


                {/* =================================
                    APPLIANCE CONSUMPTION
                ================================= */}

                <div className="panel appliance-consumption-panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                Appliance Consumption
                            </h2>


                            <p>
                                Energy usage by appliance
                            </p>

                        </div>


                        <span className="panel-count">

                            {sortedApplianceChartData.length}

                            {" "}

                            appliances

                        </span>

                    </div>


                    <div className="appliance-chart-wrapper">

                        <ApplianceEnergyChart
                            data={
                                sortedApplianceChartData
                            }
                        />

                    </div>

                </div>


            </section>


            {/* =================================
                APPLIANCES
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            Appliances
                        </h2>


                        <p>
                            Control your connected appliances
                        </p>

                    </div>


                    <span>

                        {
                            dashboard
                                .active_appliance_count
                        }

                        {" "}
                        active

                    </span>

                </div>


                <div className="appliance-grid">

                    {appliances.map(
                        appliance => (

                            <ApplianceCard
                                key={
                                    appliance.id
                                }
                                appliance={
                                    appliance
                                }
                                onToggle={
                                    handleToggle
                                }
                                updatingApplianceId={
                                    updatingApplianceId
                                }
                            />

                        )
                    )}

                </div>

            </section>


            {/* =================================
                AI RECOMMENDATIONS
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            AI Energy Coach
                        </h2>


                        <p>
                            Personalized recommendations
                        </p>

                    </div>


                    <span className="ai-badge">
                        AI
                    </span>

                </div>


                {
                    recommendations.length > 0

                        ? (

                            <div className="recommendations">

                                {
                                    recommendations.map(
                                        (
                                            recommendation,
                                            index
                                        ) => (

                                            <RecommendationCard
                                                key={index}
                                                recommendation={
                                                    recommendation
                                                }
                                            />

                                        )
                                    )
                                }

                            </div>

                        )

                        : (

                            <div className="no-recommendations">

                                <span>
                                    ✓
                                </span>


                                <p>
                                    Your energy usage looks good.
                                </p>

                            </div>

                        )
                }

            </section>


            {/* =================================
                AI ALERTS
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            AI Alerts
                        </h2>


                        <p>
                            Unusual energy consumption
                            detected by AI
                        </p>

                    </div>


                    {
                        alerts.length > 0 && (

                            <span className="alert-badge">

                                {alerts.length}

                                {" "}

                                Alert
                                {
                                    alerts.length !== 1
                                        ? "s"
                                        : ""
                                }

                            </span>

                        )
                    }

                </div>


                {
                    alerts.length === 0

                        ? (

                            <div className="no-alerts">

                                <span>
                                    ✓
                                </span>

                                <p>
                                    No unusual energy
                                    consumption detected.
                                </p>

                            </div>

                        )

                        : (

                            <div className="alerts">

                                {
                                    alerts.map(
                                        (
                                            alert,
                                            index
                                        ) => {

                                            const severity =
                                                alert.severity
                                                    ?.toLowerCase()
                                                || "info";


                                            return (

                                                <div
                                                    key={
                                                        `${alert.appliance_id}-${alert.recorded_at}-${index}`
                                                    }
                                                    className={
                                                        `alert-card ${severity}`
                                                    }
                                                >


                                                    {/* ALERT ICON */}

                                                    <div className="alert-icon">

                                                        {
                                                            severity ===
                                                            "critical"

                                                                ? "🔴"

                                                                : severity ===
                                                                  "warning"

                                                                    ? "🟠"

                                                                    : "🔵"
                                                        }

                                                    </div>


                                                    {/* ALERT CONTENT */}

                                                    <div className="alert-content">

                                                        <div className="alert-header">

                                                            <h3>
                                                                {
                                                                    alert.appliance
                                                                }
                                                            </h3>


                                                            <span
                                                                className={
                                                                    `alert-severity ${severity}`
                                                                }
                                                            >
                                                                {
                                                                    alert.severity
                                                                }
                                                            </span>

                                                        </div>


                                                        <p>

                                                            {
                                                                alert.message
                                                            }

                                                        </p>


                                                        <div className="alert-details">

                                                            <span>

                                                                Power:

                                                                {" "}

                                                                <strong>

                                                                    {
                                                                        alert.power_kw
                                                                    }

                                                                    {" "}
                                                                    kW

                                                                </strong>

                                                            </span>


                                                            {
                                                                alert.rated_power_kw !==
                                                                undefined && (

                                                                    <span>

                                                                        Rated:

                                                                        {" "}

                                                                        <strong>

                                                                            {
                                                                                alert.rated_power_kw
                                                                            }

                                                                            {" "}
                                                                            kW

                                                                        </strong>

                                                                    </span>

                                                                )
                                                            }

                                                        </div>


                                                        <small>

                                                            {
                                                                new Date(
                                                                    alert.recorded_at
                                                                ).toLocaleString()
                                                            }

                                                        </small>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )
                                }

                            </div>

                        )
                }

            </section>


            {/* =================================
                AI PREDICTION
            ================================= */}

            <section className="prediction-panel">

                <div>

                    <p className="eyebrow">
                        AI FORECAST
                    </p>


                    <h2>
                        Estimated Monthly Consumption
                    </h2>


                    <p>
                        Based on your recent
                        energy consumption patterns.
                    </p>

                </div>


                <div className="prediction-value">

                    <strong>

                        {
                            billPrediction
                                .predicted_energy_kwh
                        }

                    </strong>


                    <span>
                        kWh
                    </span>


                    <small>

                        ≈ ₹

                        {
                            billPrediction
                                .predicted_bill
                        }

                    </small>

                </div>

            </section>


        </div>

    );

}


export default Dashboard;