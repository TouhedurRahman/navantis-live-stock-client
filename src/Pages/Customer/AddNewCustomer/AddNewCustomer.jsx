import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useAuth from "../../../Hooks/useAuth";
import useSingleUser from "../../../Hooks/useSingleUser";

const AddNewCustomer = () => {
    const { user } = useAuth();
    const [singleUser] = useSingleUser();

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const addNewCustomerMutation = useMutation({
        mutationFn: async (data) => {
            const newCustomer = {
                name: data.name,
                territory: data.territory,
                tradeLicense: data.trl,
                drugLicense: data.drl,
                address: data.address,
                mobile: data.mobile,
                email: data.email,
                contactPerson: data.cperson || data.mobile,
                discount: Number(data.discount) || 0,
                crLimit: Number(data.crlimit) || 0,
                addedBy: data.addedby,
                addedEmail: data.addedemail,
                status: 'pending',
                date: getTodayDate()
            };
            const response = await axios.post('http://localhost:5000/customers', newCustomer);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding customer", error);
        },
    });

    const handleAddProduct = async (data) => {
        try {
            await Promise.all([
                addNewCustomerMutation.mutateAsync(data),
            ]);

            reset();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "New customer added.",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            if (error.response?.status === 409) {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Customer already exist",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                console.error("Error adding product:", error);
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Faild to add customer",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        }
    };

    return (
        <div>
            <PageTitle
                from={"Customer"}
                to={"Add customer"}
            />

            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Add a new customer</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(handleAddProduct)} className="p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Customer Name <span className="text-red-500">*</span>
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
                                Territory <span className="text-red-500">*</span>
                            </label>
                            <input
                                defaultValue={singleUser?.territory}
                                {...register("territory")}
                                className="border-gray-500 bg-white border p-2 text-sm cursor-not-allowed"
                                readOnly
                            />
                            {errors.territory && <p className="text-red-500 text-sm">{errors.territory.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Trade License No. <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("trl", { required: "Trade license is required" })}
                                placeholder="Enter trade license no"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.trl && <p className="text-red-500 text-sm">{errors.trl.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Drug License No.
                            </label>
                            <input
                                {...register("drl")}
                                placeholder="Enter drug license no"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.drl && <p className="text-red-500 text-sm">{errors.drl.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col mb-2">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register("address", { required: "Address is required" })}
                            placeholder="Enter address"
                            className="border-gray-500 bg-white border p-2 text-sm"
                        />
                        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Mobile No. <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register("mobile", { required: "Mobile no. is required" })}
                                placeholder="01XXXXXXXXX"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile.message}</p>}
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Email
                            </label>
                            <input
                                {...register("email")}
                                placeholder="user@gmail.com"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Contact Person
                            </label>
                            <input
                                {...register("cperson")}
                                placeholder="01XXXXXXXXX"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col mb-2">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Discount
                            </label>
                            <input
                                {...register("discount")}
                                placeholder="Enter parcentage rate"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                            {errors.discount && <p className="text-red-500 text-sm">{errors.discount.message}</p>}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Credit Limit
                            </label>
                            <input
                                {...register("crlimit")}
                                placeholder="Enter credit limit"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                        </div>
                    </div>

                    <h1 className="mt-10 text-sm">Customer added by</h1>
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
                                defaultValue={user.email}
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

export default AddNewCustomer;