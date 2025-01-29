import React, { useState } from "react";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import OrderInvoice from "../OrderInvoice/OrderInvoice";

const DuePayment = () => <div>Due</div>;
const OutstandingPayment = () => <div>Outstanding</div>;
const Paid = () => <div>Paid</div>;

const InvoicePayment = () => {
    const [activeTab, setActiveTab] = useState("invoice");

    const renderContent = () => {
        switch (activeTab) {
            case "invoice":
                return <OrderInvoice />;
            case "due":
                return <DuePayment />;
            case "outstanding":
                return <OutstandingPayment />;
            case "paid":
                return <Paid />;
            default:
                return null;
        }
    };

    return (
        <>
            <div>
                <PageTitle from={"Depot"} to={"Invoice payment"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>

                <div className="h-16 flex flex-wrap justify-start items-center space-x-4 mb-6 px-6">
                    {[
                        { label: "Invoice", value: "invoice", color: "bg-blue-500", hover: "hover:bg-blue-700" },
                        { label: "DUE", value: "due", color: "bg-red-500", hover: "hover:bg-red-700" },
                        { label: "Outstanding", value: "outstanding", color: "bg-yellow-500", hover: "hover:bg-yellow-700" },
                        { label: "Paid", value: "paid", color: "bg-green-500", hover: "hover:bg-green-700" },
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

                <div className="px-6 py-4">
                    {renderContent()}
                </div>

            </div>
        </>
    );
};

export default InvoicePayment;