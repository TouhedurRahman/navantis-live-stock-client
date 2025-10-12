import axios from "axios";
import { useState } from "react";
import { FaBullseye, FaCalendarAlt, FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import useApiConfig from "../../../Hooks/useApiConfig";
import useUniqueProducts from "../../../Hooks/useUniqueProducts";

const TerritoriesTargetCard = ({ idx, territory, refetch }) => {
    const [uniqueProducts] = useUniqueProducts();
    const baseUrl = useApiConfig();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targets, setTargets] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date();
    const monthYear = today.toLocaleString("en-US", { month: "long", year: "numeric" }).replace(" ", "-");

    const openModal = () => {
        const initialTargets = uniqueProducts.map(p => {
            const existing = territory?.target?.find(
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

            const { _id, ...territoryData } = territory;

            await axios.patch(`${baseUrl}/tmpoints/${_id}`, {
                ...territoryData,
                targetFor: monthYear,
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
                <td><div className="font-bold">{territory.territory}</div></td>
                <td>{territory.areaManager}</td>
                <td>{territory.zonalManager}</td>
                <td className="text-center">
                    <button
                        onClick={openModal}
                        title="Set Target"
                        className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                    >
                        <FaEdit className="text-yellow-500" />
                    </button>
                </td>
                <td className='text-right'>{territory?.totalTarget || 0}</td>
            </tr>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 rounded-t-xl">
                            <div className="flex-1 text-center">
                                <h2 className="leading-tight">
                                    <span className="block text-[12px] uppercase tracking-wide text-gray-500 font-medium">
                                        Set Target For
                                    </span>
                                    <span className="block text-xl font-semibold text-gray-800 mt-1">
                                        {territory.territory}
                                    </span>
                                </h2>

                                <p className="mt-1 text-sm text-gray-600 flex justify-center items-center gap-4">
                                    <span className="flex justify-center items-center gap-1">
                                        <FaBullseye className="text-yellow-600" />
                                        <span>
                                            <span className="font-medium">Total</span> {territory.totalTarget || 0}
                                        </span>
                                    </span>

                                    <span className="flex justify-center items-center gap-1">
                                        <FaCalendarAlt className="text-gray-500" />
                                        <span>
                                            <span className="font-medium">Set</span> {territory.targetFor || "N/A"}
                                        </span>
                                    </span>
                                </p>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-red-500 transition duration-300 ease-in-out"
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
                        <table className="w-full text-sm mt-2">
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
        </ >
    );
};

export default TerritoriesTargetCard;