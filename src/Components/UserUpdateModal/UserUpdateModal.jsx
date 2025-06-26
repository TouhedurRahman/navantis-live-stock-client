import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useAllUsers from '../../Hooks/useAllUsers';
import useApiConfig from '../../Hooks/useApiConfig';
import useTerritories from '../../Hooks/useTerritories';

const hierarchy = {
    "Managing Director": [],
    "Sales Manager": ["Managing Director"],
    "Zonal Manager": ["Sales Manager", "Managing Director"],
    "Area Manager": ["Zonal Manager", "Sales Manager"],
    "Sr. Area Manager": ["Zonal Manager", "Sales Manager"],
    "Medical Promotion Officer": ["Area Manager", "Zonal Manager"],
    "Sr. Medical Promotion Officer": ["Area Manager", "Zonal Manager"],
    "Skin Care Coordinator": ["Area Manager", "Zonal Manager"],
    "Sr. Skin Care Coordinator": ["Area Manager", "Zonal Manager"],
    "Area Sales Executive": ["Area Manager", "Zonal Manager"],
    "Sr. Area Sales Executive": ["Area Manager", "Zonal Manager"],
    "AM/Sr. AM": ["Zonal Manager", "Sales Manager"],
    "MPO/Sr. MPO": ["Area Manager", "Zonal Manager"],
    "SCC/Sr. SCC": ["Area Manager", "Zonal Manager"],
    "ASE/Sr. ASE": ["Area Manager", "Zonal Manager"]
};

