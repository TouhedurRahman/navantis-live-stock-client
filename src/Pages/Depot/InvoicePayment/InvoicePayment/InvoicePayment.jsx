import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useApiConfig from "../../../../Hooks/useApiConfig";
import useOrders from "../../../../Hooks/useOrders";
import DuePayment from "../DuePayment/DuePayment";
import OrderInvoice from "../OrderInvoice/OrderInvoice";
import OutstandingPayment from "../OutstandingPayment/OutstandingPayment";
import PaidOrders from "../PaidOrders/PaidOrders";
import ReturnedOrders from "../ReturnedOrders/ReturnedOrders";

const InvoicePayment = () => {
    const baseUrl = useApiConfig();

    const [orders, , refetch] = useOrders();
    const [activeTab, setActiveTab] = useState("invoice");
    const [showModal, setShowModal] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const [bankName, setBankName] = useState("");
    const [chequeOrAcNo, setChequeOrAcNo] = useState("");

    const bangladeshiBanks = [
        { name: "AB Bank Limited", shortForm: "ABBL" },
        { name: "Agrani Bank Limited", shortForm: "ABL" },
        { name: "Al-Arafah Islami Bank Limited", shortForm: "AAIBL" },
        { name: "Bangladesh Bank", shortForm: "BB" },
        { name: "Bangladesh Development Bank Limited", shortForm: "BDBL" },
        { name: "Bangladesh Krishi Bank", shortForm: "BKB" },
        { name: "Bank Al-Falah", shortForm: "ALFALAH" },
        { name: "Bank Asia Limited", shortForm: "BAL" },
        { name: "BRAC Bank Limited", shortForm: "BBL" },
        { name: "Citibank N.A.", shortForm: "CITI" },
        { name: "City Bank Limited", shortForm: "CBL" },
        { name: "Commercial Bank of Ceylon PLC", shortForm: "CBC" },
        { name: "Community Bank Bangladesh Limited", shortForm: "CBBL" },
        { name: "Dhaka Bank Limited", shortForm: "DBL" },
        { name: "Dutch-Bangla Bank Limited", shortForm: "DBBL" },
        { name: "Eastern Bank Limited", shortForm: "EBL" },
        { name: "EXIM Bank Limited", shortForm: "EXIM" },
        { name: "First Security Islami Bank Limited", shortForm: "FSIBL" },
        { name: "Global Islami Bank Limited", shortForm: "GIBL" },
        { name: "Habib Bank Limited", shortForm: "HBL" },
        { name: "HSBC", shortForm: "HSBC" },
        { name: "ICB Islamic Bank Limited", shortForm: "ICBIBL" },
        { name: "IFIC Bank Limited", shortForm: "IFIC" },
        { name: "Islami Bank Bangladesh Limited", shortForm: "IBBL" },
        { name: "Jamuna Bank Limited", shortForm: "JAMBL" },
        { name: "Janata Bank Limited", shortForm: "JBL" },
        { name: "Mercantile Bank Limited", shortForm: "MBL" },
        { name: "Midland Bank Limited", shortForm: "MDBL" },
        { name: "Modhumoti Bank Limited", shortForm: "MMBL" },
        { name: "Mutual Trust Bank Limited", shortForm: "MTB" },
        { name: "National Bank Limited", shortForm: "NBL" },
        { name: "National Bank of Pakistan", shortForm: "NBP" },
        { name: "National Credit & Commerce Bank Limited", shortForm: "NCCBL" },
        { name: "NRB Commercial Bank Limited", shortForm: "NRBC" },
        { name: "One Bank Limited", shortForm: "OBL" },
        { name: "Premier Bank Limited", shortForm: "PBL" },
        { name: "Prime Bank Limited", shortForm: "PrBL" },
        { name: "Probashi Kallyan Bank", shortForm: "PKB" },
        { name: "Pubali Bank Limited", shortForm: "PuBL" },
        { name: "Rajshahi Krishi Unnayan Bank", shortForm: "RKUB" },
        { name: "Rupali Bank Limited", shortForm: "RBL" },
        { name: "Shahjalal Islami Bank Limited", shortForm: "SJIBL" },
        { name: "Shimanto Bank Limited", shortForm: "SHBL" },
        { name: "Social Islami Bank Limited", shortForm: "SIBL" },
        { name: "Sonali Bank Limited", shortForm: "SBL" },
        { name: "South Bangla Agriculture and Commerce Bank Limited", shortForm: "SBAC" },
        { name: "Southeast Bank Limited", shortForm: "SEBL" },
        { name: "Standard Bank Limited", shortForm: "StBL" },
        { name: "Standard Chartered Bank", shortForm: "SCB" },
        { name: "State Bank of India", shortForm: "SBI" },
        { name: "Trust Bank Limited", shortForm: "TBL" },
        { name: "Uttara Bank Limited", shortForm: "UTBL" },
        { name: "Union Bank Limited", shortForm: "UBL" },
        { name: "United Commercial Bank PLC", shortForm: "UCBL" },
        { name: "Woori Bank", shortForm: "WOORI" }
    ];

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
            case "returned":
                return <ReturnedOrders />;
            default:
                return null;
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const updateOrderMutation = useMutation({
        mutationFn: async (data) => {
            const { _id, payments = [], ...orderData } = data;

            /* const newStatus = (((parseFloat(orderData?.totalPayable) - parseFloat(orderData?.paid || 0) - parseFloat(paymentAmount))) === 0) ? 'paid' : 'outstanding'; */

            const difference = parseFloat(orderData?.totalPayable) - parseFloat(orderData?.paid || 0) - parseFloat(paymentAmount);
            const newStatus = (difference > -1 && difference < 1) ? 'paid' : 'outstanding';


            const today = getTodayDate();
            const currentPayable = parseFloat(orderData?.due || 0);
            const currentDue = parseFloat((orderData?.due - paymentAmount) || 0);
            let updatedPayments = [...payments];

            const existingIndex = payments.findIndex(
                p =>
                    p.paymentType === paymentType
                    &&
                    p.paidDate === today
            );

            if (existingIndex !== -1) {
                const existingPayment = payments[existingIndex];
                const updatedAmount = parseFloat(existingPayment.paid) + parseFloat(paymentAmount);

                if (updatedAmount === 0) {
                    updatedPayments.splice(existingIndex, 1);
                } else {
                    updatedPayments[existingIndex] = {
                        ...existingPayment,
                        paid: updatedAmount,
                        totalDue: currentDue
                    };
                }
            } else {
                if (paymentType === "Cheque") {
                    updatedPayments.push({
                        totalPayable: currentPayable,
                        paid: paymentAmount,
                        totalDue: currentDue,
                        paymentType: paymentType,
                        bankName,
                        chequeNo: chequeOrAcNo,
                        paidDate: today,
                    });
                } else if (paymentType === "BEFTN") {
                    updatedPayments.push({
                        totalPayable: currentPayable,
                        paid: paymentAmount,
                        totalDue: currentDue,
                        paymentType: paymentType,
                        bankName,
                        accountNo: chequeOrAcNo,
                        paidDate: today,
                    });
                } else {
                    updatedPayments.push({
                        totalPayable: currentPayable,
                        paid: paymentAmount,
                        totalDue: currentDue,
                        paymentType: paymentType,
                        paidDate: today,
                    });
                }
            };

            const updatedOrder = {
                ...orderData,
                paid: parseFloat(parseFloat(orderData?.paid || 0) + parseFloat(paymentAmount)),
                due: parseFloat((parseFloat(orderData?.totalPayable) - parseFloat(orderData?.paid || 0) - parseFloat(paymentAmount)).toFixed(2)),
                status: newStatus,
                payments: updatedPayments
            };

            const response = await axios.patch(`${baseUrl}/order/${_id}`, updatedOrder)
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating order:", error);
        },
    });

    const addOrderPaymentMutation = useMutation({
        mutationFn: async (data) => {
            const { _id, ...orderData } = data;

            const currentPaid = parseFloat(orderData?.paid || 0);
            const totalPayable = parseFloat(orderData?.totalPayable);
            const payment = parseFloat(paymentAmount);

            const updatedPaid = parseFloat(currentPaid + payment);
            const updatedDue = parseFloat((totalPayable - updatedPaid).toFixed(2));

            const newStatus = updatedDue === 0 ? 'paid' : 'due';

            const newPayment = {
                email: orderData.email,
                orderedBy: orderData.orderedBy,
                areaManager: orderData.areaManager,
                zonalManager: orderData.zonalManager,
                territory: orderData.territory,
                pharmacy: orderData.pharmacy,
                invoice: orderData.invoice,
                totalPayable: orderData.totalPayable,
                paid: updatedPaid,
                due: updatedDue,
                status: newStatus,
                paymentAmount: payment,
                paidDate: getTodayDate(),
            };

            const response = await axios.post(`${baseUrl}/payments`, newPayment);
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
                addOrderPaymentMutation.mutateAsync(data)
            ]);

            refetch();
            setInvoiceNumber("");
            setPaymentAmount("");
            setBankName("");
            setChequeOrAcNo("");
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
        setPaymentType("");
        setBankName("");
        setChequeOrAcNo("");
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
                            { label: "Returned", value: "returned", color: "bg-orange-500", hover: "hover:bg-orange-700" },
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
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] relative overflow-hidden animate-scale-up max-h-[80vh] overflow-y-auto">
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
                        {
                            invWiseOrder?.totalPayable > 0
                                ?
                                (
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
                                        {
                                            (invWiseOrder?.totalPayable !== invWiseOrder?.paid)
                                                ?
                                                (
                                                    <>
                                                        {
                                                            (
                                                                // (invWiseOrder?.paid !== invWiseOrder?.due)
                                                                (["due", "outstanding"].includes(invWiseOrder.status))
                                                            )
                                                                ?
                                                                <>
                                                                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                        Paid Amount
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        required
                                                                        className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                        value={paymentAmount}
                                                                        onChange={(e) => {
                                                                            const inputValue = Number(e.target.value);
                                                                            const maxPayment = invWiseOrder?.due;
                                                                            setPaymentAmount(inputValue <= maxPayment ? inputValue : maxPayment);
                                                                        }}
                                                                        onWheel={(e) => e.target.blur()}
                                                                    />

                                                                    <div className="col-span-1 md:col-span-2">
                                                                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Payment Type</label>
                                                                        <select
                                                                            required
                                                                            value={paymentType}
                                                                            onChange={(e) => setPaymentType(e.target.value)}
                                                                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                        >
                                                                            <option value="">Select Payment Type</option>
                                                                            {
                                                                                ["Cash", "STC"].includes(invWiseOrder.payMode)
                                                                                &&
                                                                                <option value="Cash">Cash</option>
                                                                            }
                                                                            {
                                                                                invWiseOrder.payMode === "Credit"
                                                                                &&
                                                                                <option value="Cheque">Cheque</option>
                                                                            }
                                                                            {
                                                                                invWiseOrder.payMode === "Credit"
                                                                                &&
                                                                                <option value="BEFTN">BEFTN</option>
                                                                            }
                                                                            {
                                                                                ["Cash", "STC"].includes(invWiseOrder.payMode)
                                                                                &&
                                                                                <option value="Bank">Bank</option>
                                                                            }
                                                                        </select>
                                                                    </div>
                                                                    {
                                                                        (
                                                                            invWiseOrder.payMode === "Credit"
                                                                            && ["Cheque", "BEFTN"].includes(paymentType)
                                                                        )
                                                                        &&
                                                                        <>
                                                                            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                Bank Name
                                                                            </label>
                                                                            <select
                                                                                required
                                                                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                value={bankName}
                                                                                onChange={(e) => setBankName(e.target.value)}
                                                                            >
                                                                                <option value="" disabled>Select a bank</option>
                                                                                {bangladeshiBanks.map((bank, index) => (
                                                                                    <option key={index} value={bank.name}>
                                                                                        {bank.name} - {bank.shortForm}
                                                                                    </option>
                                                                                ))}
                                                                            </select>

                                                                            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                {
                                                                                    paymentType === "Cheque"
                                                                                        ?
                                                                                        "Cheque Number"
                                                                                        :
                                                                                        "Account Number"
                                                                                }
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                required
                                                                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                value={chequeOrAcNo}
                                                                                onChange={(e) => setChequeOrAcNo(e.target.value)}
                                                                                onWheel={(e) => e.target.blur()}
                                                                            />
                                                                        </>
                                                                    }
                                                                    <button
                                                                        className="mt-4 w-full bg-green-500 text-white py-3 px-5 rounded-xl hover:bg-green-600 transition-all font-semibold text-lg shadow-md"
                                                                        onClick={() => {
                                                                            if (!paymentAmount && !paymentType) {
                                                                                Swal.fire({
                                                                                    icon: 'error',
                                                                                    title: 'Missing Fields',
                                                                                    text: 'Please enter a paid amount and select a payment type.',
                                                                                });
                                                                                return;
                                                                            }

                                                                            if (!paymentAmount) {
                                                                                Swal.fire({
                                                                                    icon: 'error',
                                                                                    title: 'Missing Paid Amount',
                                                                                    text: 'Please enter the paid amount before proceeding.',
                                                                                });
                                                                                return;
                                                                            }

                                                                            if (!paymentType) {
                                                                                Swal.fire({
                                                                                    icon: 'error',
                                                                                    title: 'Missing Payment Type',
                                                                                    text: 'Please select a payment type before proceeding.',
                                                                                });
                                                                                return;
                                                                            }

                                                                            if (["Cheque", "BEFTN"].includes(paymentType) && !bankName) {
                                                                                Swal.fire({
                                                                                    icon: 'error',
                                                                                    title: 'Missing Bank Name',
                                                                                    text: 'Please enter bank name before proceeding.',
                                                                                });
                                                                                return;
                                                                            }

                                                                            if (["Cheque", "BEFTN"].includes(paymentType) && !chequeOrAcNo) {
                                                                                Swal.fire({
                                                                                    icon: 'error',
                                                                                    title: 'Missing Cheque',
                                                                                    text: 'Please enter Cheque/AC no. before proceeding.',
                                                                                });
                                                                                return;
                                                                            }
                                                                            handlePayment(invWiseOrder);
                                                                        }}
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
                                                )
                                                :
                                                (
                                                    <div className="absolute -mt-[120px] left-1/2 -translate-x-1/2 opacity-30">
                                                        <img src="https://i.ibb.co.com/LXF5nsVw/paid-logo.png" alt="Paid Seal" className="w-36 h-36 mx-auto" />
                                                    </div>
                                                )
                                        }
                                    </div>
                                )
                                :
                                (
                                    invoiceNumber !== ""
                                    &&
                                    <p className="text-gray-600 font-mono font-extrabold text-center mt-6">
                                        All products returned.
                                    </p>
                                )
                        }
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