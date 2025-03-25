import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import useOrders from "../../Hooks/useOrders";

const ReturnProductsModal = ({ isOpen, onClose }) => {
    const [orders] = useOrders();
    const [invoice, setInvoice] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [returnData, setReturnData] = useState({});

    useEffect(() => {
        if (!isOpen) {
            setInvoice("");
            setSelectedOrder(null);
            setReturnData({});
        }
    }, [isOpen]);

    const handleSearch = () => {
        if (!invoice.trim()) {
            alert("Please enter an invoice number.");
            return;
        }

        console.log("Searching for invoice:", invoice.trim());
        console.log("Available orders:", orders);

        const order = orders.find((o) => String(o.invoice).trim() === invoice.trim());

        if (order) {
            console.log("Order found:", order);
            setSelectedOrder(order);

            const initialReturnData = order.products.reduce((acc, product) => {
                acc[product.productCode] = 0;
                return acc;
            }, {});

            setReturnData(initialReturnData);
        } else {
            console.log("Order not found!");
            alert("Order not found!");
            setSelectedOrder(null);
        }
    };

    const handleReturnChange = (productCode, value) => {
        setReturnData((prev) => {
            const maxReturnable = selectedOrder.products.find(p => p.productCode === productCode).quantity;
            return {
                ...prev,
                [productCode]: isNaN(value) || value < 0 ? 0 : Math.min(value, maxReturnable)
            };
        });
    };

    const handleReturnSubmit = () => {
        if (!selectedOrder) return;

        const updatedOrder = {
            ...selectedOrder,
            products: selectedOrder.products.map((product) => ({
                ...product,
                quantity: product.quantity - (returnData[product.productCode] || 0),
                totalPrice: product.tradePrice * (product.quantity - (returnData[product.productCode] || 0))
            })),
        };

        console.log("Updated Order Data:", updatedOrder);
        alert("Return processed successfully!");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-center w-full px-5 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Products Return</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Search by Invoice */}
                <div className="my-4">
                    <input
                        type="text"
                        placeholder="Enter Invoice Number"
                        value={invoice}
                        onChange={(e) => setInvoice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Search
                    </button>
                </div>

                {/* Products List */}
                {selectedOrder && (
                    <div className="overflow-y-auto max-h-64">
                        <h3 className="text-lg font-semibold mb-2">Products</h3>
                        {selectedOrder.products.map((product) => (
                            <div key={product.productCode} className="border p-2 mb-2 rounded-md">
                                <p className="font-semibold">{product.name} ({product.netWeight})</p>
                                <p>Batch: {product.batch} | Expire: {product.expire}</p>
                                <p>Quantity: {product.quantity}</p>
                                <label className="block mt-2">
                                    Return Quantity:
                                    <input
                                        type="number"
                                        min="0"
                                        max={product.quantity}
                                        value={returnData[product.productCode]}
                                        onChange={(e) => handleReturnChange(product.productCode, parseInt(e.target.value) || 0)}
                                        className="w-full mt-1 px-2 py-1 border rounded-md"
                                    />
                                </label>
                            </div>
                        ))}

                        <button
                            className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                            onClick={handleReturnSubmit}
                        >
                            Process Return
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
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