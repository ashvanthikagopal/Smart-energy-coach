import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    getDailyEnergy,
    getApplianceEnergy
} from "../services/api";

import {
    DailyEnergyChart,
    ApplianceEnergyChart
} from "../components/EnergyChart";


function Analytics() {

    // =========================================
    // STATE
    // =========================================

    const [dailyEnergy, setDailyEnergy] =
        useState([]);

    const [applianceEnergy, setApplianceEnergy] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // =========================================
    // LOAD ANALYTICS DATA
    // =========================================

    const loadAnalytics = useCallback(
        async (showLoading = false) => {

            try {

                if (showLoading) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");


                const [
                    dailyData,
                    applianceData
                ] = await Promise.all([

                    getDailyEnergy(),

                    getApplianceEnergy()

                ]);


                setDailyEnergy(
                    Array.isArray(dailyData)
                        ? dailyData
                        : []
                );


                setApplianceEnergy(
                    Array.isArray(applianceData)
                        ? applianceData
                        : []
                );

            }

            catch (err) {

                console.error(
                    "Failed to load analytics:",
                    err
                );


                setError(
                    "Unable to load analytics data. Please check that the backend is running."
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

        loadAnalytics(true);


        const refreshInterval =
            setInterval(() => {

                loadAnalytics(false);

            }, 15000);


        return () => {

            clearInterval(refreshInterval);

        };

    }, [loadAnalytics]);


    // =========================================
    // INITIAL LOADING
    // =========================================

    if (loading) {

        return (

            <div className="loading-card">

                <div className="loading-spinner">
                    📊
                </div>

                <h2>
                    Loading analytics...
                </h2>

                <p>
                    Analyzing your energy consumption data.
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
                    Analytics unavailable
                </h2>

                <p>
                    {error}
                </p>

                <button
                    className="retry-button"
                    onClick={() =>
                        loadAnalytics(true)
                    }
                >
                    Try Again
                </button>

            </div>

        );

    }


    // =========================================
    // BASIC CALCULATIONS
    // =========================================

    const totalEnergy =
        dailyEnergy.reduce(
            (total, item) =>
                total +
                Number(
                    item.energy_kwh || 0
                ),
            0
        );


    const numberOfDays =
        dailyEnergy.length;


    const averageDailyEnergy =
        numberOfDays > 0
            ? totalEnergy / numberOfDays
            : 0;


    const totalCost =
        dailyEnergy.reduce(
            (total, item) =>
                total +
                Number(
                    item.estimated_cost || 0
                ),
            0
        );


    // =========================================
    // HIGHEST APPLIANCE
    // =========================================

    const highestAppliance =
        applianceEnergy.length > 0
            ? applianceEnergy.reduce(
                (highest, item) =>
                    Number(
                        item.energy_kwh || 0
                    ) >
                    Number(
                        highest.energy_kwh || 0
                    )
                        ? item
                        : highest
            )
            : null;


    // =========================================
    // LOWEST APPLIANCE
    // =========================================

    const lowestAppliance =
        applianceEnergy.length > 0
            ? applianceEnergy.reduce(
                (lowest, item) =>
                    Number(
                        item.energy_kwh || 0
                    ) <
                    Number(
                        lowest.energy_kwh || 0
                    )
                        ? item
                        : lowest
            )
            : null;


    // =========================================
    // APPLIANCE CHART DATA
    // =========================================

    const chartData =
        applianceEnergy.map(
            item => ({

                ...item,

                energy_kwh:
                    Number(
                        item.energy_kwh || 0
                    )

            })
        );


    // =========================================
    // HIGHEST ENERGY
    // =========================================

    const highestEnergy =
        highestAppliance
            ? Number(
                highestAppliance.energy_kwh || 0
            )
            : 0;


    // =========================================
    // HIGHEST SHARE
    // =========================================

    const highestShare =
        totalEnergy > 0
            ? (
                highestEnergy /
                totalEnergy
            ) * 100
            : 0;


    // =========================================
    // LATEST DAY
    // =========================================

    const latestDay =
        dailyEnergy.length > 0
            ? dailyEnergy[
                dailyEnergy.length - 1
            ]
            : null;


    const latestDayEnergy =
        latestDay
            ? Number(
                latestDay.energy_kwh || 0
            )
            : 0;


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
                        ENERGY ANALYTICS
                    </p>


                    <h1>
                        Energy Analytics
                    </h1>


                    <p className="subtitle">
                        Understand how your household
                        consumes energy and identify
                        the biggest opportunities to save.
                    </p>

                </div>


                {/* LIVE INDICATOR */}

                <div className="live-indicator">

                    <span></span>

                    <div>

                        <strong>
                            {refreshing
                                ? "Updating"
                                : "Analytics Live"}
                        </strong>


                        <small>
                            Refreshes every 15 seconds
                        </small>

                    </div>

                </div>

            </header>


            {/* =================================
                ANALYTICS STATS
            ================================= */}

            <section className="stats-grid">


                {/* TOTAL ENERGY */}

                <div className="stat-card">

                    <div className="stat-icon">
                        ⚡
                    </div>

                    <div>

                        <p className="stat-title">
                            Total Energy
                        </p>


                        <div className="stat-value">

                            {totalEnergy.toFixed(2)}

                            <span>
                                {" "}kWh
                            </span>

                        </div>

                    </div>

                </div>


                {/* AVERAGE DAILY */}

                <div className="stat-card">

                    <div className="stat-icon">
                        📊
                    </div>

                    <div>

                        <p className="stat-title">
                            Average Daily Usage
                        </p>


                        <div className="stat-value">

                            {averageDailyEnergy.toFixed(2)}

                            <span>
                                {" "}kWh
                            </span>

                        </div>

                    </div>

                </div>


                {/* ESTIMATED COST */}

                <div className="stat-card">

                    <div className="stat-icon">
                        💰
                    </div>

                    <div>

                        <p className="stat-title">
                            Estimated Cost
                        </p>


                        <div className="stat-value">

                            ₹{totalCost.toFixed(2)}

                        </div>

                    </div>

                </div>


                {/* TOP CONSUMER */}

                <div className="stat-card">

                    <div className="stat-icon">
                        🏆
                    </div>

                    <div>

                        <p className="stat-title">
                            Top Consumer
                        </p>


                        <div
                            className="stat-value"
                            style={{
                                fontSize: "18px"
                            }}
                        >

                            {highestAppliance
                                ? highestAppliance.name
                                : "N/A"}

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================
                CONSUMPTION OVERVIEW
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            Consumption Overview
                        </h2>


                        <p>
                            Summary of the energy data
                            currently available for analysis.
                        </p>

                    </div>

                </div>


                <div className="recommendations">


                    {/* ANALYSIS PERIOD */}

                    <div className="recommendation-card">

                        <div className="recommendation-icon">
                            📅
                        </div>


                        <div className="recommendation-content">

                            <div className="recommendation-header">

                                <h3>
                                    Analysis Period
                                </h3>


                                <span className="ai-badge">
                                    DATA
                                </span>

                            </div>


                            <p>

                                The dashboard is currently
                                analyzing{" "}

                                <strong>
                                    {numberOfDays}
                                </strong>

                                {" "}day
                                {numberOfDays === 1
                                    ? ""
                                    : "s"}

                                {" "}of energy data.

                            </p>

                        </div>

                    </div>


                    {/* LATEST DAILY USAGE */}

                    <div className="recommendation-card">

                        <div className="recommendation-icon">
                            ⚡
                        </div>


                        <div className="recommendation-content">

                            <div className="recommendation-header">

                                <h3>
                                    Latest Daily Usage
                                </h3>

                            </div>


                            <p>

                                The most recent recorded
                                daily consumption is{" "}

                                <strong>
                                    {latestDayEnergy.toFixed(2)}
                                    {" "}kWh
                                </strong>.

                            </p>

                        </div>

                    </div>


                    {/* LARGEST CONTRIBUTOR */}

                    {highestAppliance && (

                        <div className="recommendation-card">

                            <div className="recommendation-icon">
                                🔌
                            </div>


                            <div className="recommendation-content">

                                <div className="recommendation-header">

                                    <h3>
                                        Largest Energy Contributor
                                    </h3>


                                    <span className="priority high">
                                        HIGH IMPACT
                                    </span>

                                </div>


                                <p>

                                    <strong>
                                        {highestAppliance.name}
                                    </strong>

                                    {" "}consumed{" "}

                                    <strong>
                                        {highestEnergy.toFixed(2)}
                                        {" "}kWh
                                    </strong>

                                    {" "}and represents approximately{" "}

                                    <strong>
                                        {highestShare.toFixed(1)}%
                                    </strong>

                                    {" "}of the analyzed
                                    energy usage.

                                </p>

                            </div>

                        </div>

                    )}

                </div>

            </section>


            {/* =================================
                DAILY ENERGY
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            Daily Energy Consumption
                        </h2>


                        <p>
                            Track how household energy
                            usage changes from day to day.
                        </p>

                    </div>


                    <span className="ai-badge">
                        TREND
                    </span>

                </div>


                {dailyEnergy.length > 0 ? (

                    <DailyEnergyChart
                        data={dailyEnergy}
                    />

                ) : (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📊
                        </div>


                        <h3>
                            No daily energy data
                        </h3>


                        <p>
                            Daily consumption data will
                            appear here once readings are available.
                        </p>

                    </div>

                )}

            </section>


            {/* =================================
                APPLIANCE CONSUMPTION
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            Appliance Consumption
                        </h2>


                        <p>
                            Compare energy usage across
                            connected household appliances.
                        </p>

                    </div>


                    <span className="ai-badge">
                        COMPARISON
                    </span>

                </div>


                {chartData.length > 0 ? (

                    <ApplianceEnergyChart
                        data={chartData}
                    />

                ) : (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🔌
                        </div>


                        <h3>
                            No appliance data
                        </h3>


                        <p>
                            Appliance-level energy
                            consumption will appear here.
                        </p>

                    </div>

                )}

            </section>


            {/* =================================
                CONSUMPTION INSIGHTS
            ================================= */}

            <section className="panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            Consumption Insights
                        </h2>


                        <p>
                            Key observations generated
                            from your energy consumption data.
                        </p>

                    </div>


                    <span className="ai-badge">
                        INSIGHTS
                    </span>

                </div>


                <div className="recommendations">


                    {/* DAILY USAGE PATTERN */}

                    <div className="recommendation-card">

                        <div className="recommendation-icon">
                            ⚡
                        </div>


                        <div className="recommendation-content">

                            <div className="recommendation-header">

                                <h3>
                                    Daily Usage Pattern
                                </h3>

                            </div>


                            <p>

                                Your average daily consumption
                                is{" "}

                                <strong>
                                    {averageDailyEnergy.toFixed(2)}
                                    {" "}kWh
                                </strong>

                                {" "}based on the available
                                energy records.

                            </p>

                        </div>

                    </div>


                    {/* HIGHEST ENERGY CONSUMER */}

                    {highestAppliance && (

                        <div className="recommendation-card">

                            <div className="recommendation-icon">
                                🏆
                            </div>


                            <div className="recommendation-content">

                                <div className="recommendation-header">

                                    <h3>
                                        Highest Energy Consumer
                                    </h3>


                                    <span className="priority high">
                                        HIGH
                                    </span>

                                </div>


                                <p>

                                    <strong>
                                        {highestAppliance.name}
                                    </strong>

                                    {" "}is the largest energy
                                    consumer in the analyzed
                                    appliance data, using{" "}

                                    <strong>
                                        {highestEnergy.toFixed(2)}
                                        {" "}kWh
                                    </strong>.

                                </p>

                            </div>

                        </div>

                    )}


                    {/* LOWEST ENERGY CONSUMER */}

                    {lowestAppliance && (

                        <div className="recommendation-card">

                            <div className="recommendation-icon">
                                💡
                            </div>


                            <div className="recommendation-content">

                                <div className="recommendation-header">

                                    <h3>
                                        Lowest Energy Consumer
                                    </h3>

                                </div>


                                <p>

                                    <strong>
                                        {lowestAppliance.name}
                                    </strong>

                                    {" "}has the lowest recorded
                                    consumption among the
                                    analyzed appliances.

                                </p>

                            </div>

                        </div>

                    )}


                    {/* SAVING OPPORTUNITY */}

                    <div className="recommendation-card">

                        <div className="recommendation-icon">
                            🎯
                        </div>


                        <div className="recommendation-content">

                            <div className="recommendation-header">

                                <h3>
                                    Energy Saving Opportunity
                                </h3>


                                <span className="priority medium">
                                    OPTIMIZE
                                </span>

                            </div>


                            <p>

                                Focus first on high-consumption
                                appliances. Reducing unnecessary
                                operating time for the largest
                                energy consumers can have the
                                greatest impact on overall usage.

                            </p>

                        </div>

                    </div>

                </div>

            </section>


        </div>

    );

}


export default Analytics;