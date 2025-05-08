import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import { FaEye, FaTimes, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useApiConfig from '../../../Hooks/useApiConfig';

const MyOrderscard = ({ idx, myOrder, refetch }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const baseUrl = useApiConfig();

    const lessDiscount = Number(myOrder.totalPrice * (myOrder.discount / 100));

    const totalPayable = Number(myOrder.totalPrice - lessDiscount);

    const deleteOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/pending-order/${myOrder._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error delete order:", error);
        }
    });

    const handleDelete = () => {
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
                        deleteOrderMutation.mutateAsync()
                    ]);

                    refetch();
                    Swal.fire({
                        title: "Success!",
                        text: "Order deleted.",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    console.error("Error delete order:", error);
                }
            }
        });
    };

    return (
        <>
            <tr>
                <td className="text-center">{idx}</td>
                <td>
                    <div className="font-bold">{myOrder.pharmacy}</div>
                    <div className="font-medium text-gray-400">{myOrder.pharmacyId}</div>
                </td>
                <td className='text-right'>{myOrder.totalUnit}</td>
                <td className="text-right">{(Number((Number(totalPayable)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-</td>
                <td className="text-center">
                    {new Date(myOrder.date).toISOString().split("T")[0].split("-").reverse().join("-")}
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
                {
                    myOrder.status === "pending"
                    &&
                    <td className="text-center">
                        <button
                            onClick={handleDelete}
                            title="Deny Request"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTrashAlt className="text-red-500" />
                        </button>
                    </td>
                }
            </tr>

            {
                isModalOpen && myOrder
                &&
                (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div
                            className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5 flex flex-col"
                            style={{ maxHeight: '90%' }}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold">Order Details</h2>
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
                                <div className="w-full max-full mx-auto bg-white border border-gray-300 rounded-md p-4 shadow-sm text-sm font-mono">
                                    <div className="text-center mb-4">
                                        <h2 className="text-lg font-bold">Navantis Pharma Limited</h2>
                                        <p className="text-xs">Order Receipt</p>
                                        <p className="text-xs">Date: {new Date(myOrder.date).toISOString().split("T")[0].split("-").reverse().join("-")}</p>
                                        <hr className="my-2 border-gray-400" />
                                        {
                                            myOrder.products.length > 0
                                            &&
                                            <>
                                                <div className='text-left'>
                                                    <p className="text-xs">Customer Code: {myOrder?.pharmacyId}</p>
                                                    <p className="text-xs">Customer Name: {myOrder?.pharmacy}</p>
                                                </div>
                                                <hr className="my-2 border-gray-400" />
                                            </>
                                        }
                                    </div>
                                    {myOrder.products.length > 0 ? (
                                        <>
                                            <table className="w-full border-collapse text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-400">
                                                        <th className="py-2">Product</th>
                                                        <th className="py-2 text-right px-3">Qty</th>
                                                        <th className="py-2 text-right px-3">Price/Unit</th>
                                                        <th className="py-2 text-right px-3">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myOrder.products.map((product) => (
                                                        <tr key={product.id} className="border-b border-gray-200">
                                                            <td className="py-2">{product.name} - {product.netWeight}</td>
                                                            <td className="py-2 text-right px-3">{product.quantity}</td>
                                                            <td className="py-2 text-right px-3">{product.tradePrice}/-</td>
                                                            <td className="py-2 text-right px-3">{product.quantity * product.tradePrice}/-</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <hr className="my-2 border-gray-400" />
                                            <div className="space-y-2 font-bold text-sm mt-2">
                                                {/* Grand Total Row */}
                                                <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                                                    <span className="text-right">Grand Total</span>
                                                    <span className="text-center w-6">:</span>
                                                    <span className="text-right px-3">
                                                        {(Number((Number(myOrder.totalPrice)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                                    </span>
                                                </div>

                                                {/* Less Discount Row */}
                                                <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                                                    <span className="text-right">
                                                        Less Discount {myOrder.discount > 0 && `(${myOrder.discount}%)`}
                                                    </span>
                                                    <span className="text-center w-6">:</span>
                                                    <span className="text-right px-3">
                                                        {(Number((Number(lessDiscount)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                                    </span>
                                                </div>

                                                {/* Total Payable Row */}
                                                <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                                                    <span className="text-right">Total Payable</span>
                                                    <span className="text-center w-6">:</span>
                                                    <span className="text-right px-3">
                                                        {(Number((Number(totalPayable)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                                    </span>
                                                </div>
                                            </div>
                                            <hr className="my-2 border-gray-400" />
                                            <p className="text-center text-xs mt-4">Thank you for your purchase!</p>
                                        </>
                                    ) : (
                                        <p className="text-center">No products available.</p>
                                    )}
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
                )
            }
        </>
    );
};

export default MyOrderscard;