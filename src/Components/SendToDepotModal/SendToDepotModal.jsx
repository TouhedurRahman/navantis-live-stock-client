import React from 'react';
import { FaTimes } from "react-icons/fa";

const SendToDepotModal = ({ isOpen, onClose, product, refetch }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        console.log(`Sending product to depot: ${product.name}`);

        refetch();
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Send to Depot</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <FaTimes className="text-gray-500 hover:text-red-500" />
                    </button>
                </div>
                <p>Send {product.name} to depot?</p>
                <div className="flex justify-end mt-6">
                    <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2" onClick={onClose}>Close</button>
                    <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={handleConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default SendToDepotModal;