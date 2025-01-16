import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useDepotProducts from '../../../Hooks/useDepotProducts';
import usePharmacies from '../../../Hooks/usePharmacies';
import useTempUsers from '../../../Hooks/useTempUsers';

const PlaceOrder = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [pharmacies] = usePharmacies();
    const [tempUsers] = useTempUsers();
    const [products] = useDepotProducts();

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [areaManager, setAreaManager] = useState('N/A');
    const [zonalManager, setZonalManager] = useState('N/A');
    const [userTerritory, setUserTerritory] = useState('N/A');

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleUserChange = (e) => {
        const userName = e.target.value;

        setFilteredPharmacies([]);
        setSelectedPharmacy('');
        const selectedUser = tempUsers.find(user => user.name === userName);
        // console.log(selectedUser);
        const territoryName = selectedUser.territory ?? null;
        setUserTerritory(territoryName);

        const amName = tempUsers.find(tuser => tuser._id === selectedUser.parentId)?.name ?? null;
        const zmName = tempUsers.find(tuser => tuser._id === selectedUser.grandParentId)?.name ?? null;

        if (selectedUser) {
            const userPharmacies = pharmacies.filter(pharmacy => pharmacy.territory === selectedUser.territory);
            setFilteredPharmacies(userPharmacies);
            setAreaManager(amName);
            setZonalManager(zmName);
        }
    };

    const handleProductQuantityChange = (id, value) => {
        setProductQuantities(prevState => ({
            ...prevState,
            [id]: parseInt(value) || 0,
        }));
    };

    // Submit handler
    const onSubmit = (data) => {
        if (!selectedPharmacy) {
            alert("Please select a pharmacy.");
            return;
        }

        const orderedProducts = Object.entries(productQuantities)
            .map(([id, quantity]) => {
                const product = products.find(product => product._id === id);
                return {
                    productId: id,
                    productName: product?.productName || 'Unknown Product',
                    quantity: parseInt(quantity, 10),
                    tradePrice: product?.tradePrice || 0
                };
            })
            .filter(product => product.quantity > 0);

        const totalOrderedProducts = orderedProducts.length;
        const totalOrderUnits = orderedProducts.reduce((sum, product) => sum + product.quantity, 0);
        const totalOrderedTradePrice = orderedProducts.reduce((sum, product) => sum + (product.quantity * product.tradePrice), 0);

        const orderDetails = {
            orderedBy: data.user,
            areaManager: areaManager,
            zonalManager: zonalManager,
            territory: userTerritory,
            pharmacy: selectedPharmacy,
            products: orderedProducts,
            totalProduct: totalOrderedProducts,
            totalUnit: totalOrderUnits,
            totalPrice: totalOrderedTradePrice,
            status: "initialized"
        };

        console.log('Order Details:', orderDetails);

        reset();
        setProductQuantities({});
        setIsModalOpen(false);
    };

    return (
        <div>
            <PageTitle from={"Order"} to={"Place order"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Make pharmacy wise Order</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-4">
                    {/* User Dropdown */}
                    <div className="flex flex-col">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            User Name <span className="text-red-500">*</span>
                        </label>
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

                    {/* Pharmacy Dropdown */}
                    <div className="flex flex-col">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            Pharmacy Name <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('pharmacy', { required: 'Please select a pharmacy' })}
                            onChange={(e) => setSelectedPharmacy(e.target.value)}
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

                    {/* Modal Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-500 text-white mt-5 p-2 rounded text-sm"
                    >
                        Add Products
                    </button>

                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-8 rounded-lg shadow-2xl w-3/4 max-w-4xl">
                                {/* Modal Header */}
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Select Products</h2>

                                {/* Table Layout */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        {/* Table Head */}
                                        <thead>
                                            <tr className="bg-gray-100 border-b">
                                                <th className="text-left p-4 font-medium text-gray-600">Product Name</th>
                                                <th className="text-right p-4 font-medium text-gray-600">Trade Price</th>
                                                <th className="text-center p-4 font-medium text-gray-600">Order Quantity</th>
                                            </tr>
                                        </thead>

                                        {/* Table Body */}
                                        <tbody>
                                            {groupedProducts.map(product => (
                                                <tr key={product._id} className="border-b hover:bg-gray-50">
                                                    {/* Product Name */}
                                                    <td className="p-4">
                                                        <p className="font-medium text-gray-900">{product.productName}</p>
                                                        <p className="text-sm text-gray-500">Code: {product.productCode}</p>
                                                    </td>

                                                    {/* Trade Price */}
                                                    <td className="text-right p-4">
                                                        <p className="font-medium text-gray-900">{product.tradePrice}</p>
                                                    </td>

                                                    {/* Quantity Input */}
                                                    <td className="text-center p-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={product.totalQuantity}
                                                            placeholder="Qty"
                                                            className="border border-gray-300 rounded-md p-2 w-24 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                            onChange={(e) => handleProductQuantityChange(product._id, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" className="bg-green-500 text-white mt-5 p-2 rounded text-sm">Place Order</button>
                </form>
            </div>
        </div>
    );
};

export default PlaceOrder;