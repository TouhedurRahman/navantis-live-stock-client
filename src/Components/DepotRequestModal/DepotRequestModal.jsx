import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import useDepotProducts from '../../Hooks/useDepotProducts';
import useWhProducts from '../../Hooks/useWhProducts';

const DepotRequestModal = ({ isOpen, onClose }) => {
    const [whProducts, whProductsLoading] = useWhProducts();
    const [products, loading] = useDepotProducts();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const uniqueWhProductNames = [
        ...new Set(
            whProducts
                .filter(product => product.totalQuantity >= 1)
                .map(product => product.productName)
        )
    ];

    const handleProductChange = (e) => {
        const selectedProductName = e.target.value;
        const product = whProducts.find(
            (product) => product.productName === selectedProductName
        );
        setSelectedProduct(product || null);
    };

    const selectedProductQuantity = selectedProduct
        ?
        products
            .filter((product) => product.productName === selectedProduct.productName)
            .reduce((sum, product) => sum + product.totalQuantity, 0)
        :
        0;

    const onSubmit = (data) => {
        console.log(data);
        reset();
    };

    useEffect(() => {
        if (!isOpen) {
            setSelectedProduct(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg" style={{ maxHeight: '90%' }}>
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Request From Warehouse</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {whProductsLoading ? (
                        <p className="text-center text-gray-700">Loading products...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Select Product */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Product <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('productId', { required: 'Please select a product.' })}
                                    className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={handleProductChange}
                                >
                                    <option value="">-- Select a product --</option>
                                    {uniqueWhProductNames.map((productName, index) => (
                                        <option key={index} value={productName}>
                                            {productName}
                                        </option>
                                    ))}
                                </select>
                                {errors.productId && (
                                    <p className="mt-1 text-sm text-red-500">{errors.productId.message}</p>
                                )}
                            </div>

                            {/* Selected Product Details */}
                            {selectedProduct && (
                                <div className="p-4 bg-gray-100 text-gray-800 rounded-md shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {selectedProduct.productName}
                                    </h3>
                                    <p className="text-sm">
                                        <strong>Depot Quantity:</strong>{' '}
                                        {selectedProductQuantity}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Trade Price:</strong> ${selectedProduct.tradePrice}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Description:</strong>{' '}
                                        {selectedProduct.description || 'No description available.'}
                                    </p>
                                </div>
                            )}

                            {/* Requested Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Requested Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('requestedQuantity', {
                                        required: 'Requested quantity is required.',
                                        min: {
                                            value: 1,
                                            message: 'Requested quantity must be at least 1.',
                                        },
                                        max: {
                                            value: selectedProduct?.depotQuantity || 0,
                                            message: 'Requested quantity exceeds depot stock.',
                                        },
                                    })}
                                    type="number"
                                    className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter requested quantity"
                                    disabled={!selectedProduct}
                                />
                                {errors.requestedQuantity && (
                                    <p className="mt-1 text-sm text-red-500">{errors.requestedQuantity.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!selectedProduct}
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                    <button
                        className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
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