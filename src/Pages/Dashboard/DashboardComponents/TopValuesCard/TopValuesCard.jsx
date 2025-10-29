import dayjs from "dayjs";
import { useMemo } from "react";
import { FaBoxOpen, FaBullseye, FaChartLine, FaClipboardList, FaCoins, FaMoneyBillWave } from "react-icons/fa";

const TopValuesCard = ({ territories = [], userTerritories = [], orders = [] }) => {
    const currentMonth = dayjs().format("YYYY-MM");

    const currentMonthOrders = useMemo(() => {
        return orders.filter(
            o => userTerritories.includes(o.territory) && dayjs(o.date).format("YYYY-MM") === currentMonth
        );
    }, [orders, userTerritories, currentMonth]);

    const allOrders = useMemo(() => orders.filter(o => userTerritories.includes(o.territory)), [orders, userTerritories]);

    const totalOrders = currentMonthOrders.length;
    const totalUnits = currentMonthOrders.reduce((sum, o) => sum + (o.totalUnit || 0), 0);
    const totalPrice = currentMonthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const totalDues = allOrders.reduce((sum, o) => sum + (o.due || 0), 0);

    const { totalTarget, totalAchievement } = useMemo(() => {
        let targetSum = 0;
        let achievedSum = 0;

        userTerritories.forEach(terr => {
            const terrTarget = territories.find(t => t.territory === terr && t.targetFor.includes(dayjs().format("MMMM-YYYY")));
            if (terrTarget) {
                terrTarget.target.forEach(t => {
                    targetSum += t.targetQuantity || 0;

                    const soldQty = currentMonthOrders
                        .flatMap(o => o.products)
                        .filter(p => p.productCode === t.productCode)
                        .reduce((s, p) => s + (p.quantity || 0), 0);

                    achievedSum += soldQty;
                });
            }
        });

        const achievementPercentage = targetSum > 0 ? ((achievedSum / targetSum) * 100).toFixed(2) : 0;
        return { totalTarget: targetSum, totalAchievement: parseFloat(achievementPercentage) };
    }, [territories, userTerritories, currentMonthOrders]);

    const cards = [
        { title: "Total Orders", value: totalOrders.toLocaleString(), icon: <FaClipboardList className="text-blue-500 text-4xl" />, bg: "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200" },
        { title: "Total Units", value: totalUnits.toLocaleString(), icon: <FaBoxOpen className="text-indigo-500 text-4xl" />, bg: "bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200" },
        { title: "Total Amounts", value: `৳ ${totalPrice.toFixed(2)}`, icon: <FaMoneyBillWave className="text-emerald-500 text-4xl" />, bg: "bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200" },
        { title: "Total Target", value: totalTarget.toLocaleString(), icon: <FaBullseye className="text-amber-500 text-4xl" />, bg: "bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200" },
        { title: "Achievement", value: `${totalAchievement}%`, icon: <FaChartLine className="text-purple-500 text-4xl" />, bg: "bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200" },
        { title: "Total Dues", value: `৳ ${totalDues.toFixed(2)}`, icon: <FaCoins className="text-rose-500 text-4xl" />, bg: "bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200" },
    ];

    return (
        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className={`${card.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex items-center`}
                >
                    <div className="mr-4">{card.icon}</div>
                    <div className="flex flex-col items-end justify-center w-full">
                        <p className="text-gray-600 text-sm font-semibold">{card.title}</p>
                        <h2 className="text-2xl font-extrabold text-gray-800 mt-1">{card.value}</h2>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TopValuesCard;