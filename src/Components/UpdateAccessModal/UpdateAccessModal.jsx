import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import useApiConfig from "../../Hooks/useApiConfig";

const permissionsList = [
    "all-users",
    "update-access",
    "update-users",
    "territory",
    "target",
    "admin",
    "warehouse",
    "depot",
    "accounts",
    "reports",
    "institute",
    "doctorRequisition",
    "customer",
    "order"
];

const UpdateAccessModal = ({ user, refetch, onClose }) => {
    const baseUrl = useApiConfig();

    const { handleSubmit } = useForm();
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        if (user?.permissions) {
            setSelectedPermissions(user.permissions);
        }
    }, [user]);

    const handleCheckboxChange = (permission) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    const onSubmit = async () => {
        try {
            await axios.patch(`${baseUrl}/user/${user.email}`, {
                permissions: selectedPermissions,
            });
            refetch();
            onClose();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Permissions successfully updated.",
                showConfirmButton: false,
                timer: 1500
            });
            window.location.reload();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Faild to update permissions!",
                showConfirmButton: false,
                timer: 1500
            });
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
                    <div className="flex flex-col justify-center items-center">
                        <div className="text-center mb-5">
                            <h3 className="text-2xl font-medium">{user.name}</h3>
                            <h3 className="text-lg font-medium">{user.designation}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {permissionsList.map((perm, index) => (
                                <div
                                    key={perm}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(perm)}
                                        onChange={() => handleCheckboxChange(perm)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                    {/* <span className="capitalize">{perm.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}</span> */}
                                    <span className="capitalize">
                                        {
                                            perm
                                                .replace(/([a-z])([A-Z])/g, '$1 $2')
                                                .replace(/-/g, ' ')
                                                .replace(/\b\w/g, char => char.toUpperCase())
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center items-center">
                        <button
                            type="submit"
                            className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                        >
                            Save Changes
                        </button>
                    </div>
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