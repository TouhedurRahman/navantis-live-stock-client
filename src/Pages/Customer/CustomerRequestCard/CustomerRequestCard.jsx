import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const CustomerRequestCard = ({ idx, customer, refetch }) => {
    const user = {
        displayName: 'Area Manager',
        email: 'am@gmail.com'
    }
    const [isModalOpen, setModalOpen] = useState(false);

    const approvedCustomerMutation = useMutation({
        mutationFn: async () => {
            const updatedCustomer = {
                ...customer,
                status: 'approved',
                approvedBy: user?.displayName,
                approvedEmail: user?.email
            }
            const response = await axios.patch(`http://localhost:5000/customer/${customer._id}`, updatedCustomer);
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
            const response = await axios.patch(`http://localhost:5000/customer/${customer._id}`, updatedCustomer);
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
                <td><div className="font-bold">{customer.customerName}</div></td>
                <td>{customer.address}</td>
                <td className="text-center">{customer.customerTerritory}</td>
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
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 transform transition-all duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
                            <button onClick={() => setModalOpen(false)} aria-label="Close modal">
                                <FaTimes className="text-gray-500 hover:text-red-500 transition-all duration-200" size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mt-4 space-y-3 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            {/* <h3 className="text-xl font-bold text-green-700 border-b pb-2">Customer Details</h3> */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-800">
                                <p><span className="font-semibold text-green-700">Name:</span> {customer.customerName}</p>
                                <p><span className="font-semibold text-green-700">Territory:</span> {customer.customerTerritory}</p>
                                <p><span className="font-semibold text-green-700">Trade License:</span> {customer.tradeLicense}</p>
                                <p><span className="font-semibold text-green-700">Drug License:</span> {customer.drugLicense}</p>
                                <p><span className="font-semibold text-green-700">Address:</span> {customer.address}</p>
                                <p><span className="font-semibold text-green-700">Mobile:</span> {customer.mobile}</p>
                                <p><span className="font-semibold text-green-700">Email:</span> {customer.email}</p>
                                <p><span className="font-semibold text-green-700">Contact Person:</span> {customer.contactPerson}</p>
                                <p><span className="font-semibold text-green-700">Discount:</span> <span className="text-green-600 font-bold">{customer.discount}%</span></p>
                                <p><span className="font-semibold text-green-700">Credit Limit:</span> <span className="text-green-600 font-bold">{customer.crLimit} BDT</span></p>
                                <p><span className="font-semibold text-green-700">Added By:</span> {customer.addedBy}</p>
                                <p>
                                    <span className="font-semibold text-green-700">Status:</span>
                                    <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full 
                ${customer.status !== "pending" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"}`}>
                                        {customer.status}
                                    </span>
                                </p>
                                <p><span className="font-semibold text-green-700">Date:</span> {new Date(customer.date).toISOString().split("T")[0]}</p>
                            </div>
                        </div>


                        {/* Footer */}
                        <div className="flex justify-end mt-6 space-x-2">
                            <button
                                onClick={() => handleApprove()}
                                className="px-5 py-2 text-white bg-green-500 rounded-md shadow hover:bg-green-600 transition-all duration-200"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-5 py-2 text-white bg-gray-400 rounded-md shadow hover:bg-gray-500 transition-all duration-200"
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