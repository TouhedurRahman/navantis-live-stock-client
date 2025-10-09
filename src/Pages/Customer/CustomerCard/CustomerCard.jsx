import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FileText, Package } from "lucide-react";
import { FaEdit, FaTimes, FaTrashAlt } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useApiConfig from '../../../Hooks/useApiConfig';
import useOrders from '../../../Hooks/useOrders';
import useSingleUser from '../../../Hooks/useSingleUser';

const CustomerCard = ({ idx, customer, refetch }) => {
    const [singleUser] = useSingleUser();
    const baseUrl = useApiConfig();
    const [orders] = useOrders();

    const [isModalOpen, setModalOpen] = useState(false);

    const unpaidStcCreditSpIC = orders.some(order =>
        order.pharmacyId === customer.customerId
        &&
        ["STC", "Credit", "SpIC"].includes(order.payMode)
        &&
        ["delivered", "due", "outstanding"].includes(order.status)
    );

    const deleteCustomerMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/customer/${customer._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error delete customer:", error);
        }
    });

    const customerTotalSales = orders.filter(
        order =>
            order.pharmacyId === customer.customerId &&
            !["pending", "returned"].includes(order.status)
    );

    const customerTotalInvoices = customerTotalSales.length;
    const customerTotalUnits = customerTotalSales.reduce(
        (sum, order) => sum + (order.totalUnit || 0),
        0
    );

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
                                unpaidStcCreditSpIC
                                    ?
                                    <>
                                        {
                                            (
                                                !["Managing Director", "Zonal Manager", "Area Manager", "Sr. Area Manager"].includes(singleUser?.designation)
                                            )
                                            &&
                                            <Link
                                                onClick={() => {
                                                    Swal.fire({
                                                        position: "center",
                                                        icon: "error",
                                                        title: "Update Restricted",
                                                        text: `Unpaid ${customer.payMode?.includes("Credit")
                                                            ? "Credit"
                                                            : customer.payMode?.includes("SpIC")
                                                                ? "SpIC"
                                                                : "STC"
                                                            } order(s) found. Please clear payment first.`,
                                                        showConfirmButton: true
                                                    });
                                                }}
                                                title="Edit/update customer"
                                                className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                                            >
                                                <FaEdit className="text-yellow-500" />
                                            </Link>
                                        }
                                    </>
                                    :
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
                                                    {customerTotalInvoices?.toLocaleString("en-IN") || 0}
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
                                                    {customerTotalUnits?.toLocaleString("en-IN") || 0}
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
                                                    { label: "Market Point", value: customer.marketPoint || "N/A" },
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