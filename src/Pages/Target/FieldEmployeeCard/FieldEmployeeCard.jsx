import { useMemo } from "react";
import { FaEdit } from "react-icons/fa";
import useDepotProducts from "../../../Hooks/useDepotProducts";
import useOrders from "../../../Hooks/useOrders";
import useWhProducts from "../../../Hooks/useWhProducts";

const FieldEmployeeCard = ({ idx, user, refetch, managerDesignations }) => {
    const [wearhouseProducts] = useWhProducts();
    const [depotProducts] = useDepotProducts();
    const [orderdProducts] = useOrders();

    const nonManager = !managerDesignations.includes(user.designation);

    const uniqueProducts = useMemo(() => {
        const productMap = new Map();

        const addToMap = (product) => {
            const name = (product.productName || product.name)?.trim().toLowerCase();
            const netWeight = product.netWeight?.trim().toLowerCase();
            const key = `${name}|${netWeight}`;

            if (!productMap.has(key)) {
                productMap.set(key, {
                    productName: product.productName || product.name,
                    netWeight: product.netWeight,
                    productCode: product.productCode || "",
                });
            }
        };

        wearhouseProducts?.forEach(addToMap);
        depotProducts?.forEach(addToMap);
        orderdProducts?.forEach(order => {
            order.products?.forEach(addToMap);
        });

        return Array.from(productMap.values());
    }, [wearhouseProducts, depotProducts, orderdProducts]);

    return (
        <>
            <tr>
                <td className='flex justify-center items-center'>
                    {idx}
                </td>
                <td>
                    <div className="font-bold">{user.territory}</div>
                </td>
                <td>
                    {user.name}
                </td>
                <td>
                    {user.designation}
                </td>
                {
                    nonManager
                    &&
                    <td className="text-center">
                        <button
                            onClick={() => handleUpdate()}
                            title="Update Order"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaEdit className="text-yellow-500" />
                        </button>
                    </td>
                }
                <td className='text-right'>
                    {user?.totalTaget || 0}
                </td>
            </tr>
        </>
    );
};

export default FieldEmployeeCard;