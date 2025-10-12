import { useMemo, useState } from "react";
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
                <div className="h-10 flex justify-between items-center p-6">
                    <div className="flex flex-wrap justify-start items-center space-x-4">
                        {[
                            { label: "Territories", value: "territories", color: "bg-blue-500", hover: "hover:bg-blue-700" },
                            { label: "Areas", value: "areas", color: "bg-red-500", hover: "hover:bg-red-700" }
                        ].map((button) => (
                            <button
                                key={button.value}
                                className={`text-white font-bold py-2 px-6 transition-all transform shadow-md focus:ring-4 focus:outline-none ${button.color} ${button.hover} ${activeTab === button.value ? "scale-105 shadow-lg ring-2 ring-gray-300 border-2 border-black rounded-sm" : ""
                                    }`}
                                onClick={() => setActiveTab(button.value)}
                            >
                                {button.label}
                            </button>
                        ))}
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