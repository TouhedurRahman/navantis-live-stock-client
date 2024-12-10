import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useDepotRequest from '../../../Hooks/useDepotRequest';

const DepotDelivery = () => {
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

    const [products] = useDepotRequest();
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
            await Promise.all([
                updateDptReqMutation.mutateAsync(data)
            ]);

            reset();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Depot delivery successfull",
                showConfirmButton: false,
                timer: 1500
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Depot delivery faild",
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
                        <div>
                            <div className="flex flex-col">
                                <label className="text-[#6E719A] mb-1 text-sm">
                                    Approved Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    defaultValue={selectedProductName && selectedProduct?.approvedQuantity}
                                    {...register("psc", { required: "PSC is required" })}
                                    placeholder="Enter product short code"
                                    className="border-gray-500 bg-white border p-2 text-sm cursor-not-allowed"
                                    disabled={!selectedProductName}
                                    readOnly
                                />
                                {errors.psc && <p className="text-red-500 text-sm">{errors.psc.message}</p>}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="bg-blue-500 text-white mt-5 p-2 rounded text-sm">Submit</button>
                </form>
            </div >
        </div >
    );
};

export default DepotDelivery;