import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import useAllUsers from '../../Hooks/useAllUsers';

const hierarchy = {
    "Managing Director": [],
    "Sales Manager": ["Managing Director"],
    "Zonal Manager": ["Sales Manager", "Managing Director"],
    "Area Manager": ["Zonal Manager", "Sales Manager"],
    "Medical Promotion Officer": ["Area Manager", "Zonal Manager"],
    "Skin Care Coordinator": ["Area Manager", "Zonal Manager"],
    "Area Sales Executive": ["Area Manager", "Zonal Manager"]
};

const UserUpdateModal = ({ user, onClose }) => {
    const [allUsers, loading, refetch] = useAllUsers();
    const { register, handleSubmit } = useForm();
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        setManagers(allUsers);
    }, [allUsers]);

    const getHierarchy = (designation) => {
        const parents = hierarchy[designation] || [];
        const parent = parents[0] || null;
        const grandparent = parents[1] || null;
        return { parent, grandparent };
    };

    const { parent, grandparent } = getHierarchy(user.designation);

    const onSubmit = (data) => {
        console.log('Selected Parent _id:', data.parent);
        console.log('Selected Grandparent _id:', data.grandparent);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5 flex flex-col" style={{ maxHeight: '90%' }}>
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

                {/* main content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 rounded-lg shadow-sm flex-1 overflow-y-auto">
                    <div className='text-center font-medium'>
                        <p className='text-2xl'>{user.name}</p>
                        <p className='text-sm'>{user.designation}</p>
                    </div>

                    {parent && (
                        <div className="mt-5">
                            <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
                                Select {parent}
                            </label>
                            <select
                                id="parent"
                                {...register('parent')}
                                className="mt-2 block w-full px-4 py-2 text-gray-700 bg-white border rounded-md"
                                defaultValue=""
                            >
                                <option value="">Select {parent}</option>
                                {managers.filter(u => u.designation === parent).map(manager => (
                                    <option key={manager._id} value={manager._id}>{manager.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {grandparent && (
                        <div className="mt-5">
                            <label htmlFor="grandparent" className="block text-sm font-medium text-gray-700">
                                Select {grandparent}
                            </label>
                            <select
                                id="grandparent"
                                {...register('grandparent')}
                                className="mt-2 block w-full px-4 py-2 text-gray-700 bg-white border rounded-md"
                                defaultValue=""
                            >
                                <option value="">Select {grandparent}</option>
                                {managers.filter(u => u.designation === grandparent).map(manager => (
                                    <option key={manager._id} value={manager._id}>{manager.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full mx-auto my-5 ml-2 px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Save Changes
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