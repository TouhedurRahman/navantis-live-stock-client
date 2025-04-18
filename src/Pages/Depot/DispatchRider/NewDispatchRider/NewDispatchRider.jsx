import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../../../Hooks/useAuth";
import useSingleUser from "../../../../Hooks/useSingleUser";
import useApiConfig from "../../../../Hooks/useApiConfig";

const NewDispatchRider = () => {
    const { user } = useAuth();
    const [singleUser] = useSingleUser();
    const baseUrl = useApiConfig();

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const addNewRiderMutation = useMutation({
        mutationFn: async (data) => {
            const newRider = {
                name: data.name,
                nidl: data.nidl || 'N/A',
                mobile: data.mobile,
                email: data.email || 'N/A',
                addedBy: data.addedby,
                addedEmail: data.addedemail
            };
            const response = await axios.post(`${baseUrl}/riders`, newRider);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding riders", error);
        },
    });

    const handleAddProduct = async (data) => {
        try {
            await Promise.all([
                addNewRiderMutation.mutateAsync(data),
            ]);

            reset();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "New rider added.",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Faild to add rider",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <div>
            <div className="bg-white">
                <form onSubmit={handleSubmit(handleAddProduct)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Rider Name <span className="text-red-500">*</span>
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
                                NID/License
                            </label>
                            <input
                                {...register("nidl")}
                                placeholder="Enter trade license no"
                                className="border-gray-500 bg-white border p-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
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
            </div >
        </div >
    );
};

export default NewDispatchRider;