import { useMemo, useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaBullseye, FaShoppingCart } from "react-icons/fa";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const ProductWiseTvsSChart = ({ territories = [], userTerritories = [], orders = [] }) => {
    const scrollRef = useRef(null);

    const chartData = useMemo(() => {
        if (!orders.length) return [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthOrders = orders.filter(o => {
            const orderDate = new Date(o.date || o.orderDate);
            return (
                userTerritories.includes(o.territory) &&
                orderDate.getMonth() === currentMonth &&
                orderDate.getFullYear() === currentYear
            );
        });

        const salesMap = {};
        currentMonthOrders.forEach(order => {
            order.products.forEach(p => {
                const key = `${p.productCode}_${p.netWeight}`;
                salesMap[key] = (salesMap[key] || 0) + (p.quantity || 0);
            });
        });

        const targetMap = {};
        userTerritories.forEach(terr => {
            const terrTarget = territories.find(t => t.territory === terr);
            if (terrTarget) {
                terrTarget.target.forEach(t => {
                    const key = `${t.productCode}_${t.netWeight}`;
                    targetMap[key] = (targetMap[key] || 0) + (t.targetQuantity || 0);
                });
            }
        });

        const allKeys = new Set([...Object.keys(salesMap), ...Object.keys(targetMap)]);
        const data = Array.from(allKeys).map(key => {
            const [productCode, netWeight] = key.split("_");
            return {
                name: `${productCode}\n${netWeight}`,
                Target: targetMap[key] || 0,
                Sales: salesMap[key] || 0,
            };
        });

        const sortedData = data.sort((a, b) => {
            if (b.Sales !== a.Sales) return b.Sales - a.Sales;
            if (b.Target !== a.Target) return b.Target - a.Target;
            return 0;
        });

        // return data.sort((a, b) => b.Sales - a.Sales);
        return sortedData;
    }, [territories, userTerritories, orders]);

    const maxYValue = useMemo(() => {
        return chartData.length > 0
            ? Math.ceil(Math.max(...chartData.map(d => Math.max(d.Target, d.Sales))) * 1.2)
            : 100;
    }, [chartData]);

    const chartWidth = Math.max(chartData.length * 110, 900);

    const scrollLeft = () => scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    const scrollRight = () => scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });

    const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

    return (
        <div className="bg-white rounded-xl shadow-md mx-6 p-5 mt-6 relative border border-gray-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-700">
                    Product Wise Target vs Sales - <span className="text-gray-500">{monthName}</span>
                </h2>
                <div className="flex gap-4 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                        <FaBullseye className="text-blue-500" /> Target
                    </span>
                    <span className="flex items-center gap-1">
                        <FaShoppingCart className="text-emerald-500" /> Sales
                    </span>
                </div>
            </div>

            {/* Scroll Arrows */}
            {chartData.length > 8 && (
                <>
                    <button
                        onClick={scrollLeft}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 bg-black/80 hover:bg-black text-white p-2 rounded-full shadow-lg transition-all"
                    >
                        <FaArrowLeft />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 bg-black/80 hover:bg-black text-white p-2 rounded-full shadow-lg transition-all"
                    >
                        <FaArrowRight />
                    </button>
                </>
            )}

            {/* Chart */}
            {chartData.length > 0 ? (
                <div
                    ref={scrollRef}
                    className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                    <div style={{ width: chartWidth, minWidth: "900px" }}>
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                            >
                                <CartesianGrid stroke="#ddd" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    tickLine={false}
                                    height={60}
                                    tick={({ x, y, payload }) => {
                                        const [line1, line2] = payload.value.split("\n");
                                        return (
                                            <g transform={`translate(${x},${y + 10})`}>
                                                <text
                                                    textAnchor="middle"
                                                    fill="#444"
                                                    fontSize={12}
                                                    fontWeight={500}
                                                >
                                                    <tspan x="0" dy="0">{line1}</tspan>
                                                    <tspan x="0" dy="14">{line2}</tspan>
                                                </text>
                                            </g>
                                        );
                                    }}
                                />
                                <YAxis
                                    domain={[0, maxYValue]}
                                    tickCount={6}
                                    tick={{ fontSize: 12, fill: "#333" }}
                                    axisLine={{ stroke: "#000" }}
                                />

                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const [code, netWeight] = label.split("\n");
                                            return (
                                                <div className="bg-white p-3 border border-gray-300 rounded-md shadow-md text-sm">
                                                    <p className="font-semibold text-gray-700">{code} {netWeight}</p>
                                                    <p className="text-blue-500">Target: {data.Target}</p>
                                                    <p className="text-green-500">Sales: {data.Sales}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="Target" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 text-sm py-10">
                    No sales data available for {monthName}
                </p>
            )}
        </div>
    );
};

export default ProductWiseTvsSChart;