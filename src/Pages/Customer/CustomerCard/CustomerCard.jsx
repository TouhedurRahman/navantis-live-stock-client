import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FaEdit, FaTimes, FaTrashAlt } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useApiConfig from '../../../Hooks/useApiConfig';
import useSingleUser from '../../../Hooks/useSingleUser';

const CustomerCard = ({ idx, customer, refetch }) => {
    const [singleUser] = useSingleUser();
    const baseUrl = useApiConfig();

    const [isModalOpen, setModalOpen] = useState(false);

    const deleteCustomerMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/customer/${customer._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error delete customer:", error);
        }
    });

    const handleRemove = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        deleteCustomerMutation.mutateAsync(),
                    ]);

                    refetch();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Customer successfully deleted.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "Faild to delete customer",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            }
        });
    };

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td className='text-center'>
                    {customer.customerId}
                </td>
                <td>
                    {customer.name}
                </td>
                <td>
                    {customer.address}
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={() => setModalOpen(true)}
                            title="Customer Details"
                            className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                        >
                            <FaEye className="text-orange-500" />
                        </button>
                        <>
                            {
                                (
                                    !["Managing Director", "Zonal Manager", "Area Manager", "Sr. Area Manager"].includes(singleUser?.designation)
                                )
                                &&
                                <Link
                                    to={
                                        customer.territory !== "Institute"
                                            ?
                                            `/update-customer/${customer._id}`
                                            :
                                            `/update-institute/${customer._id}`
                                    }
                                    title="Edit/update customer"
                                    className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                                >
                                    <FaEdit className="text-yellow-500" />
                                </Link>
                            }
                        </>
                        <button
                            // onClick={handleRemove}
                            title="Remove customer"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTrashAlt className="text-red-500" />
                        </button>
                    </div>
                </th>
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
                                        <td className="px-4 py-3 text-green-700 font-bold">{customer.crLimit} BDT</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Day Limit</td>
                                        <td className="px-4 py-3 text-gray-800">{customer.dayLimit ? customer.dayLimit : "N/A"}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Date</td>
                                        <td className="px-4 py-3 text-gray-800">{new Date(customer.date).toISOString().split("T")[0]}</td>
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

export default CustomerCard;