import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import Swal from 'sweetalert2';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useAllUsers from '../../../Hooks/useAllUsers';
import useApiConfig from '../../../Hooks/useApiConfig';
import useAuth from '../../../Hooks/useAuth';
import useCustomer from '../../../Hooks/useCustomer';
import useDepotProducts from '../../../Hooks/useDepotProducts';
import useOrders from '../../../Hooks/useOrders';
import useSingleUser from '../../../Hooks/useSingleUser';

const PlaceOrder = () => {
    const { user } = useAuth();
    const baseUrl = useApiConfig();

    const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm();

    const [allUsers] = useAllUsers();
    const [singleUser] = useSingleUser();
    const [pharmacies] = useCustomer();
    const [depotProducts] = useDepotProducts();
    const [orders, , refetch] = useOrders();

    // const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [category, setCategory] = useState("");
    const [selectedPharmacy, setSelectedPharmacy] = useState({});
    const [productQuantities, setProductQuantities] = useState({});
    const [receiptProducts, setReceiptProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const products = (category === "Noiderma")
        ?
        depotProducts.filter(dp => dp.category === "Noiderma")
        :
        depotProducts.filter(dp => dp.category !== "Noiderma")

    /* const [areaManager, setAreaManager] = useState('N/A');
    const [zonalManager, setZonalManager] = useState('N/A');
    const [userTerritory, setUserTerritory] = useState('N/A'); */

    const userTerritory = singleUser?.territory || null;
    const userPharmacies = pharmacies.filter(pharmacy =>
        pharmacy.territory === userTerritory
        &&
        pharmacy.status === 'approved'
    );

    const pharmacyOptions = userPharmacies?.map(pharmacy => ({
        value: pharmacy._id,
        label: `${pharmacy.name} - ${pharmacy.customerId}`,
        name: pharmacy.name,
        customerId: pharmacy.customerId,
        address: pharmacy.address,
        data: pharmacy,
    }));

    const parentName = allUsers.find(parent => parent._id === singleUser.parentId)?.name || "Vacant";
    const parentTerritory = allUsers.find(pt => pt._id === singleUser.parentId)?.territory || "Vacant";
    const parentEmail = allUsers.find(pe => pe._id === singleUser.parentId)?.email || null;
    const gParentName = allUsers.find(gparent => gparent._id === singleUser.grandParentId)?.name || "Vacant";
    const gParentEmail = allUsers.find(gpe => gpe._id === singleUser.grandParentId)?.email || null;

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const groupedProducts = products.reduce((acc, product) => {
        const existingProduct = acc.find(
            item =>
                item.productName === product.productName
                &&
                item.netWeight === product.netWeight
        );

        if (existingProduct) {
            existingProduct.totalQuantity += product.totalQuantity;
        } else {
            acc.push({ ...product });
        }
        return acc;
    }, []);

    /* const handleUserChange = (e) => {
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
    }; */

    const handlePharmacyChange = (e) => {
        const pharmacyId = e.target.value;
        const selectedPharm = pharmacies.find(pharm => pharm._id === pharmacyId);
        setSelectedPharmacy(selectedPharm);

        setReceiptProducts([]);
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
        .find(pharmacy => pharmacy.customerId === selectedPharmacy?.customerId)?.discount;

    const lessDiscount = Number(totalPrice * (pharmacyDiscount / 100));

    const totalPayable = Number(totalPrice - lessDiscount);

    const confirmProducts = () => {
        const selectedProducts = Object.entries(productQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .map(([id, quantity]) => {
                const product = products.find(p => p._id === id);
                return {
                    id,
                    name: product?.productName,
                    netWeight: product?.netWeight,
                    productCode: product?.productCode,
                    quantity,
                    tradePrice: product?.tradePrice || 0,
                };
            });

        setReceiptProducts(selectedProducts);
        setIsModalOpen(false);
    };

    const makeOrder = (data) => {
        const totalOrderedProducts = receiptProducts.length;
        const totalOrderUnits = receiptProducts.reduce((sum, product) => sum + product.quantity, 0);
        const totalOrderedTradePrice = receiptProducts.reduce((sum, product) => sum + (product.quantity * product.tradePrice), 0);

        const newOrder = {
            email: user?.email,
            orderedBy: data.name,
            areaManager: parentName,
            amEmail: parentEmail,
            zonalManager: gParentName,
            zmEmail: gParentEmail,
            territory: userTerritory,
            parentTerritory: singleUser?.parentTerritory,
            pharmacy: selectedPharmacy?.name,
            pharmacyId: selectedPharmacy?.customerId,
            category: category,
            products: receiptProducts,
            totalProduct: totalOrderedProducts,
            totalUnit: Number(totalOrderUnits),
            totalPrice: Number(Number(totalOrderedTradePrice).toFixed(2)),
            discount: Number(pharmacyDiscount) || 0,
            totalPayable: Number(Number(totalPayable).toFixed(2)),
            payMode: data.payMode,
            status: "pending",
            date: getTodayDate()
        };

        axios.post(`${baseUrl}/orders`, newOrder)
            .then(data => {
                if (data.data.insertedId) {
                    refetch();
                    reset();
                    setProductQuantities({});
                    setReceiptProducts([]);

                    Swal.fire({
                        icon: "success",
                        title: "Order successfully placed.",
                        showConfirmButton: true,
                    });
                    // window.location.reload();
                }
            })
    }

    const onSubmit = (data) => {
        const orderAlreadyPending = orders.some(
            order =>
                order.pharmacyId === selectedPharmacy.customerId
                &&
                order.category === category
                &&
                order.status === "pending"
        );

        if (!orderAlreadyPending) {
            makeOrder(data);
        } else {
            Swal.fire({
                icon: "error",
                title: "Order Blocked",
                html: `Order already placed for this customer. Please update if needed.<br><strong>My Order → Pending → Update → 📝</strong>`
            });
            reset();
            setProductQuantities({});
            setReceiptProducts([]);
            return;
        }

        /* if (data.payMode === "Cash" && !selectedPharmacy?.payMode?.includes("STC")) {
            // Check for any cash order placed today
            const hasCashOrderToday = orders.some(order =>
                order.pharmacyId === selectedPharmacy.customerId &&
                order.payMode === "Cash" &&
                new Date(order.date).toDateString() === new Date().toDateString()
            );

            // Check for any unpaid cash order (any date)
            const hasAnyUnpaidCash = orders.some(order =>
                order.pharmacyId === selectedPharmacy.customerId &&
                order.payMode === "Cash" &&
                order.status.toLowerCase() !== "paid"
            );

            if (hasCashOrderToday) {
                Swal.fire({
                    icon: "warning",
                    title: "Order Restricted",
                    text: "A cash order has already been placed today. Only one cash order per day is allowed."
                });
                return;
            }

            if (hasAnyUnpaidCash) {
                Swal.fire({
                    icon: "error",
                    title: "Order Blocked",
                    text: "Unpaid cash order found. Please clear the payment before placing a new order."
                });
                return;
            } else {
                makeOrder(data);
            }
        } else if (data.payMode === "Credit" && selectedPharmacy?.payMode?.includes("Credit")) {
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

                if (availableCrLimit > 0 && availableCrLimit >= totalPayable) {
                    makeOrder(data);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Credit Limit Exceeded",
                        text: "You do not have a sufficient credit limit!"
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
                    new Date(order.date) >= firstDayOfMonth
                    &&
                    new Date(order.date) <= lastDayAllowed
                );

                const hasUnpaidSTC = stcOrders.some(order => order.status.toLowerCase() === "due");

                if (hasUnpaidSTC) {
                    if (currentDate <= lastDayAllowed) {
                        if (data.payMode === "Cash") {
                            makeOrder(data);
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
                    if (data.payMode === "STC") {
                        if (currentDate <= stcOrderLastDay) {
                            const hasAnySTCOrderThisMonth = stcOrders.length > 0;

                            if (hasAnySTCOrderThisMonth) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Order Not Allowed",
                                    text: "An STC order has already been placed this month. You can't place another."
                                });
                            } else if (selectedPharmacy?.crLimit >= totalPayable) {
                                makeOrder(data);
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Credit Limit Exceeded",
                                    text: "You do not have a sufficient credit limit!"
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
                        const hasCashOrderToday = orders.some(order =>
                            order.pharmacyId === selectedPharmacy.customerId &&
                            order.payMode === "Cash" &&
                            new Date(order.date).toDateString() === new Date().toDateString()
                        );

                        // Check for any unpaid cash order (any date)
                        const hasAnyUnpaidCash = orders.some(order =>
                            order.pharmacyId === selectedPharmacy.customerId &&
                            order.payMode === "Cash" &&
                            order.status.toLowerCase() !== "paid"
                        );

                        if (hasCashOrderToday) {
                            Swal.fire({
                                icon: "warning",
                                title: "Order Restricted",
                                text: "A cash order has already been placed today. Only one cash order per day is allowed."
                            });
                            return;
                        }

                        if (hasAnyUnpaidCash) {
                            Swal.fire({
                                icon: "error",
                                title: "Order Blocked",
                                text: "Unpaid cash order found. Please clear the payment before placing a new order."
                            });
                            return;
                        } else {
                            makeOrder(data);
                        }
                    }
                }
            }
        } */
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
                            {/* <div className="flex flex-col">
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
                            </div> */}

                            <div className="flex flex-col">
                                <label className="mb-1 text-sm">
                                    Order by <span className="text-red-500">*</span>
                                </label>
                                <input
                                    defaultValue={singleUser.name}
                                    {...register("name", { required: "User name is required" })}
                                    className="border-gray-500 bg-white border p-2 text-sm rounded-md cursor-not-allowed"
                                    readOnly
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2">Category <span className="text-red-500">*</span></label>
                                <select
                                    {...register('category', { required: 'Category is required' })}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="border-gray-500 bg-white border p-2 text-sm rounded-md"
                                >
                                    <option value="">~~ Select a Category ~~</option>
                                    <option value="Bionike">Bionike</option>
                                    <option value="Noiderma">Noiderma</option>
                                </select>
                            </div>

                            {/* <div className="flex flex-col">
                                <label className="text-sm mb-2">Customer Name <span className="text-red-500">*</span></label>
                                <select
                                    {...register('pharmId', { required: 'Please select a customer' })}
                                    onChange={handlePharmacyChange}
                                    className="border-gray-500 bg-white border p-2 text-sm"
                                >
                                    <option value="">~~ Select a customer ~~</option>
                                    {userPharmacies?.map(pharmacy => (
                                        <option key={pharmacy._id} value={pharmacy._id}>
                                            {pharmacy.name} - {pharmacy.customerId}
                                        </option>
                                    ))}
                                </select>
                                {errors.pharmacy && <p className="text-red-500 text-sm">{errors.pharmacy.message}</p>}
                            </div> */}

                            <div className="flex flex-col">
                                <label className="text-sm mb-2">Customer Name <span className="text-red-500">*</span></label>
                                <Select
                                    options={pharmacyOptions}
                                    onChange={(selected) => {
                                        setSelectedPharmacy(selected.data);
                                    }}
                                    placeholder="Select or type a customer name"
                                    isSearchable
                                    formatOptionLabel={(data, { context }) => {
                                        if (context === "menu") {
                                            return (
                                                <div>
                                                    <p className="font-semibold text-sm">{data.name} - {data.customerId}</p>
                                                    <p className="text-gray-500 text-xs">{data.address}</p>
                                                </div>
                                            );
                                        }
                                        return `${data.name} - ${data.customerId}`;
                                    }}
                                    className='rounded-md'
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderColor: '#6B7280',
                                            fontSize: '0.875rem',
                                            boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : base.boxShadow,
                                            '&:hover': {
                                                borderColor: '#3B82F6',
                                            },
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            margin: 0,
                                            padding: 0,
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                    }}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm mb-2">Pay Mode <span className="text-red-500">*</span></label>
                                <select
                                    {...register('payMode', { required: 'Pay mode is required' })}
                                    className="border-gray-500 bg-white border p-2 text-sm rounded-md"
                                >
                                    <option value="">~~ Select a Pay Mode ~~</option>
                                    {selectedPharmacy?.payMode?.map((mode) => (
                                        <option key={mode} value={mode}>
                                            {mode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const { category, payMode } = getValues();

                                    if (!category) {
                                        Swal.fire({
                                            icon: "error",
                                            title: "Category Missing",
                                            text: "Please, select a category first",
                                            showConfirmButton: true
                                        });

                                        return;
                                    } else if (Object.keys(selectedPharmacy).length === 0) {
                                        Swal.fire({
                                            icon: "error",
                                            title: "Customer Missing",
                                            text: "Please, select a customer first",
                                            showConfirmButton: true
                                        });

                                        return;
                                    } else if (!payMode) {
                                        Swal.fire({
                                            icon: "error",
                                            title: "PayMode Missing",
                                            text: "Please, select a payment mode",
                                            showConfirmButton: true
                                        });

                                        return;
                                    } else {
                                        setIsModalOpen(true);
                                    }
                                }}
                                className="bg-blue-500 text-white mt-5 p-2 rounded"
                            >
                                Add Products
                            </button>

                            {isModalOpen && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                    <div className="bg-white p-8 rounded-lg shadow-2xl w-3/4 max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Select Products</h2>

                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100 border-b">
                                                        <th className="text-left p-4 font-medium text-gray-600">Product Name</th>
                                                        <th className="text-center p-4 font-medium text-gray-600">Net Weight</th>
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

                                                            <td className="p-4">
                                                                <p className="text-center font-medium text-gray-900">{product.netWeight}</p>
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
                                            <p className="text-xs">Customer Code: {selectedPharmacy?.customerId}</p>
                                            <p className="text-xs">Customer Name: {selectedPharmacy?.name}</p>
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
                                                    <td className="py-2">
                                                        {product.name} - {product.netWeight}
                                                    </td>
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