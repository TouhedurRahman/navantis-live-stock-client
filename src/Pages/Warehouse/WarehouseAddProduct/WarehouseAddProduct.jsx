import React from 'react';
import { useForm } from 'react-hook-form';
import PageTitle from '../../../Components/PageTitle/PageTitle';

const WarehouseAddProduct = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const handleAddProduct = data => {
        console.log(data);
    }

    return (
        <div>
            <PageTitle
                from={"Products - Warehouse"}
                to={"Add new product"}
            />

            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Add new product</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(handleAddProduct)} className="p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("name", { required: "Name is required" })}
                                placeholder="Enter product name"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Subtitle <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("subtitle", { required: "Subtitle is required" })}
                                placeholder="Enter subtitle"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.subtitle && <p className="text-red-500 text-sm">{errors.subtitle.message}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col mb-2">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            Image upload <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            {...register("image", { required: "Image file is required" })}
                            className="h-10 file-input file-input-bordered border-gray-500 w-full rounded-none text-sm cursor-pointer"
                        />
                        {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Price/Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("group", { required: "Group is required" })}
                                placeholder="Enter price"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.group && <p className="text-red-500 text-sm">{errors.group.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='number'
                                {...register("quantity", { required: "Group is Quantity" })}
                                placeholder="Enter quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
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
            </div>
        </div>
    );
};

export default WarehouseAddProduct;