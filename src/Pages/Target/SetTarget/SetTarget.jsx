import { useMemo, useState } from "react";
import { FaBullseye } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useTerritories from "../../../Hooks/useTerritories";
import AreasTarget from "../AreasTarget/AreasTarget";
import TerritoriesTarget from "../TerritoriesTarget/TerritoriesTarget";

const SetTarget = () => {
    const [territories, loading, refetch] = useTerritories();
    const [activeTab, setActiveTab] = useState("territories");
    const [modalOpen, setModalOpen] = useState(false);

    const listOfTerritories = useMemo(() => {
        if (!territories?.length) return [];
        return territories
            .filter(t => t.territory !== t.parentTerritory)
            .sort((a, b) => a.territory.localeCompare(b.territory));
    }, [territories]);

    const listOfAreas = useMemo(() => {
        if (!territories?.length) return [];
        return territories
            .filter(t => t.territory === t.parentTerritory)
            .sort((a, b) => a.territory.localeCompare(b.territory));
    }, [territories]);

    const renderContent = () => {
        switch (activeTab) {
            case "territories":
                return <TerritoriesTarget
                    territoriesList={listOfTerritories}
                    loading={loading}
                    refetch={refetch}
                />
            case "areas":
                return <AreasTarget
                    territories={territories}
                    loading={loading}
                />
            default:
                return null;
        }
    };

    const aggregatedProducts = useMemo(() => {
        const productMap = {};

        listOfTerritories.forEach((territory) => {
            (territory.target || []).forEach((product) => {
                const key = product.productName + "-" + product.netWeight;
                if (!productMap[key]) {
                    productMap[key] = { ...product };
                } else {
                    productMap[key].targetQuantity += product.targetQuantity;
                }
            });
        });

        return Object.values(productMap);
    }, [listOfTerritories]);

    return (
        <>
            <PageTitle from={"Fields"} to={"Target"} />
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Set product wise sales target</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 mt-4 space-y-4 md:space-y-0">
                    {/* Tabs */}
                    <div className="flex flex-wrap items-center space-x-4">
                        {[
                            { label: "Territories", value: "territories", color: "bg-blue-500", hover: "hover:bg-blue-700" },
                            { label: "Areas", value: "areas", color: "bg-red-500", hover: "hover:bg-red-700" }
                        ].map((button) => (
                            <button
                                key={button.value}
                                className={`text-white font-bold py-2 px-6 transition-all transform shadow-md focus:ring-4 focus:outline-none ${button.color} ${button.hover} ${activeTab === button.value ? "scale-105 shadow-lg ring-2 ring-gray-300 border-2 border-black rounded-sm" : ""}`}
                                onClick={() => setActiveTab(button.value)}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>

                    {/* Target Summary */}
                    <div className="w-full md:w-96">
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-2 rounded-lg shadow-sm border border-gray-300 gap-3 sm:gap-0">
                            {/* Total Target */}
                            <div className="flex items-center space-x-3">
                                <div className="bg-yellow-400 text-white p-2 rounded-full shadow flex items-center justify-center">
                                    <span className="text-sm">🎯</span>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Total Target</p>
                                    <p className="font-bold text-sm text-gray-800">
                                        {listOfTerritories.reduce((sum, t) => sum + (t.totalTarget || 0), 0)}
                                    </p>
                                </div>
                            </div>

                            {/* View Button */}
                            <div className="flex items-center space-x-3">
                                <p className="text-xs text-center text-gray-600 uppercase tracking-wide">
                                    Product wise<br />Target
                                </p>
                                <button
                                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => setModalOpen(true)}
                                    title="View Product wise Target"
                                >
                                    <FiEye className="text-base" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {renderContent()}
                </div>

                {/* Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 rounded-t-xl">
                                <div className="flex-1 text-center">
                                    <h2 className="leading-tight">
                                        <span className="block text-[12px] uppercase tracking-wide text-gray-500 font-medium">
                                            Product wise Target
                                        </span>
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 flex justify-center items-center gap-4">
                                        <span className="flex justify-center items-center gap-1">
                                            <FaBullseye className="text-yellow-600" />
                                            <span>
                                                <span className="font-medium">Total</span>{" "}
                                                {aggregatedProducts.reduce((sum, p) => sum + (p.targetQuantity || 0), 0)}
                                            </span>
                                        </span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModalOpen(false)}
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

                            {/* Products Table */}
                            <table className="w-full text-sm mt-2">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-1">Product</th>
                                        <th className="text-left py-1 text-center">Net Weight</th>
                                        <th className="text-center py-1">Total Target</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aggregatedProducts.length > 0 ? (
                                        aggregatedProducts.map((product, idx) => (
                                            <tr key={idx} className="border-t hover:bg-gray-50">
                                                <td className="text-left py-1">
                                                    <div className="font-semibold">{product.productName}</div>
                                                    <div className="text-gray-500 text-xs">{product.productCode}</div>
                                                </td>
                                                <td className="py-1 text-center">{product.netWeight}</td>
                                                <td className="py-1 text-center font-semibold">{product.targetQuantity}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4 text-gray-500">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Modal Footer */}
                            <div className="mt-4 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded bg-red-500 hover:bg-red-700 text-white font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SetTarget;