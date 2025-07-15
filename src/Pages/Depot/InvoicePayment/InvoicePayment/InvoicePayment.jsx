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
    const [cashAmount, setCashAmount] = useState("");
    const [bankAmount, setBankAmount] = useState("");
    const [chequeOrBeftnAmount, setChequeOrBeftnAmount] = useState("");
    const [tdsAmount, setTdsAmount] = useState("");
    const [payments, setPayments] = useState([]);

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
            const today = getTodayDate();

            const totalNewPayment = payments.reduce((sum, p) => sum + parseFloat(p.paid || 0), 0);

            const updatedPaid = parseFloat(orderData?.paid || 0) + totalNewPayment;
            const updatedDue = parseFloat((orderData?.totalPayable - updatedPaid).toFixed(2));
            const newStatus = updatedDue === 0 ? "paid" : "outstanding";

            const updatedPayments = payments.map(p => ({
                ...p,
                totalPayable: orderData?.totalPayable,
                totalDue: updatedDue,
                paidDate: today,
            }));

            const finalPayments = [...(orderData.payments || []), ...updatedPayments];

            const updatedOrder = {
                ...orderData,
                paid: updatedPaid,
                due: updatedDue,
                status: newStatus,
                payments: finalPayments,
            };

            const response = await axios.patch(`${baseUrl}/order/${_id}`, updatedOrder);
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

    const handlePayment = async (dataWithPayments) => {
        try {
            await Promise.all([
                updateOrderMutation.mutateAsync(dataWithPayments),
                addOrderPaymentMutation.mutateAsync(dataWithPayments)
            ]);

            setInvoiceNumber("");
            setPaymentAmount("");
            setPaymentType("");
            setBankName("");
            setChequeOrAcNo("");
            setCashAmount("");
            setBankAmount("");
            setChequeOrBeftnAmount("");
            setTdsAmount("");
            setPayments([]);
            setShowModal(false);

            refetch();

            Swal.fire({
                title: "Processing Your Payment",
                html: "Hang tight! We're securely completing your transaction.",
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => Swal.showLoading(),
            });

        } catch (error) {
            console.error("Error adding product:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed. Please try again.",
                icon: "error",
                showConfirmButton: false,
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
        setCashAmount("");
        setBankAmount("");
        setChequeOrBeftnAmount("");
        setTdsAmount("");
        setPayments([]);
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
                                                                (["due", "outstanding"].includes(invWiseOrder.status))
                                                            )
                                                                ?
                                                                <>
                                                                    {
                                                                        ["Cash", "STC"].includes(invWiseOrder.payMode) ? (
                                                                            <>
                                                                                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                    Payment Type
                                                                                </label>
                                                                                <select
                                                                                    value={paymentType}
                                                                                    onChange={(e) => setPaymentType(e.target.value)}
                                                                                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                    required
                                                                                >
                                                                                    <option value="">Select Payment Type</option>
                                                                                    <option value="Bank">Bank</option>
                                                                                    <option value="Cash">Cash</option>
                                                                                    <option value="Both">Bank & Cash</option>
                                                                                </select>

                                                                                {
                                                                                    ["Bank", "Both"].includes(paymentType)
                                                                                    &&
                                                                                    <>
                                                                                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Bank Amount</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                            value={bankAmount}
                                                                                            onChange={(e) => setBankAmount(Number(e.target.value))}
                                                                                            onWheel={(e) => e.target.blur()}
                                                                                        />
                                                                                    </>

                                                                                }

                                                                                {
                                                                                    ["Cash", "Both"].includes(paymentType)
                                                                                    &&
                                                                                    <>
                                                                                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Cash Amount</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                            value={cashAmount}
                                                                                            onChange={(e) => setCashAmount(Number(e.target.value))}
                                                                                            onWheel={(e) => e.target.blur()}
                                                                                        />
                                                                                    </>
                                                                                }
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                    Payment Type
                                                                                </label>
                                                                                <select
                                                                                    value={paymentType}
                                                                                    onChange={(e) => setPaymentType(e.target.value)}
                                                                                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                    required
                                                                                >
                                                                                    <option value="">Select Payment Type</option>
                                                                                    <option value="Cheque">Cheque</option>
                                                                                    <option value="BEFTN">BEFTN</option>
                                                                                </select>

                                                                                {
                                                                                    paymentType === "Cheque"
                                                                                        ?
                                                                                        <>
                                                                                            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                                Cheque Amount
                                                                                            </label>
                                                                                            <input
                                                                                                type="number"
                                                                                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                                value={chequeOrBeftnAmount}
                                                                                                onChange={(e) => setChequeOrBeftnAmount(Number(e.target.value))}
                                                                                                onWheel={(e) => e.target.blur()}
                                                                                            />
                                                                                        </>
                                                                                        :
                                                                                        paymentType === "BEFTN"
                                                                                            ?
                                                                                            <>
                                                                                                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                                    BEFTN Amount
                                                                                                </label>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                                    value={chequeOrBeftnAmount}
                                                                                                    onChange={(e) => setChequeOrBeftnAmount(Number(e.target.value))}
                                                                                                    onWheel={(e) => e.target.blur()}
                                                                                                />
                                                                                            </>
                                                                                            :
                                                                                            ""
                                                                                }

                                                                                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Bank Name</label>
                                                                                <select
                                                                                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                    value={bankName}
                                                                                    onChange={(e) => setBankName(e.target.value)}
                                                                                    required
                                                                                >
                                                                                    <option value="">Select a bank</option>
                                                                                    {bangladeshiBanks.map((bank, index) => (
                                                                                        <option key={index} value={bank.name}>
                                                                                            {bank.name} - {bank.shortForm}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>

                                                                                {
                                                                                    paymentType === "Cheque"
                                                                                        ?
                                                                                        <>
                                                                                            <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                                Cheque Number
                                                                                            </label>
                                                                                            <input
                                                                                                type="number"
                                                                                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                                value={chequeOrAcNo}
                                                                                                onChange={(e) => setChequeOrAcNo(e.target.value)}
                                                                                                onWheel={(e) => e.target.blur()}
                                                                                                required
                                                                                            />
                                                                                        </>
                                                                                        :
                                                                                        paymentType === "BEFTN"
                                                                                            ?
                                                                                            <>
                                                                                                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                                                                                                    Account Number
                                                                                                </label>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                                    value={chequeOrAcNo}
                                                                                                    onChange={(e) => setChequeOrAcNo(e.target.value)}
                                                                                                    onWheel={(e) => e.target.blur()}
                                                                                                    required
                                                                                                />
                                                                                            </>
                                                                                            :
                                                                                            ""
                                                                                }

                                                                                <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">TDS Amount</label>
                                                                                <input
                                                                                    type="number"
                                                                                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                                                    value={tdsAmount}
                                                                                    onChange={(e) => setTdsAmount(Number(e.target.value))}
                                                                                    onWheel={(e) => e.target.blur()}
                                                                                    required
                                                                                />
                                                                            </>
                                                                        )
                                                                    }

                                                                    <button
                                                                        className="mt-4 w-full bg-green-500 text-white py-3 px-5 rounded-xl hover:bg-green-600 transition-all font-semibold text-lg shadow-md"
                                                                        onClick={() => {
                                                                            const totalPayable = parseFloat(invWiseOrder?.totalPayable);

                                                                            let totalPaid = 0;
                                                                            let paymentsToSet = [];

                                                                            if (["Cash", "STC"].includes(invWiseOrder.payMode)) {
                                                                                totalPaid = (parseFloat(cashAmount) || 0) + (parseFloat(bankAmount) || 0);

                                                                                if (totalPaid !== totalPayable) {
                                                                                    return Swal.fire("Invalid Payment", `Total payment must be equal ${totalPayable}/-`, "error");
                                                                                }

                                                                                if (bankAmount > 0) {
                                                                                    paymentsToSet.push({
                                                                                        paymentType: "Bank",
                                                                                        paid: bankAmount,
                                                                                        paidDate: getTodayDate(),
                                                                                    });
                                                                                }

                                                                                if (cashAmount > 0) {
                                                                                    paymentsToSet.push({
                                                                                        paymentType: "Cash",
                                                                                        paid: cashAmount,
                                                                                        paidDate: getTodayDate(),
                                                                                    });
                                                                                }

                                                                                setPaymentType("Cash");
                                                                                setPaymentAmount(totalPaid);

                                                                            } else if (invWiseOrder.payMode === "Credit") {
                                                                                if (tdsAmount <= 0) {
                                                                                    return Swal.fire("Invalid TDS", "TDS amount must be greater than 0", "error");
                                                                                }

                                                                                totalPaid = parseFloat(chequeOrBeftnAmount) + parseFloat(tdsAmount);

                                                                                if (totalPaid !== totalPayable) {
                                                                                    return Swal.fire("Invalid Payment", `Total (Cheque/BEFTN + TDS) must be equal ${totalPayable}/-`, "error");
                                                                                }

                                                                                if (chequeOrBeftnAmount > 0) {
                                                                                    const base = {
                                                                                        paymentType: paymentType,
                                                                                        paid: chequeOrBeftnAmount,
                                                                                        paidDate: getTodayDate(),
                                                                                        bankName,
                                                                                    };
                                                                                    base[paymentType === "Cheque" ? "chequeNo" : "accountNo"] = chequeOrAcNo;
                                                                                    paymentsToSet.push(base);
                                                                                }

                                                                                if (tdsAmount > 0) {
                                                                                    paymentsToSet.push({
                                                                                        paymentType: "TDS",
                                                                                        paid: tdsAmount,
                                                                                        paidDate: getTodayDate(),
                                                                                    });
                                                                                }

                                                                                setPaymentAmount(chequeOrBeftnAmount);
                                                                            }

                                                                            setPayments(paymentsToSet);
                                                                            handlePayment({ ...invWiseOrder, payments: paymentsToSet });
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