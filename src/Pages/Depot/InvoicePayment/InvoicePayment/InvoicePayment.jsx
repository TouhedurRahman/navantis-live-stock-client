import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import Swal from "sweetalert2";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useOrders from "../../../../Hooks/useOrders";
import DuePayment from "../DuePayment/DuePayment";
import OrderInvoice from "../OrderInvoice/OrderInvoice";
import OutstandingPayment from "../OutstandingPayment/OutstandingPayment";
import PaidOrders from "../PaidOrders/PaidOrders";

const InvoicePayment = () => {
    const [orders, , refetch] = useOrders();
    const [activeTab, setActiveTab] = useState("invoice");
    const [showModal, setShowModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");

    const invWiseOrder = orders.find(order => order.invoice === invoiceNumber);

    const renderContent = () => {
        switch (activeTab) {
            case "invoice":
                return <OrderInvoice />;
            case "due":
                return <DuePayment />;
            case "outstanding":
                return <OutstandingPayment />;
            case "paid":
                return <PaidOrders />;
            default:
                return null;
        }
    };

    const updateOrderMutation = useMutation({
        mutationFn: async (data) => {
            const { _id, ...orderData } = data;

            const newStatus = (((parseFloat(orderData?.totalPayable) - parseFloat(orderData?.paid || 0) - parseFloat(paymentAmount))) === 0) ? 'paid' : 'outstanding';

            const updatedOrder = {
                ...orderData,
                paid: parseFloat(parseFloat(orderData?.paid || 0) + parseFloat(paymentAmount)),
                due: parseFloat((parseFloat(orderData?.totalPayable) - parseFloat(orderData?.paid || 0) - parseFloat(paymentAmount)).toFixed(2)),
                status: newStatus
            };

            const response = await axios.patch(`http://localhost:5000/order/${_id}`, updatedOrder)
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating order:", error);
        },
    });

    const handlePayment = async (data) => {
        try {
            await Promise.all([
                updateOrderMutation.mutateAsync(data),
            ]);

            refetch();
            setInvoiceNumber("");
            setPaymentAmount("");
            setShowModal(false);

            let timerInterval;
            Swal.fire({
                title: "Processing Your Payment",
                html: "Hang tight! We're securely completing your transaction.",
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                },
                willClose: () => {
                    clearInterval(timerInterval);
                },
            });
        } catch (error) {
            console.error("Error adding product:", error);
            Swal.fire({
                title: "Error!",
                text: "Faild. Please try again.",
                icon: "error",
                showConfirmButton: false,
                confirmButtonColor: "#d33",
                timer: 1500
            });
        }
    };

    const closeModal = () => {
        setInvoiceNumber("");
        setPaymentAmount("");
        setShowModal(false);
    }

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
                <div className="h-10 flex justify-between items-center p-6">
                    <div className="flex flex-wrap justify-start items-center space-x-4">
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
                    <button
                        className="text-white font-bold py-2 px-6 transition-all transform shadow-md focus:outline-none bg-indigo-500 hover:bg-indigo-700 hover:scale-105 hover:shadow-lg"
                        onClick={() => setShowModal(true)}
                    >
                        Quick Pay
                    </button>
                </div>

                <div className="p-6">
                    {renderContent()}
                </div>

            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] relative overflow-hidden animate-scale-up">
                        {/* Decorative Gradient Corner */}
                        <div className="absolute -top-5 -right-5 w-32 h-32 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 opacity-20 rounded-full"></div>

                        <h2 className="flex justify-center items-center text-2xl font-extrabold text-gray-800 mb-6 text-center tracking-wide">💳 Quick Pay</h2>

                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Invoice Number
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                        />

                        {invWiseOrder?.totalPayable > 0 && (
                            <div className="mt-6 text-gray-700 relative">
                                <div className="mt-4 p-4 rounded-lg border bg-white shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">💳 Total Payable</span>
                                        <span className="text-base font-semibold text-blue-600">
                                            {(Number((Number(invWiseOrder?.totalPayable) || 0).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/- ৳
                                        </span>
                                    </div>
                                    {
                                        invWiseOrder?.paid
                                        &&
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">✅ Total Paid</span>
                                                <span className="text-base font-semibold text-green-500">
                                                    {(Number((Number(invWiseOrder?.paid) || 0).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/- ৳
                                                </span>
                                            </div>
                                        </>
                                    }
                                    {
                                        invWiseOrder?.due > 0
                                        &&
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">🚨 Due Amount</span>
                                                <span className="text-base font-semibold text-red-500">
                                                    {(Number((Number(invWiseOrder?.due) || 0).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/- ৳
                                                </span>
                                            </div>
                                        </>
                                    }
                                </div>

                                {(invWiseOrder?.totalPayable !== invWiseOrder?.paid) ? (
                                    <>
                                        {
                                            (
                                                (invWiseOrder?.paid !== invWiseOrder?.due)
                                            )
                                                ?
                                                <>
                                                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                        Paid Amount
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                        value={paymentAmount}
                                                        onChange={(e) => {
                                                            const inputValue = Number(e.target.value);
                                                            const maxPayment = invWiseOrder?.due;
                                                            setPaymentAmount(inputValue <= maxPayment ? inputValue : maxPayment);
                                                        }}
                                                    />
                                                    <button
                                                        className="mt-4 w-full bg-green-500 text-white py-3 px-5 rounded-xl hover:bg-green-600 transition-all font-semibold text-lg shadow-md"
                                                        onClick={() => handlePayment(invWiseOrder)}
                                                    >
                                                        Make Payment
                                                    </button>
                                                </>
                                                :
                                                <>
                                                    <p className="text-gray-600 font-mono font-extrabold text-center mt-6">
                                                        Not delivered yet.
                                                    </p>
                                                </>
                                        }
                                    </>
                                ) : (
                                    <div className="absolute -mt-[120px] left-1/2 -translate-x-1/2 opacity-30">
                                        <img src="https://i.ibb.co.com/LXF5nsVw/paid-logo.png" alt="Paid Seal" className="w-36 h-36 mx-auto" />
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="mt-6 w-full bg-red-500 text-white py-3 px-5 rounded-xl hover:bg-red-600 transition-all font-semibold text-lg shadow-md"
                            onClick={() => closeModal()}
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