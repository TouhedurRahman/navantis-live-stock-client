import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ReturnProductsModal = ({ isOpen, onClose }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedProduct(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
                className={`bg-white rounded-lg shadow-lg w-full max-w-lg ${selectedProduct && 'h-4/5'}`}
                style={{ maxHeight: '90%' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Products Return</h2>
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

export default ReturnProductsModal;