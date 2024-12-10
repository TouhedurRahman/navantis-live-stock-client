import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useDepotRequest from '../../../Hooks/useDepotRequest';
import useWhProducts from '../../../Hooks/useWhProducts';

const DepotDelivery = () => {
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

    const [products] = useDepotRequest();
    const [whProducts, whProductsLoading] = useWhProducts();
    const [selectedProduct, setSelectedProduct] = useState();

    const filteredProducts = products?.filter(product => product.status === 'approved');

    const uniqueDates = [...new Set(filteredProducts?.map(product => product.approvedDate))];

    const selectedDate = watch('date');
    const selectedProductName = watch('name');

    const filteredNames = filteredProducts?.filter(product => product.approvedDate === selectedDate);

    const selectedProductDetails = filteredNames?.find(product => product.productName === selectedProductName);

    useEffect(() => {
        if (selectedProductDetails) {
            setSelectedProduct(selectedProductDetails);
        }
    }, [selectedProductDetails]);

    const whProductsByName = selectedProductName
        && whProducts
            .filter(product => product.productName === selectedProductName)
            .sort((a, b) => new Date(a.expire) - new Date(b.expire));


    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const updateDptReqMutation = useMutation({
        mutationFn: async (data) => {
            const { _id, ...productWithoutId } = selectedProduct;
            const updatedProduct = {
                ...productWithoutId,
                deliveredQuantity: selectedProduct.approvedQuantity,
                deliveredDate: getTodayDate(),
                status: "delivered"
            };
            const response = await axios.patch(`http://localhost:5000/depot-request/${selectedProduct._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding stock-in:", error);
        },
    });

    const handleAddProduct = async (data) => {
        try {
            await Promise.all([updateDptReqMutation.mutateAsync(data)]);
            reset();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Depot delivery successful",
                showConfirmButton: false,
                timer: 1500
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Depot delivery failed",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <div>
            <PageTitle from={"Warehouse"} to={"Depot request"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Send to depot</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(handleAddProduct)} className="p-6 pt-0">
                    {/* Date Field */}
                    <div className="flex justify-center items-center mb-2">
                        <div className="w-full md:w-1/3 flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("date", { required: "Date is required" })}
                                className="border-gray-500 bg-white border p-2 text-sm"
                            >
                                <option value="">Select date</option>
                                {uniqueDates.map((date, index) => (
                                    <option key={index} value={date}>
                                        {date}
                                    </option>
                                ))}
                            </select>
                            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                        </div>
                    </div>

                    {/* Product Name Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("name", { required: "Name is required" })}
                                className="border-gray-500 bg-white border p-2 text-sm"
                                disabled={!selectedDate}
                            >
                                <option value="">Select product name</option>
                                {filteredNames?.map((product, index) => (
                                    <option key={index} value={product.productName}>
                                        {product.productName}
                                    </option>
                                ))}
                            </select>
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>

                        {/* Approved Quantity */}
                        <div>
                            <div className="flex flex-col">
                                <label className="text-[#6E719A] mb-1 text-sm">
                                    Approved Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    defaultValue={selectedProductName && selectedProduct?.approvedQuantity}
                                    {...register("approvedQuantity", { required: "Approved is required" })}
                                    placeholder="Enter product short code"
                                    className="border-gray-500 bg-white border p-2 text-sm cursor-not-allowed"
                                    disabled={!selectedProductName}
                                    readOnly
                                />
                                {errors.approvedQuantity && <p className="text-red-500 text-sm">{errors.approvedQuantity.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Show Selected Product Details */}
                    {whProductsByName && whProductsByName.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-bold text-lg">Selected Product Details</h3>
                            {whProductsByName.map((product, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex flex-col">
                                        <label className="text-[#6E719A] mb-1 text-sm">Lot</label>
                                        <input
                                            value={product.batch || "N/A"}
                                            className="border-gray-500 bg-white border p-2 text-sm"
                                            readOnly
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[#6E719A] mb-1 text-sm">Expiry Date</label>
                                        <input
                                            value={product.expire || "N/A"}
                                            className="border-gray-500 bg-white border p-2 text-sm"
                                            readOnly
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[#6E719A] mb-1 text-sm">Available Quantity</label>
                                        <input
                                            value={product.totalQuantity || "N/A"}
                                            className="border-gray-500 bg-white border p-2 text-sm"
                                            readOnly
                                        />
                                    </div>
                                    {/* Input for Delivered Quantity */}
                                    <div className="flex flex-col">
                                        <label className="text-[#6E719A] mb-1 text-sm">Deliver Quantity</label>
                                        <input
                                            type="number"
                                            {...register(`deliverQuantity${index}`, { required: "Deliver Quantity is required" })}
                                            className="border-gray-500 bg-white border p-2 text-sm"
                                            onWheel={(e) => e.target.blur()}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" className="bg-blue-500 text-white mt-5 p-2 rounded text-sm">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default DepotDelivery;