const UserUpdateModal = ({ user, onClose }) => {
    const baseUrl = useApiConfig();

    const [allUsers, , refetch] = useAllUsers();
    const [territories] = useTerritories();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setValue
    } = useForm();

    const [managers, setManagers] = useState([]);

    const base = watch('base', '');
    const selectedTerritory = watch('territory', '');

    useEffect(() => {
        setManagers(allUsers);
    }, [allUsers]);

    const getHierarchy = (designation) => {
        const equivalentTitles = {
            "AM/Sr. AM": ["Area Manager", "Sr. Area Manager"],
            "MPO/Sr. MPO": ["Medical Promotion Officer"],
            "SCC/Sr. SCC": ["Skin Care Coordinator"],
            "ASE/Sr. ASE": ["Area Sales Executive"]
        };

        const mappedDesignations = equivalentTitles[designation] || [designation];
        let parents = [];

        mappedDesignations.forEach((mappedDesignation) => {
            if (hierarchy[mappedDesignation]) {
                parents.push(...hierarchy[mappedDesignation]);
            }
        });

        parents = [...new Set(parents)];

        const parent = parents[0] || null;
        const grandparent = parents[1] || null;
        return { parent, grandparent };
    };

    const { parent, grandparent } = getHierarchy(user.designation);

    useEffect(() => {
        if (base === "Field" && selectedTerritory) {
            const selected = territories.find(t => t.territory === selectedTerritory);

            if (selected) {
                const areaManager = managers.find(user => user.email === selected.amEmail);
                const zonalManager = managers.find(user => user.email === selected.zmEmail);

                if (parent?.includes("Area")) {
                    setValue('parent', areaManager?._id || '');
                    setValue('grandparent', zonalManager?._id || '');
                } else if (parent?.includes("Zonal")) {
                    setValue('parent', zonalManager?._id || '');
                    setValue('grandparent', '');
                }

                setValue('parentTerritory', selected.parentTerritory || '');
            }
        }
    }, [selectedTerritory, base, parent, grandparent, managers, territories, setValue]);

    const updateCustomerMutation = useMutation({
        mutationFn: async (data) => {
            let updatedUser = {};

            if (data.base !== 'Field') {
                updatedUser = {
                    base: data.base
                };
            } else {
                const selectedParent = managers.find(manager => manager._id === data.parent);
                const selectedGrandparent = managers.find(manager => manager._id === data.grandparent);

                updatedUser = {
                    base: data.base,
                    territory: data.territory,
                    parentTerritory: data.parentTerritory || "N/A",
                    parentId: data.parent || null,
                    parentName: selectedParent ? selectedParent.name : "Vacant",
                    grandParentId: data.grandparent || null,
                    grandParentName: selectedGrandparent ? selectedGrandparent.name : "Vacant"
                };
            }

            const response = await axios.patch(`${baseUrl}/user/${user.email}`, updatedUser);
            return response.data;
        },
        onError: (error) => {
            console.log('Error updating user: ', error);
        }
    });

    const onSubmit = (data) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Update ${user.name}'s info.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, update!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await updateCustomerMutation.mutateAsync(data);
                    refetch();
                    reset();
                    onClose();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Customer successfully updated.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "Failed to update customer",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-4/5 flex flex-col" style={{ maxHeight: '90%' }}>
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Update User</h2>
                    <button
                        onClick={() => onClose()}
                        aria-label="Close modal"
                        className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Main content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 rounded-lg shadow-sm flex-1 overflow-y-auto">
                    <div className='w-full flex justify-between items-center'>
                        <div className="w-1/2 flex justify-center items-center gap-3">
                            <div className="avatar">
                                <div className="h-24 w-24 rounded-full">
                                    <img
                                        src={
                                            user.profilePicture
                                                ? `${user.profilePicture}`
                                                : "https://i.ibb.co/6r3zmMg/user.jpg"
                                        }
                                        alt="Loading..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='w-1/2 text-center font-medium'>
                            <p className='text-2xl'>{user.name}</p>
                            <p className='text-sm'>{user.designation}</p>
                        </div>
                    </div>

                    {/* Base Selection */}
                    <div className="flex flex-col mt-4">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            Base <span className="text-red-500">*</span>
                        </label>
                        <select
                            defaultValue={user?.base}
                            {...register("base", { required: "Base selection is required" })}
                            className="border-gray-500 bg-white border p-2 text-sm"
                        >
                            <option value="">Select Base</option>
                            <option value="Head Quarter">Head Quarter</option>
                            <option value="Field">Field</option>
                        </select>
                        {errors.base && <p className="text-red-500 text-sm">{errors.base.message}</p>}
                    </div>

                    {base === "Field" && (
                        <>
                            {/* Territory Dropdown */}
                            <div className="flex flex-col mt-4">
                                <label className="text-[#6E719A] mb-1 text-sm">
                                    Territory <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("territory", { required: "Territory is required" })}
                                    className="border-gray-500 bg-white border p-2 text-sm"
                                    defaultValue={user?.territory}
                                >
                                    <option value="">Select Territory</option>
                                    {territories.map(t => (
                                        <option key={t._id} value={t.territory}>
                                            {t.territory}
                                        </option>
                                    ))}
                                </select>
                                {errors.territory && <p className="text-red-500 text-sm">{errors.territory.message}</p>}
                            </div>

                            {/* Parent Selection */}
                            {parent && (
                                <div className="mt-4">
                                    <label htmlFor="parent" className="text-[#6E719A] mb-1 text-sm">
                                        {parent} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="parent"
                                        {...register('parent')}
                                        className="w-full mt-1 border-gray-500 bg-white border p-2 text-sm"
                                    >
                                        <option value="">Select {parent}</option>
                                        {managers.filter(u =>
                                            u.designation === parent ||
                                            (parent === "Area Manager" && u.designation === "Sr. Area Manager")
                                        ).map(manager => (
                                            <option key={manager._id} value={manager._id}>{manager.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Grandparent Selection */}
                            {grandparent && (
                                <div className="mt-4">
                                    <label htmlFor="grandparent" className="text-[#6E719A] mb-1 text-sm">
                                        {grandparent}
                                    </label>
                                    <select
                                        id="grandparent"
                                        {...register('grandparent')}
                                        className="w-full mt-1 border-gray-500 bg-white border p-2 text-sm"
                                    >
                                        <option value="">Select {grandparent}</option>
                                        {managers.filter(u => u.designation === grandparent).map(manager => (
                                            <option key={manager._id} value={manager._id}>{manager.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Hidden parentTerritory input */}
                            <input
                                type="hidden"
                                {...register("parentTerritory")}
                                value={watch("parentTerritory")}
                            />
                        </>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full mx-auto my-5 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Update
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                    <button
                        onClick={() => onClose(false)}
                        className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserUpdateModal;