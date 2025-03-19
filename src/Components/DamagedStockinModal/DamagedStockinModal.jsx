import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from "react-icons/fa";

const DamagedStockinModal = ({ isOpen, onClose, product, refetch, damagedProducts }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const matchingProducts = damagedProducts.find(damagedProduct =>
        damagedProduct.productName === product.productName &&
        damagedProduct.batch === product.batch &&
        damagedProduct.expire === product.expire &&
        damagedProduct.status === "pending"
    );

    const whDamagedProductMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.totalQuantity),
                damageQuantity: Number(data.quantity),
                date: data.date,
                remarks: data.remarks,
                status: "pending",
                addedby: product.addedby,
                addedemail: product.addedemail
            };

            const response = await axios.post('http://localhost:5000/damaged-in-wh', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock out from warehouse:", error);
        },
    });

    const onSubmit = async (data) => {
        try {
            await Promise.all([
                whDamagedProductMutation.mutateAsync(data)
            ]);

            reset();
            alert('Damaged product added!');
            refetch();
            onClose();
            window.location.reload();
            reset();
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to stock in.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5"
                style={{ maxHeight: '90%' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-semibold">Damaged Product</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <FaTimes className="text-gray-500 hover:text-red-500" size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {/* Product Name and Code */}
                    <div className="bg-white p-6 rounded-lg shadow-lg transform transition duration-300">
                        <h3 className="text-2xl font-extrabold text-green-900 mb-2 text-center border-b-2 border-green-300 pb-2">
                            {product.productName}
                        </h3>
                        <p className=' text-xl font-bold font-sans mb-2 text-center'>{product.netWeight}</p>
                        <div className="grid grid-cols-2 gap-6 items-center">
                            {/* Product Details */}
                            <div className="bg-white rounded-lg shadow-md">
                                <table className="w-full text-left border-collapse">
                                    <tbody>
                                        <tr className="border-b">
                                            <th className="py-2 text-green-700 font-semibold">Code</th>
                                            <td className="py-2 text-gray-700">{product.productCode}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <th className="py-2 text-green-700 font-semibold">Batch</th>
                                            <td className="py-2 text-gray-700">{product.batch}</td>
                                        </tr>
                                        <tr>
                                            <th className="py-2 text-green-700 font-semibold">Expire</th>
                                            <td className="py-2 text-red-600 font-medium">{product.expire}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Unit */}
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <p className="text-sm font-medium text-green-700 uppercase">Total Unit</p>
                                <p className="text-3xl font-extrabold mt-2">{product.totalQuantity}</p>
                            </div>
                        </div>
                    </div>
                    {
                        matchingProducts?.damageQuantity > 0
                        &&
                        <div className="mt-2 p-6 bg-white rounded-lg shadow-md text-center">
                            <p className="text-sm font-medium text-green-700 uppercase">Already Request Pending</p>
                            <p className="text-3xl font-extrabold mt-2 text-red-500">{matchingProducts?.damageQuantity}</p>
                        </div>
                    }
                    {/* update input section */}
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">
                                Damaged Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register('quantity', { required: "Quantity is required", min: 0 })}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter damaged product quantity"
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
                            )}
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                {...register('date', { required: "Date is required" })}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            {errors.date && (
                                <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
                            )}
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">
                                Remarks (Optional)
                            </label>
                            <textarea
                                {...register('remarks')}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            {errors.remarks && (
                                <p className="mt-1 text-sm text-red-500">{errors.remarks.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 mx-auto py-2 text-white rounded-md bg-green-500 hover:bg-green-600"
                        >
                            Confirm
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                            onClick={() => {
                                onClose();
                                reset();
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DamagedStockinModal;