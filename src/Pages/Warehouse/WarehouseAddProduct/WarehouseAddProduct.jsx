import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import PageTitle from '../../../Components/PageTitle/PageTitle';

const WarehouseAddProduct = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const addProductMutation = useMutation({
        mutationFn: async (newProduct) => {
            const response = await axios.post('http://localhost:5000/wh-products', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding product to warehouse:", error);
        },
    });

    const addStockMutation = useMutation({
        mutationFn: async (newProduct) => {
            const response = await axios.post('http://localhost:5000/stock-in-wh', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding stock-in:", error);
        },
    });

    const handleAddProduct = async (data) => {
        const newProduct = {
            name: data.name,
            price: data.price,
            lot: data.lot,
            expire: data.expire,
            quantity: data.quantity,
            date: data.date,
            addedby: data.addedby,
            addedemail: data.addedemail
        };

        try {
            await Promise.all([
                addProductMutation.mutateAsync(newProduct),
                addStockMutation.mutateAsync(newProduct)
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
                                Price/Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("price", { required: "Price is required" })}
                                placeholder="Enter price"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Lot/Batch <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("lot", { required: "Lot/Batch is required" })}
                                placeholder="Enter product lot/batch no"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.lot && <p className="text-red-500 text-sm">{errors.lot.message}</p>}
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
                    <div className="flex flex-col mb-2">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            Image upload <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            {...register("image")}
                            // {...register("image", { required: "Image file is required" })}
                            className="h-10 file-input file-input-bordered border-gray-500 w-full rounded-none text-sm cursor-pointer"
                        />
                        {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='number'
                                {...register("quantity", { required: "Quantity is Quantity" })}
                                placeholder="Enter quantity"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type='date'
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