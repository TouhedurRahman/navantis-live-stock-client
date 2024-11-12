import React from 'react';
import { FaTimes } from "react-icons/fa";

const OperationModal = ({ isOpen, onClose, title, children, product, refetch }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose}>
                        <FaTimes className="text-gray-500 hover:text-red-500" />
                    </button>
                </div>
                <div className="mt-4">
                    {children}
                </div>
                <div>
                    {product.name}
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => {
                            onClose();
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OperationModal;