import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useDepotProducts from '../../../Hooks/useDepotProducts';
import usePharmacies from '../../../Hooks/usePharmacies';
import useTempUsers from '../../../Hooks/useTempUsers';

const PlaceOrder = () => {
    const user = { email: "user@gmail.com" }
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [pharmacies] = usePharmacies();
    const [tempUsers] = useTempUsers();
    const [products] = useDepotProducts();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const groupedProducts = products.reduce((acc, product) => {
        const existingProduct = acc.find(item => item.productName === product.productName);
        if (existingProduct) {
            existingProduct.totalQuantity += product.totalQuantity;
        } else {
            acc.push({ ...product });
        }
        return acc;
    }, []);

    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState('');
    const [productQuantities, setProductQuantities] = useState({});
    const [receiptProducts, setReceiptProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [areaManager, setAreaManager] = useState('N/A');
    const [zonalManager, setZonalManager] = useState('N/A');
    const [userTerritory, setUserTerritory] = useState('N/A');

    const handleUserChange = (e) => {
        const userName = e.target.value;

        setFilteredPharmacies([]);
        setSelectedPharmacy('');
        setReceiptProducts([]);

        const selectedUser = tempUsers.find(user => user.name === userName);
        const territoryName = selectedUser?.territory ?? null;
        setUserTerritory(territoryName);

        const amName = tempUsers.find(tuser => tuser._id === selectedUser?.parentId)?.name ?? null;
        const zmName = tempUsers.find(tuser => tuser._id === selectedUser?.grandParentId)?.name ?? null;

        if (selectedUser) {
            const userPharmacies = pharmacies.filter(pharmacy => pharmacy.territory === selectedUser.territory);
            setFilteredPharmacies(userPharmacies);
            setAreaManager(amName);
            setZonalManager(zmName);
        }
    };

    const handlePharmacyChange = (e) => {
        setSelectedPharmacy(e.target.value);
        setReceiptProducts([]);  // Reset receipt products when pharmacy changes
    };

    const handleProductQuantityChange = (id, value) => {
        const quantity = parseInt(value, 10) || 0;
        setProductQuantities(prevState => ({
            ...prevState,
            [id]: quantity,
        }));
    };

    const totalPrice = receiptProducts.reduce(
        (sum, product) => sum + product.quantity * product.tradePrice,
        0
    )

    const pharmacyDiscount = pharmacies
        .find(pharmacy => pharmacy.name === selectedPharmacy)?.discount;

    const lessDiscount = Number(totalPrice * (pharmacyDiscount / 100));

    const totalPayable = Number(totalPrice - lessDiscount);

    const confirmProducts = () => {
        const selectedProducts = Object.entries(productQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .map(([id, quantity]) => {
                const product = products.find(p => p._id === id);
                return {
                    id,
                    name: product?.productName || 'Unknown Product',
                    productCode: product?.productCode,
                    quantity,
                    tradePrice: product?.tradePrice || 0,
                };
            });

        setReceiptProducts(selectedProducts);
        setIsModalOpen(false);
    };

    const onSubmit = (data) => {
        if (!selectedPharmacy) {
            alert("Please select a pharmacy.");
            return;
        }

        const totalOrderedProducts = receiptProducts.length;
        const totalOrderUnits = receiptProducts.reduce((sum, product) => sum + product.quantity, 0);
        const totalOrderedTradePrice = receiptProducts.reduce((sum, product) => sum + (product.quantity * product.tradePrice), 0);

        const newOrder = {
            email: user?.email,
            orderedBy: data.user,
            areaManager,
            zonalManager,
            territory: userTerritory,
            pharmacy: selectedPharmacy,
            products: receiptProducts,
            totalProduct: totalOrderedProducts,
            totalUnit: Number(totalOrderUnits),
            totalPrice: Number(totalOrderedTradePrice),
            discount: Number(pharmacyDiscount) || 0,
            payMode: data.payMode,
            status: "pending",
            date: getTodayDate()
        };

        // console.log(newOrder);

        axios.post('http://localhost:5000/orders', newOrder)
            .then(data => {
                if (data.data.insertedId) {
                    reset();
                    Swal.fire({
                        icon: "success",
                        title: "New Product successfully added!",
                        showConfirmButton: false,
                        timer: 1000
                    });
                }
            })

        reset();
        setProductQuantities({});
        setReceiptProducts([]);
    };

    return (
        <>
            <PageTitle from={"Order"} to={"Place order"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Make pharmacy wise Order</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <div className="p-6 pt-0 space-y-4">
                    <div className='flex flex-col lg:flex-row justify-start lg:justify-between items-start space-y-4 lg:space-y-0'>
                        <form onSubmit={handleSubmit(onSubmit)} className='w-full lg:pr-6 space-y-4'>
                            <div className="flex flex-col">
                                <label className="text-sm mb-2">User Name <span className="text-red-500">*</span></label>
                                <select
                                    {...register('user', { required: 'Please select a user' })}
                                    onChange={handleUserChange}
                                    className="border-gray-500 bg-white border p-2 text-sm"
                                >
                                    <option value="">~~ Select a User ~~</option>
                                    {tempUsers
                                        .filter(user => !['Managing Director', 'Zonal Manager', 'Area Manager'].includes(user.designation))
                                        .map(user => (
                                            <option key={user._id} value={user.name}>
                                                {user.name}
                                            </option>
                                        ))}
                                </select>
                                {errors.user && <p className="text-red-500 text-sm">{errors.user.message}</p>}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2">Pharmacy Name <span className="text-red-500">*</span></label>
                                <select
                                    {...register('pharmacy', { required: 'Please select a pharmacy' })}
                                    onChange={handlePharmacyChange}
                                    className="border-gray-500 bg-white border p-2 text-sm"
                                >
                                    <option value="">~~ Select a Pharmacy ~~</option>
                                    {filteredPharmacies.map(pharmacy => (
                                        <option key={pharmacy._id} value={pharmacy.name}>
                                            {pharmacy.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.pharmacy && <p className="text-red-500 text-sm">{errors.pharmacy.message}</p>}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2">Pay Mode <span className="text-red-500">*</span></label>
                                <select
                                    {...register('payMode', { required: 'Pay mode is required' })}
                                    className="border-gray-500 bg-white border p-2 text-sm"
                                >
                                    <option value="">~~ Select a Pay Mode ~~</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Credit">Credit</option>
                                    <option value="STC">STC</option>

                                </select>
                                {errors.PayMode && <p className="text-red-500 text-sm">{errors.PayMode.message}</p>}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-500 text-white mt-5 p-2 rounded"
                            >
                                Add Products
                            </button>

                            {isModalOpen && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-white p-8 rounded-lg shadow-2xl w-3/4 max-w-4xl">
                                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Select Products</h2>

                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100 border-b">
                                                        <th className="text-left p-4 font-medium text-gray-600">Product Name</th>
                                                        <th className="text-right p-4 font-medium text-gray-600">Trade Price</th>
                                                        <th className="text-center p-4 font-medium text-gray-600">Order Quantity</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {groupedProducts.map(product => (
                                                        <tr key={product._id} className="border-b hover:bg-gray-50">
                                                            <td className="p-4">
                                                                <p className="font-medium text-gray-900">{product.productName}</p>
                                                                <p className="text-sm text-gray-500">Code: {product.productCode}</p>
                                                            </td>

                                                            <td className="text-right p-4">
                                                                <p className="font-medium text-gray-900">{product.tradePrice}/-</p>
                                                            </td>

                                                            <td className="text-center p-4">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={product.totalQuantity}
                                                                    placeholder="Qty"
                                                                    className="border border-gray-300 rounded-md p-2 w-24 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                    value={productQuantities[product._id]}
                                                                    onChange={(e) => handleProductQuantityChange(product._id, e.target.value)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-center items-center mt-6">
                                            <button
                                                onClick={() => setIsModalOpen(false)}
                                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmProducts}
                                                className="bg-blue-500 text-white px-4 py-2 rounded ml-4"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Receipt Section */}
                        <div className="w-full max-w-sm mx-auto bg-white border border-gray-300 rounded-md p-4 shadow-sm text-sm font-mono">
                            <div className="text-center mb-4">
                                <h2 className="text-lg font-bold">Navantis Pharma Limited</h2>
                                <p className="text-xs">Order Receipt</p>
                                <p className="text-xs">Date: {new Date().toLocaleString()}</p>
                                <hr className="my-2 border-gray-400" />
                                {
                                    receiptProducts.length > 0
                                    &&
                                    <>
                                        <div className='text-left'>
                                            <p className="text-xs">Customer Code: PHAR001</p>
                                            <p className="text-xs">Customer Name: {selectedPharmacy}</p>
                                        </div>
                                        <hr className="my-2 border-gray-400" />
                                    </>
                                }
                            </div>
                            {receiptProducts.length > 0 ? (
                                <>
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-gray-400">
                                                <th className="py-2">Product</th>
                                                <th className="py-2 text-right px-3">Qty</th>
                                                <th className="py-2 text-right px-3">Price/Unit</th>
                                                <th className="py-2 text-right px-3">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receiptProducts.map((product) => (
                                                <tr key={product.id} className="border-b border-gray-200">
                                                    <td className="py-2">{product.name}</td>
                                                    <td className="py-2 text-right px-3">{product.quantity}</td>
                                                    <td className="py-2 text-right px-3">{product.tradePrice}/-</td>
                                                    <td className="py-2 text-right px-3">{product.quantity * product.tradePrice}/-</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <hr className="my-2 border-gray-400" />
                                    <div className="space-y-2 font-bold text-sm mt-2">
                                        {/* Grand Total Row */}
                                        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                                            <span className="text-right">Grand Total</span>
                                            <span className="text-center w-6">:</span>
                                            <span className="text-right px-3">
                                                {(Number((Number(totalPrice)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                            </span>
                                        </div>

                                        {/* Less Discount Row */}
                                        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                                            <span className="text-right">
                                                Less Discount {pharmacyDiscount > 0 && `(${pharmacyDiscount}%)`}
                                            </span>
                                            <span className="text-center w-6">:</span>
                                            <span className="text-right px-3">
                                                {(Number((Number(lessDiscount)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                            </span>
                                        </div>

                                        {/* Total Payable Row */}
                                        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                                            <span className="text-right">Total Payable</span>
                                            <span className="text-center w-6">:</span>
                                            <span className="text-right px-3">
                                                {(Number((Number(totalPayable)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                            </span>
                                        </div>
                                    </div>
                                    <hr className="my-2 border-gray-400" />
                                    <p className="text-center text-xs mt-4">Thank you for your purchase!</p>
                                </>
                            ) : (
                                <p className="text-center">No products added yet.</p>
                            )}
                            <button
                                onClick={handleSubmit(onSubmit)}
                                className={`w-full py-2 mt-4 rounded text-sm tracking-wider ${receiptProducts.length === 0
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                    : "bg-gray-800 text-white hover:bg-gray-900"
                                    }`}
                                disabled={receiptProducts.length === 0}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlaceOrder;