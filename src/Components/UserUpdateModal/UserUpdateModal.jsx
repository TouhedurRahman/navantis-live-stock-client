import React from 'react';
import { FaTimes } from 'react-icons/fa';
import useAllUsers from '../../Hooks/useAllUsers';

const UserUpdateModal = ({ user, onClose }) => {
    const [allUsers, loading, refetch] = useAllUsers();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5 flex flex-col"
                style={{ maxHeight: '90%' }}
            >
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

                {/* Content */}
                <div className="p-5 rounded-lg shadow-sm flex-1 overflow-y-auto">
                    <div className='text-center font-medium'>
                        <p className='text-2xl'>
                            {user.name}
                        </p>
                        <p className='text-sm'>
                            {user.designation}
                        </p>
                    </div>
                </div>

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