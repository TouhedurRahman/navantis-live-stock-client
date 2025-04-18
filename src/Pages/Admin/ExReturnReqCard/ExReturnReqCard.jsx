import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import useApiConfig from "../../../Hooks/useApiConfig";

const ExReturnReqCard = ({ idx, returnReq, refetch }) => {
    const baseUrl = useApiConfig();

    const [isModalOpen, setModalOpen] = useState(false);

    const approvedExReturnMutation = useMutation({
        mutationFn: async () => {
            const updatedExReturnReq = {
                ...returnReq,
                status: 'approved'
            }
            const response = await axios.patch(`${baseUrl}/expired-returns/${returnReq._id}`, updatedExReturnReq);
            return response.data;
        },
        onError: (error) => {
            console.error("Error approved request:", error);
        }
    });

    const deniedExReturnReqMutation = useMutation({
        mutationFn: async () => {
            const updatedExReturnReq = {
                ...returnReq,
                status: 'denied'
            }
            const response = await axios.patch(`${baseUrl}/expired-returns/${returnReq._id}`, updatedExReturnReq);
            return response.data;
        },
        onError: (error) => {
            console.error("Error denied request:", error);
        }
    });

    const handleApprove = async () => {
        try {
            await Promise.all([
                approvedExReturnMutation.mutateAsync()
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
        }
    };

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
                        deniedExReturnReqMutation.mutateAsync()
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
                }
            }
        });
    };

    return (
        <>
            <tr>
                <td className="text-center">{idx}</td>
                <td>
                    <div className="font-bold">{returnReq.pharmacy}</div>
                    <div className="font-medium text-gray-400">{returnReq.pharmacyId}</div>
                </td>
                <td>{returnReq.territory}</td>
                <td>{returnReq.productName}</td>
                <td className="text-center">{returnReq.totalQuantity}</td>
                <td className="text-center">
                    {new Date(returnReq.date).toISOString().split("T")[0].split("-").reverse().join("-")}
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
            {isModalOpen && returnReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5 flex flex-col"
                        style={{ maxHeight: '90%' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Return Details</h2>
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
                                        <td className="px-4 py-3 text-gray-800">{returnReq.productName}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Batch</td>
                                        <td className="px-4 py-3 text-gray-800">{returnReq.batch}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Expire</td>
                                        <td className="px-4 py-3 text-gray-800">{returnReq.expire}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Quantity</td>
                                        <td className="px-4 py-3 text-gray-800">{returnReq.totalQuantity}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">TP</td>
                                        <td className="px-4 py-3 text-gray-800">{returnReq.tradePrice}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Total Price</td>
                                        <td className="px-4 py-3 text-gray-800">{returnReq.totalPrice}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Return By</td>
                                        <td className="px-4 py-3 text-gray-800">{returnReq.returnedBy}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Area Manager</td>
                                        <td className="px-4 py-3 text-gray-800">{returnReq.areaManager}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Date</td>
                                        <td className="px-4 py-3 text-gray-800">{new Date(returnReq.date).toISOString().split("T")[0]}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Status</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full shadow-md 
                                                ${((returnReq.status === "adjusted")) ? "bg-green-500 text-white" : ((returnReq.status === "approved")) ? "bg-yellow-500 text-white" : ((returnReq.status === "pending")) ? "bg-orange-500 text-white" : "bg-red-500 text-white"}`}>
                                                {returnReq.status.charAt(0).toUpperCase() + returnReq.status.slice(1)}
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

export default ExReturnReqCard;