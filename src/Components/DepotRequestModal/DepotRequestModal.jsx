import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import useWhProducts from '../../Hooks/useWhProducts';

const DepotRequestModal = ({ isOpen, onClose }) => {
    const [products, loading] = useWhProducts();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    const requestedQuantity = watch('requestedQuantity');

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const product = products.find((p) => p._id === productId);
        setSelectedProduct(product);
        setValue('requestedQuantity', ''); // Reset requested quantity when a new product is selected
    };

    const onSubmit = (data) => {
        if (!selectedProduct) {
            alert('Please select a product.');
            return;
        }
        alert(`Request submitted for ${data.requestedQuantity} units of ${selectedProduct.productName}.`);
        reset(); // Clear form fields
        setSelectedProduct(null);
        onClose(); // Close modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out">
            <div
                className="bg-white text-black rounded-lg shadow-2xl w-full max-w-xl h-auto"
                style={{ maxHeight: '90%' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/30">
                    <h2 className="text-2xl font-bold tracking-wide">Request From Warehouse</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-white hover:text-red-400 transition-transform transform hover:scale-125"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {loading ? (
                        <p className="text-center text-gray-200">Loading products...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Select Product */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Select Product <span className="text-red-400">*</span>
                                </label>
                                <select
                                    {...register('productId', { required: 'Please select a product.' })}
                                    className="w-full px-4 py-3 bg-white text-gray-700 border-0 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    onChange={handleProductChange}
                                >
                                    <option value="">-- Select a product --</option>
                                    {products.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.productName} (Available: {product.totalQuantity})
                                        </option>
                                    ))}
                                </select>
                                {errors.productId && (
                                    <p className="mt-2 text-sm text-red-300">{errors.productId.message}</p>
                                )}
                            </div>

                            {/* Selected Product Details */}
                            {selectedProduct && (
                                <div className="p-4 bg-white text-gray-800 rounded-md shadow-md">
                                    <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                                        {selectedProduct.productName}
                                    </h3>
                                    <p className="text-sm mb-1">
                                        <span className="font-medium">Trade Price:</span> ${selectedProduct.tradePrice}
                                    </p>
                                    <p className="text-sm mb-1">
                                        <span className="font-medium">Available Quantity:</span>{' '}
                                        {selectedProduct.totalQuantity}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium">Description:</span>{' '}
                                        {selectedProduct.description || 'No description available.'}
                                    </p>
                                </div>
                            )}

                            {/* Requested Quantity */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Requested Quantity <span className="text-red-400">*</span>
                                </label>
                                <input
                                    {...register('requestedQuantity', {
                                        required: 'Requested quantity is required.',
                                        min: {
                                            value: 1,
                                            message: 'Requested quantity must be at least 1.',
                                        },
                                        max: {
                                            value: selectedProduct?.totalQuantity || 0,
                                            message: 'Requested quantity exceeds available stock.',
                                        },
                                    })}
                                    type="number"
                                    className="w-full px-4 py-3 bg-white text-gray-700 border-0 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    placeholder="Enter requested quantity"
                                    disabled={!selectedProduct}
                                />
                                {errors.requestedQuantity && (
                                    <p className="mt-2 text-sm text-red-300">{errors.requestedQuantity.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-4 py-3 text-white bg-blue-700 rounded-md shadow-lg hover:from-green-500 hover:to-teal-600 transition-transform transform hover:scale-105"
                                disabled={!selectedProduct}
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-white/30">
                    <button
                        className="px-6 py-3 text-white bg-red-500 rounded-md shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepotRequestModal;