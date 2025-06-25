import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useApiConfig from "../../../Hooks/useApiConfig";
import useAuth from "../../../Hooks/useAuth";
import useSingleUser from "../../../Hooks/useSingleUser";
import Territories from "../Territories/Territories";

const Territory = () => {
    const { user } = useAuth();
    const [singleUser] = useSingleUser();
    const baseUrl = useApiConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const addNewTerritoryMutation = useMutation({
        mutationFn: async (data) => {
            const territory = {
                territory: data.territoryName,
                addedBy: singleUser?.name,
                addedEmail: user.email,
                date: getTodayDate()
            };
            const response = await axios.post(`${baseUrl}/territories`, territory);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding territory", error);
        },
    });

    const onSubmit = async (data) => {
        try {
            await Promise.all([
                addNewTerritoryMutation.mutateAsync(data),
            ]);

            reset();
            setIsModalOpen(false);

            Swal.fire({
                position: "center",
                icon: "success",
                title: "New territory added.",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            if (error.response?.status === 409) {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Territory already exist",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "Faild to add territory",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        }
    };

    return (
        <>
            <div>
                <PageTitle from={"Territory"} to={"All territory"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">All territory list</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>
                <div className="h-10 flex justify-center items-center p-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-[#2563eb] text-white font-medium px-4 py-2 rounded hover:bg-[#1d4ed8] transition duration-200"
                    >
                        <FaPlus className="text-sm" />
                        Add New Territory
                    </button>
                </div>
                <div className="p-6">
                    <Territories />
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-4/5 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Add Territory</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Close modal"
                                className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-3">
                            <input
                                type="text"
                                {...register("territoryName", { required: "Territory name is required" })}
                                placeholder="Enter territory name"
                                className="w-full text-center border-gray-500 bg-white border p-2 text-sm rounded-md"
                            />
                            {errors.territoryName && <p className="text-red-500 text-sm text-center">{errors.territoryName.message}</p>}

                            <div>
                                <button
                                    type="submit"
                                    className="w-full py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    reset();
                                }}
                                className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Territory;