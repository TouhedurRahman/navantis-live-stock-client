import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import useOrders from "../../Hooks/useOrders";

const ReturnProductsModal = ({ isOpen, onClose }) => {
    const [orders, , refetch] = useOrders();
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

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

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

    const updateOrderMutation = useMutation({
        mutationFn: async (data) => {
            const { _id, ...orderData } = data;

            const updatedOrder = {
                ...orderData,
            };

            const response = await axios.patch(`http://localhost:5000/order/${_id}`, updatedOrder);
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating order:", error);
        },
    });

    const addDepotProductMutation = useMutation({
        mutationFn: async (products) => {
            for (const item of products) {
                const newProduct = {
                    productName: item.name,
                    netWeight: item.netWeight,
                    productCode: item.productCode,
                    batch: item.batch,
                    expire: item.expire,
                    actualPrice: item.actualPrice,
                    tradePrice: item.tradePrice,
                    totalQuantity: item.quantity,
                };

                await axios.post('http://localhost:5000/depot-products', newProduct);
            }
        },
        onError: (error) => {
            console.error("Error adding product to depot:", error);
        },
    });

    const stockInDepotProductMutation = useMutation({
        mutationFn: async (products) => {
            for (const item of products) {
                const newProduct = {
                    productName: item.name,
                    netWeight: item.netWeight,
                    productCode: item.productCode,
                    batch: item.batch,
                    expire: item.expire,
                    actualPrice: item.actualPrice,
                    tradePrice: item.tradePrice,
                    totalQuantity: item.quantity,
                    date: getTodayDate()
                };

                await axios.post('http://localhost:5000/stock-in-depot', newProduct);
            }
        },
        onError: (error) => {
            console.error("Error stock in product to depot:", error);
        },
    });

    const handleReturnSubmit = async () => {
        if (!selectedOrder) return;

        const productsReturned = [];
        const updatedProducts = selectedOrder.products
            .map((product) => {
                const returnKey = `${product.productCode}-${product.batch}`;
                const returnQuantity = returnData[returnKey] || 0;

                if (returnQuantity > 0) {
                    productsReturned.push({
                        name: product.name,
                        netWeight: product.netWeight,
                        productCode: product.productCode,
                        batch: product.batch,
                        expire: product.expire,
                        tradePrice: product.tradePrice,
                        actualPrice: product.actualPrice,
                        quantity: returnQuantity,
                        totalPrice: product.tradePrice * returnQuantity
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

        const uniqueUpdateProducts = new Set(orderUpdate.products.map(product => product.name));
        const totalProduct = uniqueUpdateProducts.size;

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

        const uniqueRerurnedProducts = new Set(productsReturned.map(product => product.name));
        const totalReturnedProduct = uniqueRerurnedProducts.size;

        const totalReturnedUnit = productsReturned.reduce((sum, product) => sum + product.quantity, 0);
        const totalReturnedPrice = productsReturned.reduce((sum, product) => sum + product.totalPrice, 0);

        const returnedProducts = {
            email: selectedOrder.email,
            orderedBy: selectedOrder.orderedBy,
            areaManager: selectedOrder.areaManager,
            zonalManager: selectedOrder.zonalManager,
            territory: selectedOrder.territory,
            parentTerritory: selectedOrder.parentTerritory,
            pharmacy: selectedOrder.pharmacy,
            pharmacyId: selectedOrder.pharmacyId,
            invoice: selectedOrder.invoice,
            products: productsReturned,
            totalProduct: totalReturnedProduct,
            totalUnit: totalReturnedUnit,
            totalPrice: totalReturnedPrice,
            date: getTodayDate()
        }

        console.log("Returned Products: ", returnedProducts);

        try {
            await Promise.all([
                updateOrderMutation.mutateAsync(updatedOrder),
                addDepotProductMutation.mutateAsync(productsReturned),
                stockInDepotProductMutation.mutateAsync(productsReturned)
            ]);

            onClose();

            Swal.fire({
                title: "Success!",
                text: "Products Return successfull",
                icon: "success",
                showConfirmButton: false,
                confirmButtonColor: "#3B82F6",
                timer: 1500
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "Faild. Please try again.",
                icon: "error",
                showConfirmButton: false,
                confirmButtonColor: "#d33",
                timer: 1500
            });
        }
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
                        <div>
                            <p className="text-xl text-center font-mono font-medium text-gray-600">{selectedOrder.pharmacy}</p>
                            <p className="text-sm text-center text-gray-600 mt-1">
                                <span className="font-medium">Cus. ID: </span> {selectedOrder.pharmacyId}
                                <span className="mx-2 text-gray-400">|</span>
                                <span className="font-medium">Territory: </span> {selectedOrder.territory}
                            </p>
                            <p className="text-sm text-center font-medium mt-4 mb-2">Ordered Products <span className="text-[10px] text-gray-400">(Total Products: {selectedOrder.totalProduct} | Total Unit: {selectedOrder.totalUnit})</span></p>
                        </div>

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