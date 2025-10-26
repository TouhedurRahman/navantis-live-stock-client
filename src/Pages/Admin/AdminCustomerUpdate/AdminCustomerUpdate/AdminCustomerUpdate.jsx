import axios from "axios";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useApiConfig from "../../../../Hooks/useApiConfig";
import useCustomer from "../../../../Hooks/useCustomer";
import useOrders from "../../../../Hooks/useOrders";
import useReturns from "../../../../Hooks/useReturns";

const AdminCustomerUpdate = () => {
    const baseUrl = useApiConfig();

    const [customers, , refetchCustomers] = useCustomer();
    const [orders, , refetchOrders] = useOrders();
    const [returns, , refetchReturns] = useReturns();

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
            alert("Customer not found!");
        }
    };

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
                title: "Customer successfully updated.",
                showConfirmButton: false,
                timer: 1500
            });

            refetchCustomers();
            refetchOrders();
            refetchReturns();
        } catch (error) {
            console.error("Update Error:", error.response?.data || error.message);
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
                    <h1 className="px-6 py-3 font-bold text-lg">Admin Customer Update</h1>
                    <hr className="border border-gray-500 mb-5" />
                </div>

                {/*Search Section */}
                <div className="px-6 flex items-center space-x-2 mb-5">
                    <input
                        type="text"
                        placeholder="Enter Customer ID (e.g. 500013)"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="border px-3 py-2 rounded-md w-64"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Search
                    </button>
                </div>

                {selectedCustomer && (
                    <div className="px-6 space-y-4">
                        {/* Order Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
                            <p><strong>Total Orders:</strong> {totalOrders}</p>
                            <p><strong>Total Units Sold:</strong> {totalUnits}</p>
                        </div>

                        {/* Return Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h2 className="font-semibold text-lg mb-2">Return Summary</h2>
                            <p><strong>Total Returned Invoices:</strong> {totalReturns}</p>
                            <p><strong>Total Returned Units:</strong> {totalReturnUnits}</p>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h2 className="font-semibold text-lg mb-2">Customer Info</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {/* First line: Customer Name & Market Point */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Customer Name<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name || ""}
                                        onChange={handleChange}
                                        className="border px-2 py-1 w-full rounded"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Market Point
                                    </label>
                                    <select
                                        name="marketPoint"
                                        value={formData.marketPoint || ""}
                                        onChange={handleChange}
                                        className="border px-2 py-1 w-full rounded bg-white"
                                    >
                                        <option value="">Select Market Point</option>
                                        <option value="Gulshan">Gulshan</option>
                                        <option value="Banani">Banani</option>
                                        <option value="Dhanmondi">Dhanmondi</option>
                                        <option value="Uttara">Uttara</option>
                                    </select>
                                </div>

                                {/* Second line: Address */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address || ""}
                                        onChange={handleChange}
                                        className="border px-2 py-1 w-full rounded"
                                    />
                                </div>

                                {/* Third line: Trade License & Drug License */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Trade License
                                    </label>
                                    <input
                                        type="text"
                                        name="tradeLicense"
                                        value={formData.tradeLicense || ""}
                                        onChange={handleChange}
                                        className="border px-2 py-1 w-full rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Drug License
                                    </label>
                                    <input
                                        type="text"
                                        name="drugLicense"
                                        value={formData.drugLicense || ""}
                                        onChange={handleChange}
                                        className="border px-2 py-1 w-full rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Update Button */}
                        <div className="text-right">
                            <button
                                onClick={handleUpdate}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium"
                            >
                                Update Customer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminCustomerUpdate;