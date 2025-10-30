import { useMemo } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const LastSixMosSalesGrowth = ({ territories = [], userTerritories = [], orders = [] }) => {
    const chartData = useMemo(() => {
        const now = new Date();

        // last 6 months
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            return {
                month: d.toLocaleString("default", { month: "short" }),
                year: d.getFullYear(),
                key: `${d.getFullYear()}-${d.getMonth()}`,
            };
        });

        // filter only userTerritories
        const filteredOrders = orders.filter(o => userTerritories.includes(o.territory));

        // accumulate sales units
        const salesPerMonth = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (months.find(m => m.key === key)) {
                let totalUnits = 0;
                order.products.forEach(p => {
                    totalUnits += p.quantity || 0;
                });
                salesPerMonth[key] = (salesPerMonth[key] || 0) + totalUnits;
            }
        });

        // calculate growth percentage vs previous month
        const data = months.map((m, i) => {
            const sales = salesPerMonth[m.key] || 0;
            let growth = 0;
            if (i > 0) {
                const prevSales = salesPerMonth[months[i - 1].key] || 0;
                if (prevSales > 0) {
                    growth = ((sales - prevSales) / prevSales) * 100;
                }
            }
            return {
                month: m.month,
                year: m.year,
                sales,
                growth: parseFloat(growth.toFixed(1)),
            };
        });

        return data;
    }, [orders, userTerritories]);

    return (
        <div className="bg-white rounded-xl shadow-md p-3 relative border border-gray-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Sales Growth Over Time <br />
                        <span className="text-sm font-normal text-gray-500 ml-1">(Last 6 Months)</span>
                    </h2>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Sales
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Growth
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-[320px]">
                <ResponsiveContainer>
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: "#666", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="left"
                            tick={{ fill: "#666", fontSize: 12 }}
                            tickFormatter={(v) =>
                                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                            }
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: "#666", fontSize: 12 }}
                            tickFormatter={(v) => `${v}%`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                fontSize: "13px",
                            }}
                            formatter={(value, name) =>
                                name === "growth"
                                    ? [`${value}%`, "Growth"]
                                    : [value.toLocaleString(), "Sales Units"]
                            }
                            labelStyle={{ fontWeight: 600, color: "#333" }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="sales"
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={{ r: 5, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 7 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="growth"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LastSixMosSalesGrowth;