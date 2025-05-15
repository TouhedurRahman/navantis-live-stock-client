import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import Swal from "sweetalert2";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useApiConfig from "../../../Hooks/useApiConfig";
import useCustomer from "../../../Hooks/useCustomer";
import useDepotProducts from "../../../Hooks/useDepotProducts";
import useOrders from "../../../Hooks/useOrders";

const OrderDelivery = () => {
    const baseUrl = useApiConfig();

    const [orders, , ordersRefetch] = useOrders();
    const [products, , productsRefetch] = useDepotProducts();
    const [customers] = useCustomer();

    const pendingOrders = orders.filter(order => order.status === 'pending');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [deliveryQuantities, setDeliveryQuantities] = useState({});

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleDeliveryChange = (batchId, value) => {
        setDeliveryQuantities((prev) => ({
            ...prev,
            [batchId]: Math.max(
                0,
                Math.min(
                    value,
                    products.find((p) => p._id === batchId)?.totalQuantity || 0
                )
            ),
        }));
    };

    const deletePendingOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/pending-order/${selectedOrderDetails._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error deleting pending order:", error);
        },
    });

    const addDeliveredOrderMutation = useMutation({
        mutationFn: async (newOrder) => {
            const response = await axios.post(`${baseUrl}/orders`, newOrder);
            return response.data;
        },
        onError: (error) => {
            console.error("Error add delivered ordered product:", error);
        },
    });

    const updateDepotProductsMutation = useMutation({
        mutationFn: async (data) => {
            const deliveredProducts = data;
            const responses = await Promise.all(
                deliveredProducts.map(async (updatedProduct) => {
                    const response = await axios.patch(
                        `${baseUrl}/depot-product/${updatedProduct._id}`,
                        updatedProduct
                    );
                    return response.data;
                })
            );
            return responses;
        },
        onError: (error) => {
            console.error("Error order delivery:", error);
        },
    });

    const addStockOutDepotMutation = useMutation({
        mutationFn: async (data) => {
            const deliveredProducts = data;
            const responses = await Promise.all(
                deliveredProducts.map(async (newProduct) => {
                    const response = await axios.post(
                        `${baseUrl}/stock-out-depot`,
                        newProduct
                    );
                    return response.data;
                })
            );
            return responses;
        },
        onError: (error) => {
            console.error("Error stock out delivery:", error);
        },
    });

    const handleDeliverySubmit = async () => {
        /* const deliveryData = Object.keys(deliveryQuantities).map((batchId) => ({
            batchId,
            deliveryQuantity: deliveryQuantities[batchId] || 0,
        })); */

        const deliveryData = Object.keys(deliveryQuantities)
            .map((batchId) => {
                const batchDetails = products.find((batch) => batch._id === batchId);

                return {
                    _id: batchId,
                    productName: batchDetails?.productName,
                    netWeight: batchDetails?.netWeight,
                    productCode: batchDetails?.productCode,
                    batch: batchDetails?.batch,
                    expire: batchDetails?.expire,
                    actualPrice: Number(batchDetails?.actualPrice),
                    tradePrice: Number(batchDetails?.tradePrice),
                    totalQuantity: Number(Number(batchDetails.totalQuantity) - Number(deliveryQuantities[batchId])),
                };
            });

        const dptSOutData = Object.keys(deliveryQuantities)
            .map((batchId) => {
                const batchDetails = products.find((batch) => batch._id === batchId);

                return {
                    productName: batchDetails?.productName,
                    netWeight: batchDetails?.netWeight,
                    productCode: batchDetails?.productCode,
                    batch: batchDetails?.batch,
                    expire: batchDetails?.expire,
                    actualPrice: Number(batchDetails?.actualPrice),
                    tradePrice: Number(batchDetails?.tradePrice),
                    totalQuantity: Number(deliveryQuantities[batchId]),
                };
            })
            .filter((item) => item.totalQuantity > 0);

        // console.log('Depot Stock out data:', dptSOutData);

        const totalPrice = Object.values(
            Object.keys(deliveryQuantities).reduce((acc, batchId) => {
                const product = products.find((product) => product._id === batchId);
                const productName = product?.productName;
                const tradePrice = product?.tradePrice || 0;
                const quantity = deliveryQuantities[batchId] || 0;

                if (productName && quantity > 0) {
                    if (acc[productName]) {
                        acc[productName] += tradePrice * quantity;
                    } else {
                        acc[productName] = tradePrice * quantity;
                    }
                }

                return acc;
            }, {})
        ).reduce((total, price) => total + price, 0);

        const pharmacyDiscount = selectedOrderDetails.discount;

        const lessDiscount = Number(totalPrice * (pharmacyDiscount / 100));

        const totalPayable = Number(totalPrice - lessDiscount);

        const deliveredOrder = {
            ...selectedOrderDetails,
            /* products: Object.values(
                Object.keys(deliveryQuantities).reduce((acc, batchId) => {
                    const product = products.find((product) => product._id === batchId);
                    const productName = product?.productName;
                    const productCode = product?.productCode;
                    const tradePrice = product?.tradePrice || 0;
                    const quantity = deliveryQuantities[batchId] || 0;

                    if (productName && quantity > 0) {
                        if (acc[productName]) {
                            acc[productName].quantity += quantity;
                            acc[productName].totalPrice += tradePrice * quantity;
                        } else {
                            acc[productName] = {
                                name: productName,
                                productCode,
                                tradePrice,
                                quantity,
                                totalPrice: tradePrice * quantity,
                            };
                        }
                    }

                    return acc;
                }, {})
            ), */

            products: Object.values(
                Object.keys(deliveryQuantities).reduce((acc, batchId) => {
                    const product = products.find((product) => product._id === batchId);
                    const productName = product?.productName;
                    const netWeight = product?.netWeight;
                    const productCode = product?.productCode;
                    const batch = product?.batch;
                    const expire = product?.expire;
                    const actualPrice = product?.actualPrice;
                    const tradePrice = product?.tradePrice || 0;
                    const quantity = deliveryQuantities[batchId] || 0;

                    const uniqueKey = `${productName}-${batchId}`;

                    if (productName && quantity > 0) {
                        if (acc[uniqueKey]) {
                            acc[uniqueKey].quantity += quantity;
                            acc[uniqueKey].totalPrice += tradePrice * quantity;
                        } else {
                            acc[uniqueKey] = {
                                name: productName,
                                netWeight,
                                productCode,
                                batch,
                                expire,
                                actualPrice,
                                tradePrice,
                                quantity,
                                totalPrice: tradePrice * quantity,
                            };
                        }
                    }
                    return acc;
                }, {})
            ).sort((a, b) => a.name.localeCompare(b.name)),

            totalProduct: Object.keys(
                Object.keys(deliveryQuantities).reduce((acc, batchId) => {
                    const product = products.find((product) => product._id === batchId);
                    const productName = product?.productName;
                    const quantity = deliveryQuantities[batchId] || 0;

                    if (productName && quantity > 0) {
                        acc[productName] = true;
                    }
                    return acc;
                }, {})
            ).length,

            totalUnit: Object.keys(deliveryQuantities).reduce(
                (total, batchId) => {
                    const quantity = deliveryQuantities[batchId] || 0;
                    return total + (quantity > 0 ? quantity : 0);
                },
                0
            ),

            totalPrice: Number(totalPrice),
            totalPayable: Number(totalPayable),
            status: "delivered",
            date: getTodayDate()
        };

        try {
            await Promise.all([
                deletePendingOrderMutation.mutateAsync(),
                addDeliveredOrderMutation.mutateAsync(deliveredOrder),
                updateDepotProductsMutation.mutateAsync(deliveryData),
                addStockOutDepotMutation.mutateAsync(dptSOutData)
            ]);

            ordersRefetch();
            productsRefetch();

            Swal.fire({
                title: "Success!",
                text: "Products successfully delivered",
                icon: "success",
                showConfirmButton: false,
                confirmButtonColor: "#3B82F6",
                timer: 1500
            });
        } catch (error) {
            console.error("Error adding product:", error);
            Swal.fire({
                title: "Error!",
                text: "Faild. Please try again.",
                icon: "error",
                showConfirmButton: false,
                confirmButtonColor: "#d33",
                timer: 1500
            });
        }

        setSelectedProducts(null);
        setDeliveryQuantities({});
    };

    const parseExpiry = (mmYY) => {
        const [month, year] = mmYY.trim().split('/').map(Number);
        return new Date(2000 + year, month - 1);
    };

    const getSortedProductsByExpiry = (productName, netWeight) => {
        return products
            .filter(
                (product) =>
                    product.productName.trim() === productName.trim() &&
                    product.netWeight.trim() === netWeight.trim()
            )
            .sort((a, b) => parseExpiry(a.expire) - parseExpiry(b.expire));
    };

    const initializeDeliveryQuantities = (orderProducts) => {
        const newQuantities = {};
        orderProducts.forEach((orderProduct) => {
            const { name, netWeight, quantity: orderQty } = orderProduct;
            const sortedDepotProducts = getSortedProductsByExpiry(name, netWeight);

            let remainingOrderQty = orderQty;

            sortedDepotProducts.forEach((depotProduct) => {
                const { _id: batchId, totalQuantity } = depotProduct;
                const deliverableQty = Math.min(remainingOrderQty, totalQuantity);
                if (deliverableQty > 0) {
                    newQuantities[batchId] = deliverableQty;
                    remainingOrderQty -= deliverableQty;
                }
            });
        });

        setDeliveryQuantities(newQuantities);
    };

    const handleDeliver = () => {
        const selectedPharmacy = customers.find(
            customer =>
                customer.customerId === selectedOrderDetails.pharmacyId
        );

        const unpaidCashOrder = orders.find(
            order =>
                order._id !== selectedOrderDetails._id
                &&
                order.pharmacyId === selectedOrderDetails.pharmacyId
                &&
                order.status !== "paid"
        );

        if (selectedOrderDetails.payMode === "Cash" && !selectedPharmacy?.payMode?.includes("STC")) {
            // Check for any cash order placed today
            const hasCashOrderToday = orders.some(
                order =>
                    order.pharmacyId === selectedPharmacy.customerId
                    &&
                    order.payMode === "Cash"
                    &&
                    (
                        order.status === "delivered"
                        ||
                        order.status === "due"
                        ||
                        order.status === "outstanding"
                        ||
                        order.status === "paid"
                    )
                    &&
                    new Date(order.date).toDateString() === new Date().toDateString()
            );

            // Check for any unpaid cash order (any date)
            const hasAnyUnpaidCash = orders.some(
                order =>
                    order.pharmacyId === selectedPharmacy.customerId
                    &&
                    order.payMode === "Cash"
                    &&
                    !["paid", "pending"].includes(order.status.toLowerCase())
            );

            if (hasCashOrderToday) {
                Swal.fire({
                    icon: "warning",
                    title: "Order Restricted",
                    text: "A cash order has already been placed today. Only one cash order per day is allowed."
                });
                return;
            } else if (hasAnyUnpaidCash) {
                Swal.fire({
                    icon: "error",
                    title: "Order Blocked",
                    text: `Unpaid order found (Invoice No. ${unpaidCashOrder?.invoice}). Please clear payment first.`
                });
                return;
            } else {
                handleDeliverySubmit();
            }
        } else if (selectedOrderDetails.payMode === "Credit" && selectedPharmacy?.payMode?.includes("Credit")) {
            const today = new Date();

            const overdueOrders = orders.filter(order => {
                const orderDate = new Date(order.date);
                const diffInDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

                return (
                    order.pharmacyId === selectedPharmacy?.customerId &&
                    order.payMode === "Credit" &&
                    order.status === "due" &&
                    diffInDays > selectedPharmacy.dayLimit
                );
            });

            if (overdueOrders.length === 0) {
                const creditDues = orders.filter(
                    order =>
                        order.pharmacyId == selectedPharmacy.customerId
                        &&
                        order.status === "due"
                ).reduce(
                    (sum, order) => sum + order.due, 0
                )

                const availableCrLimit = selectedPharmacy?.crLimit - creditDues;

                if (availableCrLimit > 0 && availableCrLimit >= selectedOrderDetails.totalPayable) {
                    handleDeliverySubmit();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Credit Limit Exceeded",
                        text: "Customer do not have a sufficient credit limit!"
                    });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Order Blocked",
                    text: "Overdue orders found!"
                });
            }
        } else {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const stcOrderLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10);
            const lastDayAllowed = new Date(currentDate.getFullYear(), currentDate.getMonth(), 28);

            const previousUnpaidSTC = orders.some(order =>
                order.pharmacyId === selectedPharmacy?.customerId
                &&
                order.payMode === "STC"
                &&
                order.status.toLowerCase() === "due"
                &&
                new Date(order.date) < firstDayOfMonth
            );

            if (previousUnpaidSTC) {
                Swal.fire({
                    icon: "error",
                    title: "Order Blocked",
                    text: "Overdue STC orders found!"
                });
            } else {
                const stcOrders = orders.filter(order =>
                    order.pharmacyId === selectedPharmacy?.customerId
                    &&
                    order.payMode === "STC"
                    &&
                    order.status !== "pending"
                    &&
                    new Date(order.date) >= firstDayOfMonth
                    &&
                    new Date(order.date) <= lastDayAllowed
                );

                const hasUnpaidSTC = stcOrders.some(order => order.status.toLowerCase() === "due");

                if (hasUnpaidSTC) {
                    if (currentDate <= lastDayAllowed) {
                        if (selectedOrderDetails.payMode === "Cash") {
                            handleDeliverySubmit();
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Order Restricted",
                                text: "Due STC orders found! Only Cash payments are allowed until payment is cleared."
                            });
                        }
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Order Blocked",
                            text: "Overdue STC orders found! You cannot place any new orders until payment is made."
                        });
                    }
                } else {
                    if (selectedOrderDetails.payMode === "STC") {
                        if (currentDate <= stcOrderLastDay) {
                            const hasAnySTCOrderThisMonth = stcOrders.length > 0;

                            if (hasAnySTCOrderThisMonth) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Order Not Allowed",
                                    text: "An STC order has already been placed this month. You can't place another."
                                });
                            } else if (selectedPharmacy?.crLimit >= selectedOrderDetails.totalPayable) {
                                handleDeliverySubmit();
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Credit Limit Exceeded",
                                    text: "Customer do not have a sufficient credit limit!"
                                });
                            }
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Order Restriction Notice",
                                text: "STC orders cannot be placed after the 10th day of the current month. However, you may still place a cash order."
                            });
                        }
                    } else {
                        // Check for any cash order placed today
                        const hasCashOrderToday = orders.some(
                            order =>
                                order.pharmacyId === selectedPharmacy.customerId
                                &&
                                order.payMode === "Cash"
                                &&
                                (
                                    order.status === "delivered"
                                    ||
                                    order.status === "due"
                                    ||
                                    order.status === "outstanding"
                                    ||
                                    order.status === "paid"
                                )
                                &&
                                new Date(order.date).toDateString() === new Date().toDateString()
                        );

                        // Check for any unpaid cash order (any date)
                        const hasAnyUnpaidCash = orders.some(
                            order =>
                                order.pharmacyId === selectedPharmacy.customerId
                                &&
                                order.payMode === "Cash"
                                &&
                                !["paid", "pending"].includes(order.status.toLowerCase())
                        );

                        if (hasCashOrderToday) {
                            Swal.fire({
                                icon: "warning",
                                title: "Order Restricted",
                                text: "A cash order has already been placed today. Only one cash order per day is allowed."
                            });
                            return;
                        } else if (hasAnyUnpaidCash) {
                            Swal.fire({
                                icon: "error",
                                title: "Order Blocked",
                                text: `Unpaid order found (Invoice No. ${unpaidCashOrder?.invoice}). Please clear payment first.`
                            });
                            return;
                        } else {
                            handleDeliverySubmit();
                        }
                    }
                }
            }
        }
    }

    return (
        <>
            <div>
                <PageTitle from={"Depot"} to={"Order delivery"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Order delivery</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>

                {/* Order List */}
                <div className="px-6 space-y-4 mb-4">
                    {pendingOrders.map((order) => (
                        <div
                            key={order._id}
                            className="w-full bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-300"
                        >
                            {/* Top Row: Pharmacy Name, ID, Territory */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Pharmacy Name */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500/10 text-blue-600 p-2 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M3 21V7a2 2 0 012-2h3V3h8v2h3a2 2 0 012 2v14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                                        <p className="font-semibold text-base">{order.pharmacy}</p>
                                    </div>
                                </div>

                                {/* Customer ID */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-500/10 text-indigo-600 p-2 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer ID</p>
                                        <p className="font-medium">{order.pharmacyId}</p>
                                    </div>
                                </div>

                                {/* Territory */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-500/10 text-purple-600 p-2 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M12 2a10 10 0 00-7.546 16.953l-1.69 1.69a1 1 0 001.414 1.414l1.69-1.69A10 10 0 1012 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Territory</p>
                                        <p className="font-medium">{order.territory}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Second Row: Address, Payment Mode, Order Date */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Address */}
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-500/10 text-gray-700 dark:text-gray-300 p-2 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
                                            <path d="M12 22s8-4.5 8-10a8 8 0 10-16 0c0 5.5 8 10 8 10z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="text-sm">
                                            {customers.find(c => c.customerId === order.pharmacyId)?.address || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-500/10 text-green-600 p-2 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M17 9V7a4 4 0 00-8 0v2m-4 0h16v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment Mode</p>
                                        <p className="text-sm">{order.payMode}</p>
                                    </div>
                                </div>

                                {/* Order Date */}
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-500/10 text-red-600 p-2 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7H3v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                                        <p className="text-sm">
                                            {new Date(order.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-start items-center gap-3 mt-3">
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    View Assign Info
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedOrderDetails(order);
                                        setSelectedProducts(order.products);
                                        initializeDeliveryQuantities(order.products);
                                    }}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M3 7h18M3 12h18M3 17h18" />
                                    </svg>
                                    View Ordered Products
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Assign Person Info */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                        <h2 className="text-lg font-bold mb-4">Assign Person Info</h2>
                        <hr />
                        <div className="space-y-2 text-gray-800 dark:text-gray-100 my-3">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Ordered By</p>
                                <p className="font-medium">{selectedOrder.orderedBy}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Area Manager</p>
                                <p className="font-medium">{selectedOrder.areaManager}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Zonal Manager</p>
                                <p className="font-medium">{selectedOrder.zonalManager}</p>
                            </div>
                        </div>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                            onClick={() => setSelectedOrder(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Modal for Ordered Products */}
            {selectedProducts && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
                        <h2 className="text-lg font-bold mb-4">Ordered Products</h2>
                        <hr />
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Product</th>
                                    <th className="p-2 text-center">Net Weight</th>
                                    <th className="p-2 text-right">TP</th>
                                    <th className="p-2 text-right">Order Qty</th>
                                    <th className="p-2 text-right">Available Qty</th>
                                    <th className="p-2 text-center">Expire</th>
                                    <th className="p-2">Delivery</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(
                                    selectedProducts.reduce((acc, product) => {
                                        const key = `${product.name} - ${product.netWeight}`;
                                        if (!acc[key]) acc[key] = [];
                                        acc[key].push(product);
                                        return acc;
                                    }, {})
                                ).map(([productKey, products]) => {
                                    const totalOrderQty = products.reduce(
                                        (sum, p) => sum + p.quantity,
                                        0
                                    );

                                    const [productName, netWeight] = productKey.split(" - ");

                                    const sortedDepotProducts = getSortedProductsByExpiry(productName, netWeight);

                                    let remainingOrderQty = totalOrderQty;

                                    return (
                                        <React.Fragment key={productKey}>
                                            {sortedDepotProducts.map((depotProduct, index) => {
                                                const deliverableQty = Math.min(
                                                    remainingOrderQty,
                                                    depotProduct.totalQuantity
                                                );
                                                remainingOrderQty -= deliverableQty;

                                                const [name, unitSize] = productKey.split(" - ");

                                                return (
                                                    <tr key={depotProduct._id} className="border-b">
                                                        {index === 0 && (
                                                            <>
                                                                <td className="p-2" rowSpan={sortedDepotProducts.length}>
                                                                    {name}
                                                                </td>
                                                                <td className="p-2 text-center" rowSpan={sortedDepotProducts.length}>
                                                                    {unitSize}
                                                                </td>
                                                                <td className="p-2 text-right" rowSpan={sortedDepotProducts.length}>
                                                                    {depotProduct.tradePrice}/-
                                                                </td>
                                                                <td className="p-2 text-right" rowSpan={sortedDepotProducts.length}>
                                                                    {totalOrderQty}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td className="p-2 text-right">{depotProduct.totalQuantity}</td>
                                                        <td className="p-2 text-center">{depotProduct.expire}</td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                className="border rounded p-1 w-16"
                                                                placeholder="Qty"
                                                                value={
                                                                    deliveryQuantities[
                                                                    depotProduct._id
                                                                    ] ?? 0
                                                                }
                                                                onChange={(e) => {
                                                                    const dQty = Number(e.target.value);
                                                                    if (dQty <= totalOrderQty) {
                                                                        handleDeliveryChange(
                                                                            depotProduct._id,
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={() => {
                                    setSelectedProducts(null);
                                    setDeliveryQuantities({});
                                }}
                            >
                                Close
                            </button>
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={handleDeliver}
                            // onClick={handleDeliverySubmit}
                            >
                                Deliver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderDelivery;