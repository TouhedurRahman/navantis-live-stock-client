import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageTitle from '../../../../Components/PageTitle/PageTitle';
import useAuth from '../../../../Hooks/useAuth';
import useRiders from '../../../../Hooks/useRiders';
import useSingleUser from '../../../../Hooks/useSingleUser';
import useApiConfig from '../../../../Hooks/useApiConfig';

const UpdateRider = () => {
    const { user } = useAuth();
    const [singleUser] = useSingleUser();
    const baseUrl = useApiConfig();

    const { register, handleSubmit, reset, formState: { errors } } = useForm();


    const [riders, , refetch] = useRiders();
    const { id } = useParams();
    const rider = riders.find(rider => rider._id == id);

    const navigate = useNavigate();

    const updateRiderMutation = useMutation({
        mutationFn: async (data) => {
            const updatedRider = {
                name: data.name,
                nidl: data.nidl || 'N/A',
                mobile: data.mobile,
                email: data.email || 'N/A',
                addedBy: data.addedby,
                addedEmail: data.addedemail
            };
            const response = await axios.patch(`${baseUrl}/rider/${id}`, updatedRider);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding rider", error);
        },
    });

    const handleUpdateCustomer = async (data) => {
        try {
            await Promise.all([
                updateRiderMutation.mutateAsync(data),
            ]);

            reset();
            refetch();
            navigate('/dispatch-rider');
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Rider successfully updated.",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Faild to update rider",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <div>
            <PageTitle
                from={"Depot"}
                to={"Update rider"}
            />

            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Update rider</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(handleUpdateCustomer)} className="p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Rider Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                defaultValue={rider?.name}
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
                                defaultValue={rider?.nidl !== 'N/A' ? rider?.nidl : ""}
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
                                defaultValue={rider?.mobile}
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
                                defaultValue={rider?.email !== 'N/A' ? rider?.email : ""}
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
                                defaultValue={user?.email}
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
                    <button type="submit" className="bg-blue-500 text-white mt-5 p-2 rounded text-sm">Update</button>
                </form>
            </div>
        </div>
    );
};

export default UpdateRider;