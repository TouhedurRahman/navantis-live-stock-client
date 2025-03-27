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

        const order = orders.find((o) => String(o.invoice).trim() === invoice.trim());

        if (order) {
            const filteredProducts = order.products.filter(product => product.quantity > 0);

            if (filteredProducts.length === 0) {
                alert("No returnable products found!");
                return;
            }

            setSelectedOrder({ ...order, products: filteredProducts });

            const initialReturnData = filteredProducts.reduce((acc, product) => {
                acc[product.productCode] = 0;
                return acc;
            }, {});

            setReturnData(initialReturnData);
        } else {
            alert("Order not found!");
            setSelectedOrder(null);
        }
    };

    const handleReturnChange = (productCode, batch, value) => {
        const product = selectedOrder.products.find(p => p.productCode === productCode && p.batch === batch);

        if (product) {
            const maxReturnable = product.quantity;

            setReturnData((prev) => {
                return {
                    ...prev,
                    [`${productCode}-${batch}`]: isNaN(value) || value < 0 ? 0 : Math.min(value, maxReturnable)
                };
            });
        }
    };

    const handleReturnSubmit = () => {
        if (!selectedOrder) return;

        const returnedProducts = [];
        const updatedProducts = selectedOrder.products
            .map((product) => {
                const returnKey = `${product.productCode}-${product.batch}`;
                const returnQuantity = returnData[returnKey] || 0;

                if (returnQuantity > 0) {
                    returnedProducts.push({
                        ...product,
                        returnQuantity,
                        totalReturnPrice: product.tradePrice * returnQuantity
                    });
                }

                return {
                    ...product,
                    quantity: product.quantity - returnQuantity,
                    totalPrice: product.tradePrice * (product.quantity - returnQuantity)
                };
            })
            .filter(product => product.quantity > 0);

        const orderUpdate = {
            ...selectedOrder,
            products: updatedProducts
        };

        const totalProduct = orderUpdate.products.length;
        const totalUnit = orderUpdate.products.reduce((sum, product) => sum + product.quantity, 0);
        const totalPrice = orderUpdate.products.reduce((sum, product) => sum + product.totalPrice, 0);

        const lessDiscount = Number(totalPrice * (orderUpdate.discount / 100));
        const totalPayable = Number(totalPrice - lessDiscount);
        const due = Number(totalPayable - (orderUpdate?.paid || 0));

        const updatedOrder = {
            ...orderUpdate,
            totalProduct,
            totalUnit,
            totalPrice,
            totalPayable,
            due
        };

        console.log("Updated Order:", updatedOrder);
        console.log("Returned Products:", returnedProducts);
        alert("Return processed successfully!");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b">
                    <h2 className="text-xl font-semibold">Product Returns</h2>
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
                        className="w-full text-center px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <h3 className="text-lg text-center font-semibold mb-2">Ordered Products</h3>
                        {selectedOrder.products.map((product) => (
                            <div
                                key={`${product.productCode}-${product.batch}`}
                                className="bg-white text-center shadow-md rounded-lg p-4 mb-4 border border-gray-200 transition hover:shadow-lg"
                            >
                                <p className="text-lg font-semibold text-gray-800">
                                    {product.name} <span className="text-gray-500">({product.netWeight})</span>
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Batch:</span> {product.batch}
                                    <span className="mx-2 text-gray-400">|</span>
                                    <span className="font-medium">Expire:</span> {product.expire}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Quantity:</span> {product.quantity}
                                </p>
                                <label className="flex justify-around items-center mt-3 text-gray-700 font-medium space-x-2">
                                    <span className="w-1/2 flex justify-end items-center">
                                        Return Quantity
                                    </span>
                                    <span className="w-1/2 flex justify-start items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max={product.quantity}
                                            value={returnData[`${product.productCode}-${product.batch}`] || 0}
                                            onChange={(e) => handleReturnChange(product.productCode, product.batch, parseInt(e.target.value) || 0)}
                                            className="w-1/2 h-7 text-center mt-1 px-3 py-2 border rounded-md transition"
                                        />
                                    </span>
                                </label>
                            </div>
                        ))}
                        <button
                            className="w-full px-4 py-2 my-1 text-white bg-green-500 rounded-md hover:bg-green-600"
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