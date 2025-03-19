import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import Swal from "sweetalert2";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useDepotProducts from "../../../Hooks/useDepotProducts";
import useOrders from "../../../Hooks/useOrders";

const OrderDelivery = () => {
    const [orders, , ordersRefetch] = useOrders();
    const [products, , productsRefetch] = useDepotProducts();

    const pendingOrders = orders.filter(order => order.status === 'pending');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [deliveryQuantities, setDeliveryQuantities] = useState({});

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
            const response = await axios.delete(`http://localhost:5000/pending-order/${selectedOrderDetails._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error deleting pending order:", error);
        },
    });

    const addDeliveredOrderMutation = useMutation({
        mutationFn: async (newOrder) => {
            const response = await axios.post('http://localhost:5000/orders', newOrder);
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
                        `http://localhost:5000/depot-product/${updatedProduct._id}`,
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
                        'http://localhost:5000/stock-out-depot',
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
        // console.log(selectedOrderDetails);

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
                    productCode: batchDetails?.productCode,
                    batch: batchDetails?.batch,
                    expire: batchDetails?.expire,
                    actualPrice: Number(batchDetails?.actualPrice),
                    tradePrice: Number(batchDetails?.tradePrice),
                    totalQuantity: Number(Number(batchDetails.totalQuantity) - Number(deliveryQuantities[batchId])),
                };
            });

        // console.log("Delivery Data:", deliveryData);

        const dptSOutData = Object.keys(deliveryQuantities)
            .map((batchId) => {
                const batchDetails = products.find((batch) => batch._id === batchId);

                return {
                    productName: batchDetails?.productName,
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
            status: "delivered"
        };

        // console.log(deliveredOrder);

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

    const getSortedProductsByExpiry = (productName) => {
        return products
            .filter((product) => product.productName === productName)
            .sort((a, b) => new Date(a.expire) - new Date(b.expire));
    };

    const initializeDeliveryQuantities = (orderProducts) => {
        const newQuantities = {};
        orderProducts.forEach((orderProduct) => {
            const { name, quantity: orderQty } = orderProduct;
            const sortedDepotProducts = getSortedProductsByExpiry(name);

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
                <div className="px-6">
                    {pendingOrders.map((order) => (
                        <div
                            key={order._id}
                            className="border rounded-lg mb-4 p-4 shadow-sm bg-gray-100"
                        >
                            <p>
                                <strong>Pharmacy:</strong> {order.pharmacy}
                            </p>
                            <p>
                                <strong>Territory:</strong> {order.territory}
                            </p>
                            <p>
                                <strong>Order Date:</strong> {order.date}
                            </p>
                            <div className="mt-3 flex gap-4">
                                {/* Button to view assigned person information */}
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    View Assign Info
                                </button>
                                {/* Button to view ordered products */}
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                    onClick={() => {
                                        setSelectedOrderDetails(order);
                                        setSelectedProducts(order.products);
                                        initializeDeliveryQuantities(order.products);
                                    }}
                                >
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
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Assign Person Info</h2>
                        <p>
                            <strong>Ordered By:</strong> {selectedOrder.orderedBy}
                        </p>
                        <p>
                            <strong>Area Manager:</strong> {selectedOrder.areaManager}
                        </p>
                        <p>
                            <strong>Zonal Manager:</strong> {selectedOrder.zonalManager}
                        </p>
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
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Product</th>
                                    <th className="p-2">Order Qty</th>
                                    <th className="p-2">Available</th>
                                    <th className="p-2">Expire</th>
                                    <th className="p-2">Delivery</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(
                                    selectedProducts.reduce((acc, product) => {
                                        if (!acc[product.name]) acc[product.name] = [];
                                        acc[product.name].push(product);
                                        return acc;
                                    }, {})
                                ).map(([productName, products]) => {
                                    const totalOrderQty = products.reduce(
                                        (sum, p) => sum + p.quantity,
                                        0
                                    );
                                    const sortedDepotProducts = getSortedProductsByExpiry(
                                        productName
                                    );
                                    let remainingOrderQty = totalOrderQty;

                                    return (
                                        <React.Fragment key={productName}>
                                            {sortedDepotProducts.map(
                                                (depotProduct, index) => {
                                                    const deliverableQty = Math.min(
                                                        remainingOrderQty,
                                                        depotProduct.totalQuantity
                                                    );
                                                    remainingOrderQty -= deliverableQty;

                                                    return (
                                                        <tr
                                                            key={depotProduct._id}
                                                            className="border-b"
                                                        >
                                                            {index === 0 && (
                                                                <>
                                                                    <td
                                                                        className="p-2"
                                                                        rowSpan={
                                                                            sortedDepotProducts.length
                                                                        }
                                                                    >
                                                                        {productName}
                                                                    </td>
                                                                    <td
                                                                        className="p-2"
                                                                        rowSpan={
                                                                            sortedDepotProducts.length
                                                                        }
                                                                    >
                                                                        {totalOrderQty}
                                                                    </td>
                                                                </>
                                                            )}
                                                            <td className="p-2">
                                                                {depotProduct.totalQuantity}
                                                            </td>
                                                            <td className="p-2">
                                                                {depotProduct.expire}
                                                            </td>
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
                                                                    onChange={(e) =>
                                                                        handleDeliveryChange(
                                                                            depotProduct._id,
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
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
                                onClick={handleDeliverySubmit}
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