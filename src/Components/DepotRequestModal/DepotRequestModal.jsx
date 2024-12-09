import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useDepotProducts from '../../Hooks/useDepotProducts';
import useDepotRequest from '../../Hooks/useDepotRequest';
import useWhProducts from '../../Hooks/useWhProducts';
import './DepotRequestModal.css';

const DepotRequestModal = ({ isOpen, onClose }) => {
    const { user } = true;
    const [whProducts, whProductsLoading] = useWhProducts();
    const [products] = useDepotProducts();
    const [depotReqProducts] = useDepotRequest();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const uniqueWhProductNames = [
        ...new Set(
            whProducts
                .filter(product => product.totalQuantity >= 1)
                .map(product => product.productName)
        )
    ];

    const handleProductChange = (e) => {
        const selectedProductName = e.target.value;
        const product = whProducts.find(
            (product) => product.productName === selectedProductName
        );
        setSelectedProduct(product || null);
    };

    const selectedProQinDepot = selectedProduct
        ? products
            .filter((product) => product.productName === selectedProduct.productName)
            .reduce((sum, product) => sum + product.totalQuantity, 0)
        : 0;

    // console.log(selectedProQinDepot)

    const selectedProQinWh = selectedProduct
        ? whProducts
            .filter(product => product.productName === selectedProduct.productName)
            .reduce((sum, product) => sum + product.totalQuantity, 0)
        : 0;

    // console.log(selectedProQinWh);

    const depotRequestQuantity = selectedProduct
        ? depotReqProducts
            .filter(product =>
                product.productName === selectedProduct.productName &&
                product.status === "requested"
            )
            .find(product => product.requestedQuantity)?.requestedQuantity || 0
        : 0;

    // console.log(depotRequestQuantity);

    const dptReqApprovedQuantity = selectedProduct
        ? depotReqProducts
            .filter(product =>
                product.productName === selectedProduct.productName &&
                product.status === "approved"
            )
            .find(product => product.approvedQuantity)?.approvedQuantity || 0
        : 0;

    // console.log(dptReqApprovedQuantity);

    const addDptReqMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: selectedProduct.productName,
                requestedQuantity: Number(data.requestedQuantity),
                requestedDate: getTodayDate(),
                status: "requested",
                addedby: user?.displayName || "Navantis Pharma Limited",
                addedemail: user?.email || "info@navantispharma.com"
            };

            const response = await axios.post('http://localhost:5000/dpot-request', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error depot request:", error);
        },
    });

    const onSubmit = async (data) => {
        try {
            await Promise.all([
                addDptReqMutation.mutateAsync(data)
            ]);

            reset();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Depot request done",
                showConfirmButton: false,
                timer: 1500
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Depot request faild",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

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
                    <h2 className="text-xl font-semibold">Request from Warehouse</h2>
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
                    {whProductsLoading ? (
                        <p className="text-center text-gray-700">Loading products...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Select Product */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Product <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('productId', { required: 'Please select a product.' })}
                                    className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={handleProductChange}
                                >
                                    <option value="">-- Select a product --</option>
                                    {uniqueWhProductNames.map((productName, index) => (
                                        <option key={index} value={productName}>
                                            {productName}
                                        </option>
                                    ))}
                                </select>
                                {errors.productId && (
                                    <p className="mt-1 text-sm text-red-500">{errors.productId.message}</p>
                                )}
                            </div>

                            {/* Selected Product Details */}
                            {selectedProduct && (
                                <div className="felx justify-center items-center bg-white p-6 rounded-lg shadow-lg transform transition duration-300">
                                    <h3 className="text-2xl font-extrabold text-green-900 mb-4 text-center border-b-2 border-green-300 pb-2">
                                        {selectedProduct.productName}
                                    </h3>
                                    <div className="w-full grid grid-cols md: grid-cols-2 gap-4">
                                        <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                            <p className="text-sm font-medium text-green-700 uppercase">Available in Depot</p>
                                            <p className="text-3xl font-extrabold mt-2">{selectedProQinDepot}</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                            <p className="text-sm font-medium text-green-700 uppercase">Requested</p>
                                            <p className="text-3xl font-extrabold mt-2">{depotRequestQuantity}</p>
                                        </div>
                                    </div>
                                    {
                                        dptReqApprovedQuantity > 0
                                        &&
                                        <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                            <p className="text-sm font-medium text-green-700">
                                                <span className="processing-text">Processing<span className="dots"></span></span>
                                            </p>
                                            <div className="mt-4 text-sm text-center font-medium text-gray-800 flex justify-center items-center">
                                                You will receive
                                                <span className="text-xl text-green-700 mx-2">
                                                    {dptReqApprovedQuantity}
                                                </span>
                                                products in a short while.
                                            </div>
                                        </div>

                                    }
                                </div>
                            )}

                            {/* Requested Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Request Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('requestedQuantity', {
                                        required: 'Requested quantity is required.',
                                        min: {
                                            value: 1,
                                            message: 'Requested quantity must be at least 1.',
                                        },
                                        max: {
                                            value: (selectedProQinWh - (depotRequestQuantity + dptReqApprovedQuantity)),
                                            message: 'Requested quantity exceeds warehouse stock.',
                                        },
                                    })}
                                    type="number"
                                    className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter requested quantity"
                                    disabled={!selectedProduct}
                                    onWheel={(e) => e.target.blur()}
                                />
                                {errors.requestedQuantity && (
                                    <p className="mt-1 text-sm text-red-500">{errors.requestedQuantity.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!selectedProduct}
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
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

export default DepotRequestModal;