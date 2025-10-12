import { useMemo, useState } from "react";
import { FiEye } from "react-icons/fi";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useTerritories from "../../../Hooks/useTerritories";
import AreasTarget from "../AreasTarget/AreasTarget";
import TerritoriesTarget from "../TerritoriesTarget/TerritoriesTarget";

const SetTarget = () => {
    const [territories, loading, refetch] = useTerritories();
    const [activeTab, setActiveTab] = useState("territories");

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

    return (
        <>
            <div>
                <PageTitle from={"Fields"} to={"Target"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Set product wise sales target</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 mt-4 space-y-4 md:space-y-0">
                    {/* Tab  */}
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
                        <div className="flex flex-row items-center justify-between bg-gray-100 p-2 rounded-lg shadow-sm border border-gray-300">
                            {/* Total Target */}
                            <div className="flex items-center space-x-3">
                                <div className="bg-yellow-400 text-white p-2 rounded-full shadow flex items-center justify-center">
                                    <span className="text-sm">🎯</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Total Target</p>
                                    <p className="font-bold text-sm text-gray-800">
                                        {listOfTerritories.reduce((sum, t) => sum + (t.totalTarget || 0), 0)}
                                    </p>
                                </div>
                            </div>

                            {/* View Button */}
                            <div className="flex items-center space-x-3">
                                {/* Label on left */}
                                <p className="text-xs text-center text-gray-600 uppercase tracking-wide">Product wise<br />Target</p>

                                {/* Eye Icon Button */}
                                <button
                                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => {
                                        alert("Product-wise target view clicked!");
                                    }}
                                    title="View Product-wise Target"
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
            </div>
        </>
    );
};

export default SetTarget;