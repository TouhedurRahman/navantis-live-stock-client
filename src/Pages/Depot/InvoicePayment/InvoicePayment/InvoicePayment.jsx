import React, { useState } from "react";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useOrders from "../../../../Hooks/useOrders";
import OrderInvoice from "../OrderInvoice/OrderInvoice";

const DuePayment = () => <div>Due</div>;
const OutstandingPayment = () => <div>Outstanding</div>;
const Paid = () => <div>Paid</div>;

const InvoicePayment = () => {
    const [orders] = useOrders();
    const [activeTab, setActiveTab] = useState("invoice");
    const [showModal, setShowModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");

    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const invWiseOrder = deliveredOrders.find(order => order.invoice === invoiceNumber);

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
                    <button
                        // className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded shadow-md"
                        className={`text-white font-bold py-2 px-6 transition-all transform shadow-md focus:outline-none bg-indigo-500 hover:bg-indigo-700 hover:scale-105 hover:shadow-lg}`}
                        onClick={() => setShowModal(true)}
                    >
                        Quick Payment
                    </button>
                </div>

                <div className="px-6 py-4">
                    {renderContent()}
                </div>

            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">Quick Payment</h2>
                        <label className="block mb-2 text-sm font-medium">Invoice Number:</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                        />

                        {invWiseOrder?.totalPrice > 0 && (
                            <div className="mt-4">
                                <p>Total Payable: <strong>{invWiseOrder?.totalPrice} BDT</strong></p>
                                <p>Total Paid: <strong>{invWiseOrder?.paid || 0} BDT</strong></p>
                                <p>Due Amount: <strong>{invWiseOrder?.due || 0} BDT</strong></p>

                                <label className="block mt-3 text-sm font-medium">Payment Amount:</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                                <button
                                    className="mt-3 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                                // onClick={handlePaymentUpdate}
                                >
                                    Update Payment
                                </button>
                            </div>
                        )}

                        <button
                            className="mt-5 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                            onClick={() => setShowModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default InvoicePayment;