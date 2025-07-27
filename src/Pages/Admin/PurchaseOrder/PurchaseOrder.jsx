import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useApiConfig from '../../../Hooks/useApiConfig';
import useSingleUser from '../../../Hooks/useSingleUser';

const PurchaseOrder = () => {
    const baseUrl = useApiConfig();
    const [singleUser] = useSingleUser();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const addNewPrchaseMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: data.name,
                netWeight: `${data.netWeight} ${data.weightUnit}`,
                category: `${data.category}`,
                batch: data.batch,
                expire: data.expire,
                actualPrice: Number(data.ap),
                tradePrice: Number(data.tp),
                totalQuantity: Number(data.quantity),
                orderDate: data.date,
                addedby: data.addedby,
                addedemail: data.addedemail
            };
            const response = await axios.post(`${baseUrl}/purchase-order`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error puchase order:", error);
        },
    });

    const purchaseOrderStatusMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: data.name,
                netWeight: `${data.netWeight} ${data.weightUnit}`,
                category: `${data.category}`,
                batch: data.batch,
                expire: data.expire,
                actualPrice: Number(data.ap),
                tradePrice: Number(data.tp),
                totalQuantity: Number(data.quantity),
                orderDate: data.date,
                status: "pending",
                addedby: data.addedby,
                addedemail: data.addedemail
            };
            const response = await axios.post(`${baseUrl}/order-stock-wh`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error puchase order:", error);
        },
    });

    const handleAddProduct = async (data) => {
        try {
            await Promise.all([
                addNewPrchaseMutation.mutateAsync(data),
                purchaseOrderStatusMutation.mutateAsync(data)
            ]);

            reset();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Order successfully placed",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            if (error.response?.status === 409) {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Product already exist",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                console.error("Error adding product:", error);
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Faild to add product",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        }
    };

    return (
        <div>
            <PageTitle
                from={"Admin"}
                to={"Purchase order"}
            />

            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">New purchase order</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(handleAddProduct)} className="p-6 pt-0">
                    <div className="flex justify-center items-center mb-2">
                        <div className="w-full md:w-1/2 flex flex-col">
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Net Weight <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    {...register("netWeight", { required: "Net weight is required" })}
                                    placeholder="Enter net weight"
                                    className="border-gray-500 border-r-0 bg-white border p-2 text-sm w-full"
                                    onWheel={(e) => e.target.blur()}
                                />
                                <select
                                    {...register("weightUnit", { required: "Unit is required" })}
                                    className="border-gray-500 border-l-0 bg-white border p-2 text-sm cursor-pointer"
                                >
                                    <option value="ML">ML</option>
                                    <option value="GM">GM</option>
                                </select>
                            </div>
                            {errors.netWeight && <p className="text-red-500 text-sm">{errors.netWeight.message}</p>}
                            {errors.weightUnit && <p className="text-red-500 text-sm">{errors.weightUnit.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("category", { required: "Category is required" })}
                                className="border-gray-500 bg-white border p-2 text-sm cursor-pointer"
                            >
                                <option value="">~~ Select a Category ~~</option>
                                <option value="Bionike">Bionike</option>
                                <option value="Noiderma">Noiderma</option>
                            </select>
                            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
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
                                Actual Price (AP) <span className="text-red-500">*</span>
                            </label>
                            <input
                                // type="number"
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
                                // type="number"
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
            </div>
        </div>
    );
};

export default PurchaseOrder;