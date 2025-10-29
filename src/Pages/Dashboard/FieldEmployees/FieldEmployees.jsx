import { useMemo } from "react";
import useAllUsers from "../../../Hooks/useAllUsers";
import useOrders from "../../../Hooks/useOrders";
import useSingleUser from "../../../Hooks/useSingleUser";
import useTerritories from "../../../Hooks/useTerritories";
import ProductWiseTvsSChart from "../DashboardComponents/ProductWiseTvsSChart/ProductWiseTvsSChart";
import TopValuesCard from "../DashboardComponents/TopValuesCard/TopValuesCard";

const FieldEmployees = () => {
    const [users] = useAllUsers();
    const [singleUser] = useSingleUser();

    const [territories] = useTerritories();
    const [orders] = useOrders();

    const userTerritories = useMemo(() => {
        if (!singleUser || !users) return [];

        let t = singleUser?.territory ? [singleUser.territory] : [];

        const childUsers = users.filter(u => u.parentId === singleUser._id);
        const childTerritories = childUsers.map(u => u.territory);

        return [...new Set([...t, ...childTerritories])];
    }, [singleUser, users]);

    const deliveredOrders = orders.filter(order => {
        if (singleUser?.designation === "Zonal Manager") {
            return (
                order.status !== "pending" &&
                !["Doctor", "Institute"].includes(order?.territory)
            )
        } else {
            return (
                order.status !== "pending" &&
                (
                    order.territory === singleUser?.territory ||
                    userTerritories.includes(order.territory)
                )
            );
        }
    });

    return (
        <div>
            <TopValuesCard
                territories={territories}
                userTerritories={userTerritories}
                orders={deliveredOrders}
            />
            <div className="w-[60%]">
                <ProductWiseTvsSChart
                    territories={territories}
                    userTerritories={userTerritories}
                    orders={deliveredOrders}
                />
            </div>
        </div>
    );
};

export default FieldEmployees;