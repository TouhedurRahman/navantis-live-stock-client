import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useOrders from '../../Hooks/useOrders';

const ExpireRequestModal = ({ isOpen, onClose }) => {
    const { user } = true;
    const [orders, loading] = useOrders();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    const [uniqueProducts, setUniqueProducts] = useState([]);
    const [orderedByList, setOrderedByList] = useState([]);
    const [selectedProductCode, setSelectedProductCode] = useState('');
    const [areaManager, setAreaManager] = useState('');
    const [zonalManager, setZonalManager] = useState('');

    useEffect(() => {
        if (orders?.length) {
            const productsMap = {};
            orders.forEach(order => {
                order.products.forEach(product => {
                    if (!productsMap[product.name]) {
                        productsMap[product.name] = product.productCode;
                    }
                });
            });
            setUniqueProducts(Object.entries(productsMap).map(([name, productCode]) => ({ name, productCode })));

            const uniqueOrderedBy = [...new Set(orders.map(order => order.orderedBy))];
            setOrderedByList(uniqueOrderedBy);
        }
    }, [orders]);

    const handleProductChange = (e) => {
        const product = uniqueProducts.find(p => p.name === e.target.value);
        setSelectedProductCode(product?.productCode || '');
    };

    const handleOrderedByChange = (e) => {
        const selectedOrder = orders.find(order => order.orderedBy === e.target.value);
        setAreaManager(selectedOrder?.areaManager || '');
        setZonalManager(selectedOrder?.zonalManager || '');
    };

    const onSubmit = async (data) => {
        try {
            console.log(data);
            reset();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Expire Return added",
                showConfirmButton: false,
                timer: 1500
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Something went wrong!",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
                className={`bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5`}
                style={{ maxHeight: '90%' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Expire Return</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="px-5 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {loading ? (
                        <p className="text-center text-gray-700">Loading products...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Select Product */}
                            <div>
                                <label className="block mb-1 font-semibold">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('productName', { required: 'Product name is required' })}
                                    onChange={handleProductChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="">Select a product</option>
                                    {uniqueProducts.map(product => (
                                        <option key={product.name} value={product.name}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.productName && <p className="text-red-500 text-sm">{errors.productName.message}</p>}
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">Product Short Code</label>
                                <input
                                    value={selectedProductCode}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                                />
                            </div>

                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <label className="block mb-1 font-semibold">
                                            Batch <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register("batch", { required: "Batch is required" })}
                                            placeholder="Enter product batch/batch no"
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                        {errors.batch && <p className="text-red-500 text-sm">{errors.batch.message}</p>}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block mb-1 font-semibold">
                                            Expire MM/YY <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register("expire", {
                                                required: "Expire date is required",
                                                pattern: {
                                                    value: /^(0[1-9]|1[0-2])\/\d{2}$/, // Matches MM/YY format
                                                    message: "Invalid date format. Use MM/YY"
                                                }
                                            })}
                                            placeholder="MM/YY"
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                        {errors.expire && <p className="text-red-500 text-sm">{errors.expire.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">
                                    Ordered By <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('orderedBy', { required: 'Ordered by is required' })}
                                    onChange={handleOrderedByChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="">Select an ordered by</option>
                                    {orderedByList.map(name => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                {errors.orderedBy && <p className="text-red-500 text-sm">{errors.orderedBy.message}</p>}
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">Area Manager</label>
                                <input
                                    value={areaManager}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">Zonal Manager</label>
                                <input
                                    value={zonalManager}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
                </div>

                <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                    <button className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpireRequestModal;