import React, { useState } from 'react';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useDepotProducts from '../../../Hooks/useDepotProducts';
import useOrders from '../../../Hooks/useOrders';

const OrderDelivery = () => {
    const [orders] = useOrders();
    const [products] = useDepotProducts();

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [deliveryQuantities, setDeliveryQuantities] = useState({});

    const handleDeliveryChange = (productId, value) => {
        setDeliveryQuantities((prev) => ({
            ...prev,
            [productId]: Math.max(0, Math.min(value, products.find(p => p._id === productId)?.totalQuantity || 0)),
        }));
    };

    const handleDeliverySubmit = () => {
        const deliveryData = selectedProducts.map((product) => ({
            productId: product.id,
            deliveryQuantity: deliveryQuantities[product.id] || 0,
        }));

        console.log("Delivery Data Submitted:", deliveryData);
        setSelectedProducts(null);
        setDeliveryQuantities({});
    };

    // Function to find the next product with the nearest expiry date
    const getNextExpireProduct = (orderProduct) => {
        const sortedProducts = products
            .filter((p) => p._id !== orderProduct.id) // Exclude the current product
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); // Sort by nearest expiry date

        return sortedProducts[0]; // Return the next product with the nearest expiry
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
                    {orders.map((order) => (
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
                                    onClick={() => setSelectedProducts(order.products)}
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
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
                        <h2 className="text-lg font-bold mb-4">Ordered Products</h2>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Product</th>
                                    <th className="p-2">Quantity</th>
                                    <th className="p-2">Available</th>
                                    <th className="p-2">Delivery</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedProducts.map((product) => {
                                    const depotProduct = products.find(
                                        (d) => d._id === product.id
                                    );

                                    // Check if the order quantity exceeds available quantity
                                    if (product.quantity > (depotProduct?.totalQuantity || 0)) {
                                        const nextProduct = getNextExpireProduct(product);
                                        return (
                                            <tr key={product.id} className="border-b">
                                                <td className="p-2">{product.name}</td>
                                                <td className="p-2">{product.quantity}</td>
                                                <td className="p-2">
                                                    {depotProduct?.totalQuantity || 0}
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        className="border rounded p-1 w-16"
                                                        placeholder="Qty"
                                                        value={deliveryQuantities[product.id] || ""}
                                                        onChange={(e) =>
                                                            handleDeliveryChange(product.id, Number(e.target.value))
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    }
                                    return (
                                        <tr key={product.id} className="border-b">
                                            <td className="p-2">{product.name}</td>
                                            <td className="p-2">{product.quantity}</td>
                                            <td className="p-2">
                                                {depotProduct?.totalQuantity || 0}
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    className="border rounded p-1 w-16"
                                                    placeholder="Qty"
                                                    value={deliveryQuantities[product.id] || ""}
                                                    onChange={(e) =>
                                                        handleDeliveryChange(product.id, Number(e.target.value))
                                                    }
                                                />
                                            </td>
                                        </tr>
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