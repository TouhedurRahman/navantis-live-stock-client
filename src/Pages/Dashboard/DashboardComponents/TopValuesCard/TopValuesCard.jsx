import { useMemo } from "react";

const TopValuesCard = ({ territories = [], userTerritories = [], orders = [] }) => {
    const filteredOrders = useMemo(() => {
        return orders.filter(order => userTerritories.includes(order.territory));
    }, [orders, userTerritories]);

    const totalOrders = filteredOrders.length;
    const totalUnits = filteredOrders.reduce((sum, order) => sum + (order.totalUnit || 0), 0);
    const totalPrice = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalDues = filteredOrders.reduce((sum, order) => sum + (order.due || 0), 0);

    const { totalTarget, totalAchievement } = useMemo(() => {
        let targetSum = 0;
        let achievedSum = 0;

        userTerritories.forEach(terr => {
            const terrTarget = territories.find(t => t.territory === terr);
            if (terrTarget) {
                terrTarget.target.forEach(t => {
                    targetSum += t.targetQuantity || 0;

                    const soldQty = filteredOrders
                        .flatMap(o => o.products)
                        .filter(p => p.productCode === t.productCode)
                        .reduce((s, p) => s + (p.quantity || 0), 0);

                    achievedSum += soldQty;
                });
            }
        });

        const achievementPercentage =
            targetSum > 0 ? ((achievedSum / targetSum) * 100).toFixed(2) : 0;

        return {
            totalTarget: targetSum,
            totalAchievement: parseFloat(achievementPercentage),
        };
    }, [territories, userTerritories, filteredOrders]);

    const cardStyle =
        "bg-white rounded-2xl shadow-md p-4 flex flex-col justify-center items-center hover:shadow-lg transition-all duration-300";

    const cards = [
        { title: "Total Orders", value: totalOrders.toLocaleString() },
        { title: "Total Units", value: totalUnits.toLocaleString() },
        { title: "Total Price", value: `৳${totalPrice.toFixed(2)}` },
        { title: "Total Target", value: totalTarget.toLocaleString() },
        { title: "Achievement", value: `${totalAchievement}%` },
        { title: "Total Dues", value: `৳${totalDues.toFixed(2)}` },
    ];

    return (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, i) => (
                <div key={i} className={cardStyle}>
                    <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h2>
                </div>
            ))}
        </div>
    );
};

export default TopValuesCard;