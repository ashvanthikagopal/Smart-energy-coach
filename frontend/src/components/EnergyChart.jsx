import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";


/* =========================================
   DAILY ENERGY CHART
========================================= */

export function DailyEnergyChart({
    data
}) {

    return (

        <div className="chart-container">

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="date"
                    />

                    <YAxis />

                    <Tooltip
                        formatter={(value) => [
                            `${Number(value).toFixed(2)} kWh`,
                            "Energy"
                        ]}
                    />

                    <Line
                        type="monotone"
                        dataKey="energy_kwh"
                        strokeWidth={3}
                        dot={{
                            r: 4
                        }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}


/* =========================================
   CUSTOM APPLIANCE X-AXIS LABEL
========================================= */

function ApplianceTick({
    x,
    y,
    payload
}) {

    const name = payload.value;

    let firstLine = name;
    let secondLine = "";

    if (name === "Water Heater") {

        firstLine = "Water";
        secondLine = "Heater";

    } else if (name === "Washing Machine") {

        firstLine = "Washing";
        secondLine = "Machine";
    }

    return (

        <g
            transform={`translate(${x},${y})`}
        >

            <text
                x={0}
                y={0}
                textAnchor="middle"
                fill="#53657d"
                fontSize={14}
            >

                <tspan
                    x={0}
                    dy="16"
                >
                    {firstLine}
                </tspan>

                {secondLine && (
                    <tspan
                        x={0}
                        dy="18"
                    >
                        {secondLine}
                    </tspan>
                )}

            </text>

        </g>
    );
}


/* =========================================
   APPLIANCE ENERGY CHART
========================================= */

export function ApplianceEnergyChart({
    data
}) {

    return (

        <div className="chart-container">

            <ResponsiveContainer
                width="100%"
                height={330}
            >

                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 45
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="name"
                        interval={0}
                        height={55}
                        tick={<ApplianceTick />}
                    />

                    <YAxis />

                    <Tooltip
                        formatter={(value) => [
                            `${Number(value).toFixed(2)} kWh`,
                            "Energy"
                        ]}
                    />

                    <Bar
                        dataKey="energy_kwh"
                        radius={[
                            6,
                            6,
                            0,
                            0
                        ]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>
    );
}