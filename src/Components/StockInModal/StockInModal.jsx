import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaTimes } from "react-icons/fa";
import { RxCross1 } from 'react-icons/rx';

const StockInModal = ({ isOpen, onClose, product, refetch }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const [editAP, setEditAP] = useState(false);
    const [editTP, setEditTP] = useState(false);

    const updateProductMutation = useMutation({
        mutationFn: async (data) => {
            const updatedProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(data.ap),
                tradePrice: Number(data.tp),
                totalQuantity: Number(data.pwb) + Number(data.pwob) + Number(product.totalQuantity)
            };

            const response = await axios.patch(`http://localhost:5000/wh-product/${product._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating product to warehouse:", error);
        },
    });

    const addStockMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(data.ap),
                tradePrice: Number(data.tp),
                boxQuantity: Number(data.box),
                productWithBox: Number(data.pwb),
                productWithoutBox: Number(data.pwob),
                totalQuantity: Number(Number(data.pwb) + Number(data.pwob)),
                date: data.date,
                remarks: data.remarks || product.remarks,
                addedby: product.addedby,
                addedemail: product.addedemail
            };

            const response = await axios.post('http://localhost:5000/stock-in-wh', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding stock-in:", error);
        },
    });

    const onSubmit = async (data) => {
        try {
            await Promise.all([
                updateProductMutation.mutateAsync(data),
                addStockMutation.mutateAsync(data)
            ]);

            reset();
            alert('Stock in successful!');
            refetch();
            onClose();
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
                    <h2 className="text-2xl font-semibold">Warehouse Stock in</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <FaTimes className="text-gray-500 hover:text-red-500" size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {/* Product Name and Code */}
                    <div className="bg-white p-6 rounded-lg shadow-lg transform transition duration-300">
                        <h3 className="text-2xl font-extrabold text-green-900 mb-4 text-center border-b-2 border-green-300 pb-2">
                            {product.productName}
                        </h3>
                        <div className="grid grid-cols-2 gap-6 items-center">
                            {/* Product Details */}
                            <div className="bg-white rounded-lg shadow-md">
                                <table className="w-full text-left border-collapse">
                                    <tbody className='text-center'>
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

                    {/* update input section */}
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                        <div>
                            {/* Actual Price */}
                            <div className="flex flex-col mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Actual Price (AC) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center mt-2">
                                    {editAP ? (
                                        <input
                                            type="number"
                                            {...register("ap", { required: "Actual Price is required", min: 0 })}
                                            className="h-10 w-full px-4 border border-gray-500 rounded-md text-sm"
                                            placeholder="Enter Actual Price"
                                        />
                                    ) : (
                                        <input
                                            value={product.actualPrice}
                                            {...register("ap")}
                                            className="h-10 w-full px-4 bg-gray-100 border border-gray-500 text-sm rounded-md cursor-not-allowed"
                                            readOnly
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setEditAP(!editAP)}
                                        className="ml-2 p-2 h-10 border border-gray-500 bg-white text-gray-700 rounded-md">
                                        {editAP ? <RxCross1 /> : <FaEdit />}
                                    </button>
                                </div>
                                {errors.ap && <p className="text-red-500 text-sm">{errors.ap.message}</p>}
                            </div>

                            {/* Trade Price */}
                            <div className="flex flex-col mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Trade Price (TP) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center mt-2">
                                    {editTP ? (
                                        <input
                                            type="number"
                                            {...register("tp", { required: "Trade Price is required", min: 0 })}
                                            className="h-10 w-full px-4 border border-gray-500 rounded-md text-sm"
                                            placeholder="Enter Trade Price"
                                        />
                                    ) : (
                                        <input
                                            value={product.tradePrice}
                                            {...register("tp")}
                                            className="h-10 w-full px-4 bg-gray-100 border border-gray-500 text-sm rounded-md cursor-not-allowed"
                                            readOnly
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setEditTP(!editTP)}
                                        className="ml-2 p-2 h-10 border border-gray-500 bg-white text-gray-700 rounded-md">
                                        {editTP ? <RxCross1 /> : <FaEdit />}
                                    </button>
                                </div>
                                {errors.ac && <p className="text-red-500 text-sm">{errors.ac.message}</p>}
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">
                                Box Quantity (Cartoon) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register('box', { required: "Box quantity is required", min: 0 })}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter box quantity"
                            />
                            {errors.box && (
                                <p className="mt-1 text-sm text-red-500">{errors.box.message}</p>
                            )}
                        </div>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Quantity (With Box) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register('pwb', { required: "With box product quantity is required", min: 0 })}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter with box product quantity"
                            />
                            {errors.pwb && (
                                <p className="mt-1 text-sm text-red-500">{errors.pwb.message}</p>
                            )}
                        </div>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Quantity (Without Box) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register('pwob', { required: "Without box product quantity is required", min: 0 })}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter without box product quantity"
                            />
                            {errors.pwob && (
                                <p className="mt-1 text-sm text-red-500">{errors.pwob.message}</p>
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

export default StockInModal;