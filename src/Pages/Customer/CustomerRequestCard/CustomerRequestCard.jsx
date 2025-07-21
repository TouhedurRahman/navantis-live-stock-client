import { useMutation } from "@tanstack/react-query";
import axios from "axios";
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

    const statusType = JSON.stringify(customer.payMode) === JSON.stringify(["Cash", "STC"])
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
            : JSON.stringify(customer.payMode) === JSON.stringify(["SIC"])
                ? customer.status === "pending"
                    ? "initialized"
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
                        <div className="p-5 rounded-lg shadow-sm flex-1 overflow-y-auto">
                            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Name</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.name}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Territory</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.territory}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Trade License</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.tradeLicense}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Drug License</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.drugLicense ? customer.drugLicense : "N/A"}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Address</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.address}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Mobile</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.mobile}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Email</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.email ? customer.email : "N/A"}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Contact Person</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.contactPerson}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Discount</td>
                                        <td className="px-4 py-3 text-green-700 font-bold">{customer.discount}%</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Pay Mode</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.payMode?.join(", ")}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Credit Limit</td>
                                        <td className="px-4 py-3 text-green-700 font-bold">{(customer.crLimit).toLocaleString("en-IN")}/- BDT</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Day Limit</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.dayLimit ? customer.dayLimit : "N/A"}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Date</td>
                                        <td className="px-4 py-3 text-gray-800">{new Date(customer.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Status</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full shadow-md 
                                                ${((customer.status === "approved")) ? "bg-green-500 text-white" : ((customer.status === "requested")) ? "bg-yellow-500 text-white" : ((customer.status === "initialized")) ? "bg-orange-500 text-white" : "bg-red-500 text-white"}`}>
                                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <button
                                onClick={() => handleApprove()}
                                className="mt-5 w-full px-4 py-2 text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Approve
                            </button>
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