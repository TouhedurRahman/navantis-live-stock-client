import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { FileText, Package } from "lucide-react";
import { useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import useApiConfig from "../../../Hooks/useApiConfig";
import useAuth from "../../../Hooks/useAuth";
import useSingleUser from "../../../Hooks/useSingleUser";

const CustomerRequestCard = ({ idx, customer, refetch }) => {
    const { user } = useAuth();
    const baseUrl = useApiConfig();
    const [singleUser] = useSingleUser();
    const [isModalOpen, setModalOpen] = useState(false);

    /* const statusType = JSON.stringify(customer.payMode) === JSON.stringify(["Cash", "STC"])
        ? customer.status === "pending"
            ? "initialized"
            : "approved"
        : JSON.stringify(customer.payMode) === JSON.stringify(["Credit"])
            ? customer.status === "pending"
                ? "initialized"
                : customer.status === "initialized"
                    ? "requested"
                    : "approved"
            : "approved" */

    /* const statusType = JSON.stringify(customer.payMode) === JSON.stringify(["Cash", "STC"])
        ? customer.status === "pending"
            ? "initialized"
            : customer.status === "initialized"
                ? "requested"
                : "approved"
        : JSON.stringify(customer.payMode) === JSON.stringify(["Credit"])
            ? customer.status === "pending"
                ? "initialized"
                : customer.status === "initialized"
                    ? "requested"
                    : "approved"
            : JSON.stringify(customer.payMode) === JSON.stringify(["SpIC"])
                ? customer.status === "pending"
                    ? "initialized"
                    : customer.status === "initialized"
                        ? "requested"
                        : "approved"
                : "approved"; */

    const hasGrandParent = customer.grandParentId !== undefined && customer.grandParentId !== null;

    const statusType =
        JSON.stringify(customer.payMode) === JSON.stringify(["Cash"]) ||
            JSON.stringify(customer.payMode) === JSON.stringify(["Cash", "STC"]) ||
            JSON.stringify(customer.payMode) === JSON.stringify(["Credit"]) ||
            JSON.stringify(customer.payMode) === JSON.stringify(["SpIC"])
            ? customer.status === "pending"
                ? hasGrandParent
                    ? "initialized"
                    : "requested"
                : customer.status === "initialized"
                    ? "requested"
                    : "approved"
            : "approved";

    const approvedCustomerMutation = useMutation({
        mutationFn: async () => {
            const updatedCustomer = {
                ...customer,
                status: statusType,
                approvedBy: singleUser?.name,
                approvedEmail: user?.email
            }
            const response = await axios.patch(`${baseUrl}/customer-status/${customer._id}`, updatedCustomer);
            return response.data;
        },
        onError: (error) => {
            console.error("Error approved customer request:", error);
        }
    })

    const deniedCustomerMutation = useMutation({
        mutationFn: async () => {
            const updatedCustomer = {
                ...customer,
                status: 'denied'
            }
            const response = await axios.patch(`${baseUrl}/customer-status/${customer._id}`, updatedCustomer);
            return response.data;
        },
        onError: (error) => {
            console.error("Error denied customer request:", error);
        }
    });

    const handleApprove = async () => {
        try {
            await Promise.all([
                approvedCustomerMutation.mutateAsync()
            ]);

            refetch();
            Swal.fire({
                title: "Success!",
                text: "Request approved.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Error approved request:", error);
            alert("Failed to stock in.");
        }
    }

    const handleDeny = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, deny!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        deniedCustomerMutation.mutateAsync()
                    ]);

                    refetch();
                    Swal.fire({
                        title: "Success!",
                        text: "Request Denied.",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    console.error("Error denied request:", error);
                    alert("Failed to stock in.");
                }
            }
        });
    };

    return (
        <>
            <tr>
                <td className="text-center">{idx}</td>
                <td><div className="font-bold">{customer.name}</div></td>
                <td>{customer.address}</td>
                <td className="text-center">{customer.territory}</td>
                <td>{customer.addedBy}</td>
                <td className="text-center">
                    {new Date(customer.date).toISOString().split("T")[0].split("-").reverse().join("-")}
                </td>
                <td className="text-center">
                    <button
                        onClick={() => setModalOpen(true)}
                        title="Details"
                        className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                    >
                        <FaEye className="text-orange-500" />
                    </button>
                </td>
                <td className="text-center">
                    <button
                        onClick={handleDeny}
                        title="Deny Request"
                        className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                    >
                        <FaTimes className="text-red-500" />
                    </button>
                </td>
            </tr>

            {/* Modal */}
            {isModalOpen && customer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5 flex flex-col"
                        style={{ maxHeight: '90%' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Customer Details</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                aria-label="Close modal"
                                className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-2 flex-1 overflow-y-auto">
                            <table className="w-full border-collapse overflow-hidden">
                                <div className="p-2 w-full max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        {/* Total Invoices */}
                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 text-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300">
                                            <div>
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                                                    Total Invoices
                                                </h3>
                                                <p className="text-xl font-bold mt-1 text-gray-900">
                                                    {customer.totalInvoices || 0}
                                                </p>
                                            </div>
                                            <div className="text-gray-500">
                                                <FileText size={36} />
                                            </div>
                                        </div>

                                        {/* Sales Unit */}
                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 text-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300">
                                            <div>
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                                                    Sales Unit
                                                </h3>
                                                <p className="text-xl font-bold mt-1 text-gray-900">
                                                    {customer.salesUnit?.toLocaleString("en-IN") || 0}
                                                </p>
                                            </div>
                                            <div className="text-gray-500">
                                                <Package size={36} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden border border-gray-200 rounded-xl">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {[
                                                    { label: "Name", value: customer.name },
                                                    { label: "Area", value: customer.parentTerritory },
                                                    { label: "Territory", value: customer.territory },
                                                    { label: "Market Point", value: customer.marketPoint },
                                                    { label: "Address", value: customer.address },
                                                    { label: "Trade License", value: customer.tradeLicense || "N/A" },
                                                    { label: "Drug License", value: customer.drugLicense || "N/A" },
                                                    { label: "Mobile", value: customer.mobile },
                                                    { label: "Email", value: customer.email || "N/A" },
                                                    { label: "Contact Person", value: customer.contactPerson || customer.mobile },
                                                    {
                                                        label: "Pay Mode",
                                                        value: customer.payMode?.join(", ") || "N/A",
                                                    },
                                                    {
                                                        label: "Discount",
                                                        value: (
                                                            <span className="text-green-600 font-bold">
                                                                {customer.discount}%
                                                            </span>
                                                        ),
                                                    },
                                                    {
                                                        label: "Credit Limit",
                                                        value: (
                                                            <span className="text-green-700 font-bold">
                                                                TK. {customer.crLimit.toLocaleString("en-IN")}/-
                                                            </span>
                                                        ),
                                                    },
                                                    {
                                                        label: "Day Limit",
                                                        value: `${customer.dayLimit || 0} Day${customer.dayLimit > 1 ? "s" : ""}`,
                                                    },
                                                    {
                                                        label: "Added by",
                                                        value: (
                                                            <>
                                                                <p className="font-medium">{customer.addedBy}</p>
                                                                <p className="text-gray-500 text-sm mt-1">
                                                                    {customer.addedEmail}
                                                                </p>
                                                            </>
                                                        ),
                                                    },
                                                    {
                                                        label: "Approved by",
                                                        value: customer.approvedBy ? (
                                                            <>
                                                                <p className="font-medium">{customer.approvedBy}</p>
                                                                <p className="text-gray-500 text-sm mt-1">
                                                                    {customer.approvedEmail}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            "Pending"
                                                        ),
                                                    },
                                                    {
                                                        label: "Date",
                                                        value: new Date(customer.date)
                                                            .toLocaleDateString("en-GB")
                                                            .replace(/\//g, "-"),
                                                    },
                                                    {
                                                        label: "Status",
                                                        value: (
                                                            <span
                                                                className={`px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${customer.status === "approved"
                                                                    ? "bg-green-500 text-white"
                                                                    : customer.status === "requested"
                                                                        ? "bg-yellow-500 text-white"
                                                                        : customer.status === "initialized"
                                                                            ? "bg-orange-500 text-white"
                                                                            : "bg-red-500 text-white"
                                                                    }`}
                                                            >
                                                                {customer.status.charAt(0).toUpperCase() +
                                                                    customer.status.slice(1)}
                                                            </span>
                                                        ),
                                                    },
                                                ].map((row, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b hover:bg-gray-100 transition-all duration-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3 font-semibold text-gray-700 w-1/3">
                                                            {row.label}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-900">{row.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </table>

                            <div className="flex justify-center items-center my-2">
                                <button
                                    onClick={() => handleApprove()}
                                    className="w-full max-w-4xl bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerRequestCard;