import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";

const permissionsList = ["admin", "warehouse", "depot", "customer", "order", "all-user"];

const UpdateAccessModal = ({ user, onClose }) => {
    const { handleSubmit } = useForm();
    const [selectedPermissions, setSelectedPermissions] = useState(user?.permissions || []);

    useEffect(() => {
        setSelectedPermissions(user?.permissions || []);
    }, [user]);

    const handleCheckboxChange = (permission) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    const onSubmit = async () => {
        const updatedUser = {
            // ...user,
            permissions: selectedPermissions,
        };

        try {
            await axios.patch(`http://localhost:5000/user/${user.email}`, updatedUser);
            alert("Permissions updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error updating permissions", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-4/5 flex flex-col" style={{ maxHeight: "90%" }}>
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Update User Access</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 overflow-y-auto">
                    <h3 className="text-lg font-medium mb-3">Update Permissions for {user.name}</h3>
                    <div className="space-y-2">
                        {permissionsList.map((perm) => (
                            <label key={perm} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm)}
                                    onChange={() => handleCheckboxChange(perm)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                {perm
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                            </label>
                        ))}
                    </div>
                    <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        Save Changes
                    </button>
                </form>

                {/* Footer */}
                <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateAccessModal;