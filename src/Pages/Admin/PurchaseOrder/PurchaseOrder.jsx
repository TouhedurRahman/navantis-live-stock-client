import React from 'react';
import { useForm } from 'react-hook-form';
import PageTitle from '../../../Components/PageTitle/PageTitle';

const PurchaseOrder = () => {
    const { user } = true;
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleAddProduct = async (data) => {
        console.log(data);
    };

    return (
        <div>
            <PageTitle
                from={"Admin"}
                to={"Purchase Order"}
            />

            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">New purchase order</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(handleAddProduct)} className="p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("name", { required: "Product name is required" })}
                                placeholder="Enter product name"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Product Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("quantity", { required: "Quantity is required" })}
                                placeholder="Enter product quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Actual Price (AP) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("ap", { required: "Actual price is required" })}
                                placeholder="Enter actual price"
                                className="border-gray-500 bg-white border p-2 text-sm"
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.ap && <p className="text-red-500 text-sm">{errors.ap.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Trade Price (TP) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register("tp", { required: "Trade price is required" })}
                                placeholder="Enter trade price"
                                className="border-gray-500 bg-white border p-2 text-sm"
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.tp && <p className="text-red-500 text-sm">{errors.tp.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                {...register("date", { required: "Date is required" })}
                                placeholder="Enter date"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
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
                                defaultValue={user?.displayName || "Navantis Pharma Limited"}
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
                                defaultValue={user?.email || "info@navantispharma.com"}
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
            </div>
        </div>
    );
};

export default PurchaseOrder;