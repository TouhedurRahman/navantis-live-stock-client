import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useApiConfig from '../../Hooks/useApiConfig';
import useCustomer from '../../Hooks/useCustomer';
import useOrders from '../../Hooks/useOrders';

const ExpireRequestModal = ({ isOpen, onClose }) => {
    const baseUrl = useApiConfig();
    const [orders, loading] = useOrders();
    const [pharmacies, pharmacyLoading] = useCustomer();
    const [productInputType, setProductInputType] = useState('select');

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    const [uniqueProducts, setUniqueProducts] = useState([]);
    const [orderedByList, setOrderedByList] = useState([]);
    const [selectedProductCode, setSelectedProductCode] = useState('');
    const [territory, setTerritory] = useState('');
    const [parentTerritory, setParentTerritory] = useState('');
    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [areaManager, setAreaManager] = useState('');
    const [zonalManager, setZonalManager] = useState('');

    const selectedPharmacyId = watch('pharmacy');

    const selectedPharmacyDetails = pharmacies?.find(pharmacy => pharmacy._id === selectedPharmacyId);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

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
        const territoryName = selectedOrder?.territory ?? null;
        const filterPharmacies = pharmacies.filter(pharmacy => pharmacy.territory === territoryName);

        setTerritory(territoryName);
        setAreaManager(selectedOrder?.areaManager || '');
        setParentTerritory(selectedOrder?.parentTerritory || '');
        setZonalManager(selectedOrder?.zonalManager || '');
        setFilteredPharmacies(filterPharmacies);
    };

    const addExReturnMutation = useMutation({
        mutationFn: async (data) => {
            const tp = Number(((data.mrp - (data.mrp * 0.13))).toFixed(2));
            const TotalTP = tp * data.quantity;

            const newReturn = {
                productName: data.productName,
                netWeight: `${data.netWeight} ${data.weightUnit}`,
                batch: data.batch,
                expire: data.expire,
                tradePrice: tp,
                totalPrice: TotalTP,
                totalQuantity: Number(data.quantity),
                pharmacy: selectedPharmacyDetails.name,
                pharmacyId: selectedPharmacyDetails.customerId,
                returnedBy: data.returnedBy,
                territory,
                areaManager,
                parentTerritory,
                zonalManager,
                status: 'pending',
                date: getTodayDate()
            };

            const response = await axios.post(`${baseUrl}/expired-returns`, newReturn);
            return response.data;
        },
        onError: (error) => {
            console.error("Error expire return:", error);
        },
    });

    const onSubmit = async (data) => {
        try {
            addExReturnMutation.mutateAsync(data);

            reset();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Expire Return added",
                showConfirmButton: false,
                timer: 1500
            });
            onClose();
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
                            <div>
                                <label className="block mb-1 font-semibold">
                                    Product Name <span className="text-red-500">*</span>
                                </label>

                                <div className="flex justify-center items-center gap-2 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setProductInputType('select')}
                                        className={`px-3 py-1 rounded border ${productInputType === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                    >
                                        Select
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProductInputType('manual')}
                                        className={`px-3 py-1 rounded border ${productInputType === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                                    >
                                        Manual
                                    </button>
                                </div>

                                {productInputType === 'select' && (
                                    <select
                                        {...register('productName', { required: 'Product name is required' })}
                                        onChange={handleProductChange}
                                        className="w-full px-3 py-2 border"
                                    >
                                        <option value="">Select a product</option>
                                        {uniqueProducts.map(product => (
                                            <option key={product.name} value={product.name}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {productInputType === 'manual' && (
                                    <input
                                        type="text"
                                        {...register('productName', { required: 'Product name is required' })}
                                        placeholder="Enter product name"
                                        className="w-full px-3 py-2 border"
                                    />
                                )}

                                {errors.productName && (
                                    <p className="text-red-500 text-sm">{errors.productName.message}</p>
                                )}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
                                <div className="flex flex-col">
                                    <label className="block mb-1 text-center font-semibold">Product Short Code</label>
                                    <input
                                        {...register('productCode', {
                                            required: 'Product short code is required',
                                        })}
                                        value={productInputType === 'manual' ? undefined : selectedProductCode}
                                        readOnly={productInputType !== 'manual'}
                                        placeholder="Enter short code"
                                        className="w-full px-3 py-2 text-center border"
                                    />
                                    {errors.productCode && (
                                        <p className="text-red-500 text-sm text-center">{errors.productCode.message}</p>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <label className="block mb-1 text-center font-semibold">
                                        Net Weight <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center border">
                                        <input
                                            type="number"
                                            {...register("netWeight", { required: "Net weight is required" })}
                                            placeholder="Net weight"
                                            className="w-full px-3 py-2 text-center border-r-0 rounded-l-md outline-none"
                                            onWheel={(e) => e.target.blur()}
                                        />
                                        <select
                                            {...register("weightUnit", { required: "Unit is required" })}
                                            className="w-auto px-3 py-2 text-center border-l-0 rounded-r-md outline-none"
                                        >
                                            <option value="ML">ML</option>
                                            <option value="GM">GM</option>
                                        </select>
                                    </div>
                                    {errors.netWeight && <p className="text-red-500 text-sm">{errors.netWeight.message}</p>}
                                    {errors.weightUnit && <p className="text-red-500 text-sm">{errors.weightUnit.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                <div className="flex flex-col">
                                    <label className="block mb-1 text-center font-semibold">
                                        Batch <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("batch", { required: "Batch is required" })}
                                        placeholder="Batch no."
                                        className="w-full text-center px-3 py-2 border"
                                    />
                                    {errors.batch && <p className="text-red-500 text-sm">{errors.batch.message}</p>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="block mb-1 text-center font-semibold">
                                        Expire <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("expire", {
                                            required: "Expire date is required",
                                            pattern: {
                                                value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                                                message: "Invalid date format. Use MM/YY"
                                            }
                                        })}
                                        placeholder="MM/YY"
                                        className="w-full text-center px-3 py-2 border"
                                    />
                                    {errors.expire && <p className="text-red-500 text-sm">{errors.expire.message}</p>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="block mb-1 text-center font-semibold">
                                        MRP <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("mrp", {
                                            required: "MRP TK is required",
                                        })}
                                        placeholder="MRP TK"
                                        className="w-full text-center px-3 py-2 border"
                                    />
                                    {errors.mrp && <p className="text-red-500 text-sm">{errors.mrp.message}</p>}
                                </div>
                                <div className="flex flex-col">
                                    <label className="block mb-1 text-center font-semibold">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type='number'
                                        {...register("quantity", {
                                            required: "Quantity is required",
                                        })}
                                        placeholder="Quantity"
                                        className="w-full text-center px-3 py-2 border"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">
                                    Rerturn By <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('returnedBy', { required: 'Ordered by is required' })}
                                    onChange={handleOrderedByChange}
                                    className="w-full px-3 py-2 border"
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
                                <label className="block mb-1 font-semibold">
                                    Pharmacy <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('pharmacy', { required: 'Pharmacy is required' })}
                                    className="w-full px-3 py-2 border"
                                >
                                    <option value="">Select a pharmacy</option>
                                    {filteredPharmacies.map(pharmacy => (
                                        <option key={pharmacy._id} value={pharmacy._id}>
                                            {pharmacy.name} - {pharmacy.customerId}
                                        </option>
                                    ))}
                                </select>
                                {errors.orderedBy && <p className="text-red-500 text-sm">{errors.orderedBy.message}</p>}
                            </div>
                            <div className='hidden'>
                                <div>
                                    <label className="block mb-1 font-semibold">Area Manager</label>
                                    <input
                                        value={areaManager}
                                        readOnly
                                        className="w-full px-3 py-2 border bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-semibold">Zonal Manager</label>
                                    <input
                                        value={zonalManager}
                                        readOnly
                                        className="w-full px-3 py-2 border bg-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-500 shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
                </div>

                <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                    <button className="px-4 py-2 text-white bg-red-500 shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpireRequestModal;