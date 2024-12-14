import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
        mutationFn: async (totalDeliveryQuantity) => {
            const { _id, ...productWithoutId } = selectedProduct;
            const updatedProduct = {
                ...productWithoutId,
                deliveredQuantity: Number(totalDeliveryQuantity),
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
        const deliveredProducts = [];

        const totalDeliveryQuantity = Object.keys(data)
            .filter(key => key.startsWith("deliverQuantity"))
            .reduce((total, key) => total + Number(data[key]), 0);

        // Find the number of products based on the deliverQuantity keys
        const deliverKeys = Object.keys(data).filter(key => key.startsWith("totalQuantity"));
        const productCount = deliverKeys.length;

        for (let i = 0; i < productCount; i++) {
            deliveredProducts.push({
                productName: selectedProductName,
                batch: data[`batch${i}`],
                expire: data[`expire${i}`],
                totalQuantity: Number(data[`totalQuantity${i}`]),
                deliveredQuantity: Number(data[`deliverQuantity${i}`]),
            });
        }
        console.log("Delivered Products:", deliveredProducts);

        try {
            if (selectedProduct.approvedQuantity === totalDeliveryQuantity) {
                await Promise.all([updateDptReqMutation.mutateAsync(totalDeliveryQuantity)]);

                reset();

                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Depot delivery successful",
                    showConfirmButton: false,
                    timer: 1500
                });

                window.location.reload();
            } else {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Please deliver approved quantity",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
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
                    {/*
                    // Show Selected Product Details
                    {whProductsByName && whProductsByName.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-xl font-extrabold mb-4 text-center border-b-2 border--gray-500 pb-2">
                                {selectedProductName}
                            </h3>
                            {whProductsByName.map((product, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                    
                                    <div className="flex flex-col items-center w-full md:w-1/4">
                                        <div className="flex items-center space-x-1">
                                            <label className="mb-1 text-[#6E719A] font-medium text-xs">Batch</label>
                                        </div>
                                        <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                            <input
                                                value={product.batch || "N/A"}
                                                className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center w-full md:w-1/4">
                                        <div className="flex items-center space-x-1">
                                            <label className="mb-1 text-[#6E719A] font-medium text-xs">Expire Date</label>
                                        </div>
                                        <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                            <input
                                                value={product.expire || "N/A"}
                                                className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center w-full md:w-1/4">
                                        <div className="flex items-center space-x-1">
                                            <label className="mb-1 text-[#6E719A] font-medium text-xs">Available Quantity</label>
                                        </div>
                                        <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                            <input
                                                value={product.totalQuantity || "N/A"}
                                                className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center w-full md:w-1/4">
                                        <div className="flex items-center space-x-1">
                                            <label className="mb-1 text-[#6E719A] font-medium text-xs">Deliver Quantity</label>
                                        </div>
                                        <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                            <input
                                                type="number"
                                                placeholder='Enter deliver quantity'
                                                {...register(`deliverQuantity${index}`, { required: "Deliver Quantity is required" })}
                                                className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    */}

                    {/* Show Selected Product Details */}
                    {whProductsByName && whProductsByName.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-xl font-extrabold mb-4 text-center border-b-2 border-gray-500 pb-2">
                                {selectedProductName}
                            </h3>
                            {(() => {
                                let cumulativeQuantity = 0;
                                const filteredBatches = whProductsByName.filter(product => {
                                    if (cumulativeQuantity >= selectedProduct?.approvedQuantity) {
                                        return false;
                                    }
                                    cumulativeQuantity += product.totalQuantity;
                                    return true;
                                });

                                return filteredBatches.map((product, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                        {/* Batch Section */}
                                        <div className="flex flex-col items-center w-full md:w-1/4">
                                            <div className="flex items-center space-x-1">
                                                <label className="mb-1 text-[#6E719A] font-medium text-xs">Batch</label>
                                            </div>
                                            <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                                <input
                                                    value={product.batch}
                                                    {...register(`batch${index}`)}
                                                    className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        {/* Expiry Date Section */}
                                        <div className="flex flex-col items-center w-full md:w-1/4">
                                            <div className="flex items-center space-x-1">
                                                <label className="mb-1 text-[#6E719A] font-medium text-xs">Expire Date</label>
                                            </div>
                                            <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                                <input
                                                    value={product.expire}
                                                    {...register(`expire${index}`)}
                                                    className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        {/* Available Quantity Section */}
                                        <div className="flex flex-col items-center w-full md:w-1/4">
                                            <div className="flex items-center space-x-1">
                                                <label className="mb-1 text-[#6E719A] font-medium text-xs">Available Quantity</label>
                                            </div>
                                            <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                                <input
                                                    value={product.totalQuantity}
                                                    {...register(`totalQuantity${index}`)}
                                                    className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        {/* Delivered Quantity Input Section */}
                                        <div className="flex flex-col items-center w-full md:w-1/4">
                                            <div className="flex items-center space-x-1">
                                                <label className="mb-1 text-[#6E719A] font-medium text-xs">Deliver Quantity</label>
                                            </div>
                                            <div className="bg-[#F4F5F7] rounded-md p-3 w-full text-center">
                                                <input
                                                    type="number"
                                                    placeholder="Enter deliver quantity"
                                                    {...register(`deliverQuantity${index}`, {
                                                        required: "Deliver Quantity is required",
                                                        validate: (value) =>
                                                            index === filteredBatches.length - 1 || value == product.totalQuantity ||
                                                            "Deliver Quantity must match Available Quantity for all except the last"
                                                    })}
                                                    className="bg-transparent text-center border-none text-[#2A2A72] w-full text-sm focus:outline-none"
                                                    onWheel={(e) => e.target.blur()}
                                                />
                                            </div>
                                            {/* Show error if validation fails */}
                                            {errors[`deliverQuantity${index}`] && (
                                                <p className="text-red-500 text-xs mt-1">{errors[`deliverQuantity${index}`]?.message}</p>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
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