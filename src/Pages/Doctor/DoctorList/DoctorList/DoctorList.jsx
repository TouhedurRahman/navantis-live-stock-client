import { useState } from "react";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import MyDoctor from "../MyDoctor/MyDoctor";
import NewDoctor from "../NewDoctor/NewDoctor";

const DoctorList = () => {
    const [activeTab, setActiveTab] = useState("my doctor");

    const renderContent = () => {
        switch (activeTab) {
            case "my doctor":
                return <MyDoctor />;
            case "new doctor":
                return <NewDoctor />;
            default:
                return null;
        }
    };

    return (
        <>
            <div>
                <PageTitle from={"Doctor"} to={"Doctor list"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>
                <div className="h-10 flex justify-between items-center p-6">
                    <div className="flex flex-wrap justify-start items-center space-x-4">
                        {[
                            { label: "My Doctor", value: "my doctor", color: "bg-blue-500", hover: "hover:bg-blue-700" },
                            { label: "New Doctor", value: "new doctor", color: "bg-red-500", hover: "hover:bg-red-700" }
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

export default DoctorList;