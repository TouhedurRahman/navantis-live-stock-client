import React, { useState } from "react";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import MyCustomer from "../MyCustomer/MyCustomer";
import NewCustomer from "../NewCustomer/NewCustomer";

const CustomerList = () => {
    const [activeTab, setActiveTab] = useState("my customer");

    const renderContent = () => {
        switch (activeTab) {
            case "my customer":
                return <MyCustomer />;
            case "new customer":
                return <NewCustomer />;
            default:
                return null;
        }
    };

    return (
        <>
            <div>
                <PageTitle from={"Customer"} to={"Customer list"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>
                <div className="h-10 flex justify-between items-center p-6">
                    <div className="flex flex-wrap justify-start items-center space-x-4">
                        {[
                            { label: "My Customer", value: "my customer", color: "bg-blue-500", hover: "hover:bg-blue-700" },
                            { label: "New Customer", value: "new customer", color: "bg-red-500", hover: "hover:bg-red-700" }
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

export default CustomerList;