import React from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from "react-icons/fa";

const StockInModal = ({ isOpen, onClose, product, refetch }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = (data) => {
        console.log("Stock In Data:", data);

        refetch();
        onClose();
        reset();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-blue-600">Stock in warehouse</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <FaTimes className="text-gray-500 hover:text-red-500" size={18} />
                    </button>
                </div>

                {/* Product Info */}
                <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">{product.name}</h3>
                    <p className="text-md text-gray-700 mb-4">Current Quantity: <span className="font-semibold text-blue-600">{product.quantity}</span></p>

                    <div className="bg-white p-3 rounded-md shadow-sm flex justify-around items-center text-gray-600">
                        <p className="text-sm">
                            Price: <span className="font-medium text-blue-700">{product.price.toLocaleString('en-IN')}/-</span>
                        </p>
                        <p className="text-sm">
                            Lot: <span className="font-medium text-blue-700">{product.lot}</span>
                        </p>
                        <p className="text-sm">
                            Expire: <span className="font-medium text-red-500">{product.expire}</span>
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                    {/* Quantity Field */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700">
                            New arrival Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            {...register('quantity', { required: "Quantity is required", min: 1 })}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter new arrival quantity"
                        />
                        {errors.quantity && (
                            <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
                        )}
                    </div>

                    {/* Date Field */}
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

                    {/* Action Buttons */}
                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-gray-400"
                            onClick={() => {
                                onClose();
                                reset();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockInModal;