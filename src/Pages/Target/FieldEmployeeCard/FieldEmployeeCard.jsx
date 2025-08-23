import axios from "axios";
import { useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import useApiConfig from "../../../Hooks/useApiConfig";
import useDepotProducts from "../../../Hooks/useDepotProducts";
import useOrders from "../../../Hooks/useOrders";
import useTerritories from "../../../Hooks/useTerritories";
import useWhProducts from "../../../Hooks/useWhProducts";

const FieldEmployeeCard = ({ idx, user, managerDesignations }) => {
    const [wearhouseProducts] = useWhProducts();
    const [depotProducts] = useDepotProducts();
    const [orderdProducts] = useOrders();
    const baseUrl = useApiConfig();

    const [territories, , refetch] = useTerritories();

    const userTerritory = territories?.find(t => t.territory === user?.territory);

    const nonManager = !managerDesignations.includes(user.designation);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targets, setTargets] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        return Array.from(productMap.values()).sort((a, b) =>
            a.productName.localeCompare(b.productName)
        );
    }, [wearhouseProducts, depotProducts, orderdProducts]);

    const openModal = () => {
        const initialTargets = uniqueProducts.map(p => {
            const existing = userTerritory?.target?.find(
                t => t.productName === p.productName && t.netWeight === p.netWeight
            );
            return {
                ...p,
                targetQuantity: existing?.targetQuantity || 0
            };
        });
        setTargets(initialTargets);
        setIsModalOpen(true);
    };

    const handleChange = (index, value) => {
        const updated = [...targets];
        updated[index].targetQuantity = Number(value);
        setTargets(updated);
    };

    const handleSaveTargets = async () => {
        setIsSubmitting(true);
        try {
            const totalTarget = targets.reduce((sum, product) => sum + Number(product.targetQuantity || 0), 0);

            /* const { _id, ...userData } = user;

            await axios.patch(`${baseUrl}/user/${user.email}`, {
                ...userData,
                target: targets,
                totalTarget
            }); */

            const { _id, ...territoryData } = userTerritory;

            await axios.patch(`${baseUrl}/tmpoints/${_id}`, {
                ...territoryData,
                target: targets,
                totalTarget
            });

            Swal.fire({
                icon: "success",
                title: "Target successfully updated.",
                timer: 1500,
                showConfirmButton: false,
            });
            setIsModalOpen(false);
            refetch();
            setIsSubmitting(false);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed to update target",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    }

    return (
        <>
            <tr>
                <td className='flex justify-center items-center'>{idx}</td>
                <td><div className="font-bold">{user.territory}</div></td>
                <td>{user.name}</td>
                <td>{user.designation}</td>
                {nonManager && (
                    <td className="text-center">
                        <button
                            onClick={openModal}
                            title="Set Target"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaEdit className="text-yellow-500" />
                        </button>
                    </td>
                )}
                <td className='text-right'>{userTerritory?.totalTarget || 0}</td>
            </tr>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 text-center">
                            <div className="text-center">
                                <h2 className="leading-snug">
                                    <span className="text-xs text-gray-500 font-thin">SET TARGET FOR</span><br />
                                    <span className="text-xl font-semibold text-gray-800">{user.name}</span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">{user.designation} | {user.territory}</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-red-500 transition duration-200"
                                aria-label="Close"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-1">Product Name</th>
                                    <th className="text-left py-1 text-center">Net Weight</th>
                                    <th className="text-center py-1 text-center">Target Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {targets.map((product, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="text-left py-1">
                                            <div className="font-semibold">{product.productName}</div>
                                            <div className="text-gray-500 text-xs">{product.productCode}</div>
                                        </td>
                                        <td className="py-1 text-center">{product.netWeight}</td>
                                        <td className="py-1 text-center">
                                            <input
                                                type="number"
                                                className="border px-2 py-1 rounded w-20 text-right focus:text-center"
                                                value={product.targetQuantity !== 0 && product.targetQuantity}
                                                min={0}
                                                onChange={(e) => handleChange(index, e.target.value)}
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 flex justify-center items-center gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded bg-red-500 hover:bg-red-700 text-white font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTargets}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded bg-green-500 hover:bg-green-700 text-white font-bold"
                            >
                                {isSubmitting ? "Saving..." : "Save Target"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FieldEmployeeCard;