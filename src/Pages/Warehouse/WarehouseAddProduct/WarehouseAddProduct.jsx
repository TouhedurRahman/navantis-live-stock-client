import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useOrderStockProducts from '../../../Hooks/useOrderStockProducts';
import useSingleUser from '../../../Hooks/useSingleUser';
import useApiConfig from '../../../Hooks/useApiConfig';

const WarehouseAddProduct = () => {
    const baseUrl = useApiConfig();
    const [singleUser] = useSingleUser();

    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

    const [products] = useOrderStockProducts();
    const [selectedProduct, setSelectedProduct] = useState();

    const filteredProducts = products?.filter(product => product.status === 'pending');

    const uniqueDates = [...new Set(filteredProducts?.map(product => product.orderDate))];

    const selectedDate = watch('date');
    const selectedProductId = watch('productId');

    const dateWiseProducts = filteredProducts?.filter(product => product.orderDate === selectedDate);

    const selectedProductDetails = dateWiseProducts?.find(product => product._id === selectedProductId);

    const selectedProductName = selectedProductDetails?.productName;

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

    const reqWhStockMutation = useMutation({
        mutationFn: async (data) => {
            const updatedProduct = {
                productName: selectedProductName,
                netWeight: selectedProductDetails.netWeight,
                productCode: data.psc,
                batch: data.batch,
                expire: data.expire,

                actualPrice: Number(selectedProduct.actualPrice),
                tradePrice: Number(selectedProduct.tradePrice),

                boxQuantity: Number(data.box) || 0,
                productWithBox: Number(data.pwb) || 0,
                productWithoutBox: Number(data.pwob) || 0,

                orderQuantity: Number(selectedProduct.totalQuantity),
                totalQuantity: Number(Number(data.pwb) + Number(data.pwob)),
                missingQuantity: Number(Number(selectedProduct.totalQuantity) - (Number(Number(data.pwb) + Number(data.pwob)))),

                orderDate: selectedProduct.orderDate,
                date: getTodayDate(),

                remarks: data.remarks,
                status: "requested",

                addedby: data.addedby,
                addedemail: data.addedemail
            };
            const response = await axios.patch(`${baseUrl}/wh-req/${selectedProduct._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding stock-in:", error);
        },
    });

    const handleAddProduct = async (data) => {
        try {
            await Promise.all([
                reqWhStockMutation.mutateAsync(data)
            ]);

            reset();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Requested for stock in",
                showConfirmButton: false,
                timer: 1500
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Stock in request faild",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <div>
            <PageTitle from={"Warehouse"} to={"Add new product"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Add new product</h1>
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
                                {...register("productId", { required: "Name is required" })}
                                className="border-gray-500 bg-white border p-2 text-sm"
                                disabled={!selectedDate}
                            >
                                <option value="">Select product name</option>
                                {dateWiseProducts?.map((product, index) => (
                                    <option key={index} value={product._id}>
                                        {product.productName} - {product.netWeight}
                                    </option>
                                ))}
                            </select>
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                        <div>
                            <div className="flex flex-col">
                                <label className="text-[#6E719A] mb-1 text-sm">
                                    Product Short Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    defaultValue={selectedProductName && selectedProduct?.productCode}
                                    {...register("psc", { required: "PSC is required" })}
                                    placeholder="Enter product short code"
                                    className="border-gray-500 bg-white border p-2 text-sm"
                                    disabled={!selectedProductName}
                                />
                                {errors.psc && <p className="text-red-500 text-sm">{errors.psc.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Batch <span className="text-red-500">*</span>
                            </label>
                            <input
                                defaultValue={selectedProductName && selectedProduct?.batch}
                                {...register("batch", { required: "Batch is required" })}
                                placeholder="Enter product batch/batch no"
                                className="border-gray-500 bg-white border p-2 cursor-not-allowed text-sm"
                                disabled={!selectedProductName}
                                readOnly
                            />
                            {errors.batch && <p className="text-red-500 text-sm">{errors.batch.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Expire MM/YY <span className="text-red-500">*</span>
                            </label>
                            <input
                                defaultValue={selectedProductName && selectedProduct?.expire}
                                {...register("expire", {
                                    required: "Expire date is required",
                                    pattern: {
                                        value: /^(0[1-9]|1[0-2])\/\d{2}$/, // Matches MM/YY format
                                        message: "Invalid date format. Use MM/YY"
                                    }
                                })}
                                placeholder="MM/YY"
                                className="border-gray-500 bg-white border p-2 cursor-not-allowed text-sm"
                                disabled={!selectedProductName}
                                readOnly
                            />
                            {errors.expire && <p className="text-red-500 text-sm">{errors.expire.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Box Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='number'
                                defaultValue={selectedProductName && selectedProduct?.boxQuantity}
                                {...register("box", { required: "Box quantity is required" })}
                                placeholder="Enter box quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                                disabled={!selectedProductName}
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.box && <p className="text-red-500 text-sm">{errors.box.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Product Quantity (With Box) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='number'
                                defaultValue={selectedProductName && selectedProduct?.productWithBox}
                                {...register("pwb", { required: "Product with box is required" })}
                                placeholder="Enter with box product quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                                disabled={!selectedProductName}
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.pwb && <p className="text-red-500 text-sm">{errors.pwb.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Product Quantity (Without Box) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='number'
                                defaultValue={selectedProductName && selectedProduct?.productWithoutBox}
                                {...register("pwob", { required: "Product without box is required" })}
                                placeholder="Enter without box product quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                                disabled={!selectedProductName}
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.pwob && <p className="text-red-500 text-sm">{errors.pwob.message}</p>}
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Remarks <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                defaultValue={selectedProductName && selectedProduct?.remarks}
                                {...register("remarks", { required: "Remarks is required" })}
                                placeholder="Enter remarks"
                                className="border-gray-500 bg-white border p-2 text-sm"
                                disabled={!selectedProductName}
                            />
                            {errors.remarks && <p className="text-red-500 text-sm">{errors.remarks.message}</p>}
                        </div>
                    </div>

                    <h1 className="mt-10 text-sm">Product added by</h1>
                    <hr className='w-full border border-gray-500 mb-3' />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                defaultValue={singleUser?.name}
                                {...register("addedby", { required: "Added by is required" })}
                                placeholder="Enter name of person adding"
                                className="border-gray-500 bg-white border p-2 text-sm cursor-not-allowed"
                                readOnly
                            />
                            {errors.addedby && <p className="text-red-500 text-sm">{errors.addedby.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                defaultValue={singleUser?.email}
                                {...register("addedemail", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                placeholder="Enter email"
                                className="border-gray-500 bg-white border p-2 text-sm cursor-not-allowed"
                                readOnly
                            />
                            {errors.addedemail && <p className="text-red-500 text-sm">{errors.addedemail.message}</p>}
                        </div>
                    </div>

                    <button type="submit" className="bg-blue-500 text-white mt-5 p-2 rounded text-sm">Submit</button>
                </form>
            </div >
        </div >
    );
};

export default WarehouseAddProduct;