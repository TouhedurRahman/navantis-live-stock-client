import React from 'react';
import { FaTimes } from 'react-icons/fa';

const DepotDetailsModal = ({ isOpen, onClose, product }) => {
    if (!isOpen) return null;

    // Calculate totals
    const totalTradePrice = product.totalQuantity * product.tradePrice;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5"
                style={{ maxHeight: '90%' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-semibold">Product Details</h2>
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

                    {/* Price and Total Price Section */}
                    <div className="mt-6 bg-white p-4 rounded-md shadow-md">
                        <h4 className="font-bold text-gray-900 mb-4">Price Details</h4>
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full text-left border border-gray-200">
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="px-4 py-2 border border-gray-200">Price Type</th>
                                        <th className="px-4 py-2 border border-gray-200 text-right">Unit Price (৳)</th>
                                        <th className="px-4 py-2 border border-gray-200 text-right">Total Price (৳)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-2 border border-gray-200">Trade Price</td>
                                        <td className="px-4 py-2 border border-gray-200 text-right">{product.tradePrice.toLocaleString('en-IN')}/-</td>
                                        <td className="px-4 py-2 border border-gray-200 text-right">{totalTradePrice.toLocaleString('en-IN')}/-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t">
                    <button
                        className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepotDetailsModal;