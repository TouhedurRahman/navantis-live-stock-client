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

    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState('');
    const [productQuantities, setProductQuantities] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [areaManager, setAreaManager] = useState('N/A');
    const [zonalManager, setZonalManager] = useState('N/A');

    const handleUserChange = (e) => {
        const userName = e.target.value;

        setFilteredPharmacies([]);
        setSelectedPharmacy('');
        const selectedUser = tempUsers.find(user => user.name === userName);
        console.log(selectedUser);

        const amName = tempUsers.find(tuser => tuser._id === selectedUser.parentId)?.name ?? null;
        const zmName = tempUsers.find(tuser => tuser._id === selectedUser.grandParentId)?.name ?? null;

        if (selectedUser) {
            const userPharmacies = pharmacies.filter(pharmacy => pharmacy.parentId === selectedUser._id);
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

        const orderDetails = {
            // ...data,
            orderedBy: data.user,
            areaManager: areaManager,
            zonalManager: zonalManager,
            orders: [
                {
                    pharmacyName: selectedPharmacy,
                    products: Object.entries(productQuantities)
                        .map(([id, quantity]) => {
                            const product = products.find(product => product._id === id);
                            return {
                                productId: id,
                                productName: product?.productName || 'Unknown Product',
                                quantity,
                            };
                        })
                        .filter(product => product.quantity > 0),
                }
            ]
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
                <h1 className="px-6 py-3 font-bold">Make Pharmacy-Wise Order</h1>
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
                            <option value="">-- Select a User --</option>
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
                            <option value="">-- Select a Pharmacy --</option>
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
                            <div className="bg-white p-6 rounded shadow-lg w-3/4">
                                <h2 className="text-lg font-bold mb-4">Select Products</h2>
                                <div className="space-y-4">
                                    {products.map(product => (
                                        <div key={product._id} className="flex items-center justify-between">
                                            <div>
                                                <p>{product.productName} (Code: {product.productCode})</p>
                                                <p className="text-sm text-gray-500">Batch: {product.batch} | Expire: {product.expire}</p>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={product.totalQuantity}
                                                    placeholder="Enter quantity"
                                                    className="border border-gray-400 p-2 w-24"
                                                    onChange={(e) => handleProductQuantityChange(product._id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
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

/* import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import usePharmacies from '../../../Hooks/usePharmacies';
import useTempUsers from '../../../Hooks/useTempUsers';

const PlaceOrder = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [pharmacies] = usePharmacies();
    const [tempUsers] = useTempUsers();

    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState('');
    const [areaManager, setAreaManager] = useState('N/A');
    const [zonalManager, setZonalManager] = useState('N/A');

    const handleUserChange = (e) => {
        const userName = e.target.value;

        setFilteredPharmacies([]);
        setSelectedPharmacy('');
        setAreaManager('N/A');
        setZonalManager('N/A');

        const selectedUser = tempUsers.find(user => user.name === userName);

        if (selectedUser) {
            const userPharmacies = pharmacies.filter(pharmacy => pharmacy.parentId === selectedUser._id);
            setFilteredPharmacies(userPharmacies);
        }
    };

    const handlePharmacyChange = (e) => {
        const pharmacyName = e.target.value;
        setSelectedPharmacy(pharmacyName);

        setAreaManager('N/A');
        setZonalManager('N/A');

        const selected = filteredPharmacies.find(pharmacy => pharmacy.name === pharmacyName);

        if (selected) {
            const areaManagerData = tempUsers.find(user => user._id === selected.parentId);
            const zonalManagerData = tempUsers.find(user => user._id === selected.grandParentId);

            setAreaManager(areaManagerData ? areaManagerData.name : 'N/A');
            setZonalManager(zonalManagerData ? zonalManagerData.name : 'N/A');
        }
    };

    const onSubmit = (data) => {
        console.log(data);
        reset();
    };

    return (
        <div>
            <PageTitle from={"Order"} to={"Place order"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Make order</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-4">
                    <div className="flex flex-col">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            User Name <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('user', { required: 'Please select a user' })}
                            onChange={handleUserChange}
                            className="border-gray-500 bg-white border p-2 text-sm"
                        >
                            <option value="">-- Select a User --</option>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Pharmacy <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('pharmacy', { required: 'Please select a pharmacy' })}
                                onChange={handlePharmacyChange}
                                className="border-gray-500 bg-white border p-2 text-sm"
                                disabled={filteredPharmacies.length === 0}
                            >
                                <option value="">-- Select a Pharmacy --</option>
                                {filteredPharmacies.map(pharmacy => (
                                    <option key={pharmacy.id} value={pharmacy.name}>
                                        {pharmacy.name}
                                    </option>
                                ))}
                            </select>
                            {errors.pharmacy && <p className="text-red-500 text-sm">{errors.pharmacy.message}</p>}
                        </div>

                        {selectedPharmacy && (
                            <div className="flex flex-col space-y-2">
                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Area Manager</label>
                                    <input
                                        type="text"
                                        value={areaManager}
                                        disabled
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Zonal Manager</label>
                                    <input
                                        type="text"
                                        value={zonalManager}
                                        disabled
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="bg-blue-500 text-white mt-5 p-2 rounded text-sm">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default PlaceOrder; */