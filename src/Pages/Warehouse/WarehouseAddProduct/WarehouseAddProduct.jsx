import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useOrderStockProducts from '../../../Hooks/useOrderStockProducts';
import { useEffect, useState } from 'react';

const WarehouseAddProduct = () => {
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

    // Fetch product data
    const [products, loading] = useOrderStockProducts();

    // Filter out products where status is not "pending"
    const filteredProducts = products?.filter(product => product.status === 'pending');

    // Extract unique dates from filtered data
    const uniqueDates = [...new Set(filteredProducts?.map(product => product.date))];

    // Watch selected date and product name
    const selectedDate = watch('date');
    const selectedProductName = watch('name');

    // Filter product names based on selected date
    const filteredNames = filteredProducts?.filter(product => product.date === selectedDate);

    // Find all info of the selected product
    const selectedProductDetails = filteredNames?.find(product => product.productName === selectedProductName);

    const addProductMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: data.name,
                productCode: data.psc,
                batch: data.batch,
                expire: data.expire,
                actualPrice: Number(data.ap),
                tradePrice: Number(data.tp),
                totalQuantity: Number(Number(data.pwb) + Number(data.pwob))
            };
            const response = await axios.post('http://localhost:5000/wh-products', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding product to warehouse:", error);
        },
    });

    const addStockMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: data.name,
                productCode: data.psc,
                batch: data.batch,
                expire: data.expire,
                actualPrice: Number(data.ap),
                tradePrice: Number(data.tp),
                boxQuantity: Number(data.box),
                productWithBox: Number(data.pwb),
                productWithoutBox: Number(data.pwob),
                totalQuantity: Number(Number(data.pwb) + Number(data.pwob)),
                date: data.date,
                remarks: data.remarks,
                addedby: data.addedby,
                addedemail: data.addedemail
            };
            const response = await axios.post('http://localhost:5000/stock-in-wh', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding stock-in:", error);
        },
    });

    const handleAddProduct = async (data) => {
        try {
            await Promise.all([
                addProductMutation.mutateAsync(data),
                addStockMutation.mutateAsync(data)
            ]);

            reset();
            alert('Product added successfully!');
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Product already exists.');
            } else {
                console.error("Error adding product:", error);
                alert("Failed to add product.");
            }
        }
    };

    return (
        <div>
            <PageTitle from={"Warehouse"} to={"Add new product"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Add new product</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(handleAddProduct)} className="p-6 pt-0">
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

                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Product Short Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("psc", { required: "PSC is required" })}
                                placeholder="Enter product short code"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.psc && <p className="text-red-500 text-sm">{errors.psc.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Batch <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("batch", { required: "Batch is required" })}
                                placeholder="Enter product batch/batch no"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.batch && <p className="text-red-500 text-sm">{errors.batch.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Expire MM/YY <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("expire", {
                                    required: "Expire date is required",
                                    pattern: {
                                        value: /^(0[1-9]|1[0-2])\/\d{2}$/, // Matches MM/YY format
                                        message: "Invalid date format. Use MM/YY"
                                    }
                                })}
                                placeholder="MM/YY"
                                className="border-gray-500 bg-white border p-2 text-sm"
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
                                {...register("box", { required: "Box quantity is required" })}
                                placeholder="Enter box quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.box && <p className="text-red-500 text-sm">{errors.box.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Product Quantity (With Box) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='number'
                                {...register("pwb", { required: "With Box product quantity is required" })}
                                placeholder="Enter with box product quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.pwb && <p className="text-red-500 text-sm">{errors.pwb.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Product Quantity (Without Box) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='number'
                                {...register("pwob", { required: "Without Box product quantity is required" })}
                                placeholder="Enter without box product quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
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
                                {...register("remarks", { required: "Remarks is required" })}
                                placeholder="Enter remarks"
                                className="border-gray-500 bg-white border p-2 text-sm"
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
                                defaultValue={"Navantis Pharma Limited"}
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
                                defaultValue={"info@navantispharma.com"}
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