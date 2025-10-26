import axios from "axios";
import { useMemo, useState } from "react";
import { FaSearch, FaShoppingCart, FaUndoAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useApiConfig from "../../../../Hooks/useApiConfig";
import useCustomer from "../../../../Hooks/useCustomer";
import useOrders from "../../../../Hooks/useOrders";
import useReturns from "../../../../Hooks/useReturns";
import useTerritories from "../../../../Hooks/useTerritories";

const AdminCustomerUpdate = () => {
    const baseUrl = useApiConfig();

    const [customers, , refetchCustomers] = useCustomer();
    const [orders, , refetchOrders] = useOrders();
    const [returns, , refetchReturns] = useReturns();
    const [territories] = useTerritories();

    const [searchId, setSearchId] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({});

    const handleSearch = () => {
        const found = customers.find((c) => c.customerId === searchId);
        if (found) {
            setSelectedCustomer(found);
            setFormData(found);
        } else {
            setSelectedCustomer(null);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Customer not found!",
                showConfirmButton: true
            });
            setSearchId("");
        }
    };

    const selectedMarketPoints = selectedCustomer
        ? (territories.find(t => t.territory === selectedCustomer?.territory)?.marketPoints || [])
        : [];

    const customerOrders = useMemo(() => {
        return orders.filter((order) => order.pharmacyId === selectedCustomer?.customerId);
    }, [orders, selectedCustomer]);

    const customerReturns = useMemo(() => {
        return returns.filter((ret) => ret.pharmacyId === selectedCustomer?.customerId);
    }, [returns, selectedCustomer]);

    const totalOrders = customerOrders.length;
    const totalUnits = customerOrders.reduce((sum, o) => sum + (o.totalUnit || 0), 0);

    const totalReturns = customerReturns.length;
    const totalReturnUnits = customerReturns.reduce((sum, r) => sum + (r.totalUnit || 0), 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = async () => {
        if (!selectedCustomer) return;

        if ((!formData.name || formData.name.trim() === "")) {
            return Swal.fire({
                position: "center",
                icon: "error",
                title: "Customer Name is required",
                showConfirmButton: false,
                timer: 1500
            });
        }

        if ((!formData.marketPoint || formData.marketPoint.trim() === "")) {
            return Swal.fire({
                position: "center",
                icon: "error",
                title: "Market Point is required",
                showConfirmButton: false,
                timer: 1500
            });
        }

        if ((!formData.address || formData.address.trim() === "")) {
            return Swal.fire({
                position: "center",
                icon: "error",
                title: "Address is required",
                showConfirmButton: false,
                timer: 1500
            });
        }

        try {
            const nameChanged = formData.name !== selectedCustomer.name;
            const { _id, ...updatedCustomer } = formData;

            const promises = [
                axios.patch(`${baseUrl}/customer/${_id}`, updatedCustomer)
            ];

            if (nameChanged) {
                promises.push(
                    axios.patch(`${baseUrl}/orders/update-cus-name/${selectedCustomer.customerId}`, {
                        newName: formData.name,
                    })
                );

                promises.push(
                    axios.patch(`${baseUrl}/returns/update-cus-name/${selectedCustomer.customerId}`, {
                        newName: formData.name,
                    })
                );
            }

            await Promise.all(promises);

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Success",
                html: `Customer  Updated! <br /> Cus. ID <strong>${selectedCustomer.customerId}</strong>`,
                showConfirmButton: true
            });

            refetchCustomers();
            refetchOrders();
            refetchReturns();
            setSelectedCustomer(null);
            setSearchId("");
        } catch (error) {
            // console.error("Update Error:", error.response?.data || error.message);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Failed to update customer",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <>
            <PageTitle from="Admin" to="Customer Update" />

            <div className="bg-white pb-5">
                <div>
                    <h1 className="px-6 py-3 font-bold">Admin Customer Update</h1>
                    <hr className="border border-gray-500 mb-5" />
                </div>

                {/* Search Section */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 md:px-6 mb-6">
                    <input
                        type="text"
                        placeholder="Enter Customer ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all text-center"
                    />
                    <button
                        onClick={handleSearch}
                        className="flex items-center justify-center bg-[#3B82F6] hover:bg-yellow-400 text-white hover:text-black font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-300"
                    >
                        <FaSearch className="mr-1" /> Search
                    </button>
                </div>

                {selectedCustomer && (
                    <div className="px-4 md:px-6 space-y-5">
                        {/* Order & Return Summary in row on large screens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Summary */}
                            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-center items-center gap-3 mb-4 border-b pb-2">
                                    <FaShoppingCart className="text-[#E69B3D] text-2xl" />
                                    <h2 className="font-bold text-lg text-gray-800">Order Summary</h2>
                                </div>

                                <div className="flex justify-between text-gray-700 text-sm md:text-base">
                                    <div>
                                        <p className="font-semibold text-gray-800">Total Orders</p>
                                        <p className="text-gray-600">{totalOrders}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">Total Units Sold</p>
                                        <p className="text-gray-600">{totalUnits}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Return Summary */}
                            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-center items-center gap-3 mb-4 border-b pb-2">
                                    <FaUndoAlt className="text-[#E69B3D] text-2xl" />
                                    <h2 className="font-bold text-lg text-gray-800">Return Summary</h2>
                                </div>

                                <div className="flex justify-between text-gray-700 text-sm md:text-base">
                                    <div>
                                        <p className="font-semibold text-gray-800">Returned Invoices</p>
                                        <p className="text-gray-600">{totalReturns}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">Returned Units</p>
                                        <p className="text-gray-600">{totalReturnUnits}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white border border-gray-200 p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <h2 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-1 text-center">Update Customer</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* First line: Customer Name & Market Point */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Customer Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ""}
                                        onChange={handleChange}
                                        className="border border-gray-300 focus:border-[#3B82F6] focus:ring-[#3B82F6]/30 outline-none transition-all px-3 py-2 w-full rounded-md shadow-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Market Point <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="marketPoint"
                                        value={formData.marketPoint || ""}
                                        onChange={handleChange}
                                        className="border border-gray-300 focus:border-[#3B82F6] focus:ring-[#3B82F6]/30 outline-none transition-all px-3 py-2 w-full rounded-md bg-white shadow-sm cursor-pointer"
                                        required
                                    >
                                        <option value="">Select a Market Point</option>
                                        {selectedMarketPoints.map((point, index) => (
                                            <option key={index} value={point}>
                                                {point}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Second line: Address */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address || ""}
                                        onChange={handleChange}
                                        className="border border-gray-300 focus:border-[#3B82F6] focus:ring-[#3B82F6]/30 outline-none transition-all px-3 py-2 w-full rounded-md shadow-sm"
                                        rows="3"
                                    ></textarea>
                                </div>

                                {/* Third line: Trade License & Drug License */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trade License
                                    </label>
                                    <input
                                        type="text"
                                        name="tradeLicense"
                                        value={formData.tradeLicense || ""}
                                        onChange={handleChange}
                                        className="border border-gray-300 focus:border-[#3B82F6] focus:ring-[#3B82F6]/30 outline-none transition-all px-3 py-2 w-full rounded-md shadow-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Drug License
                                    </label>
                                    <input
                                        type="text"
                                        name="drugLicense"
                                        value={formData.drugLicense || ""}
                                        onChange={handleChange}
                                        className="border border-gray-300 focus:border-[#3B82F6] focus:ring-[#3B82F6]/30 outline-none transition-all px-3 py-2 w-full rounded-md shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Update Button */}
                        <div className="text-center">
                            <button
                                onClick={handleUpdate}
                                disabled={!formData.name?.trim()}
                                className={`${formData.name?.trim()
                                    ? "bg-green-600 hover:bg-green-500 cursor-pointer"
                                    : "bg-gray-300 cursor-not-allowed"
                                    } text-white font-medium px-6 py-2 rounded-md shadow-md transition-all duration-300`}
                            >
                                Submit
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
};

export default AdminCustomerUpdate;