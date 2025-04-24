import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit, FaTimes, FaTrashAlt, FaUserClock } from "react-icons/fa";
import { FaEye, FaUserShield } from "react-icons/fa6";
import Swal from "sweetalert2";
import UpdateAccessModal from "../../../Components/UpdateAccessModal/UpdateAccessModal";
import UserDetailsModal from "../../../Components/UserDetailsModal/UserDetailsModal";
import UserUpdateModal from "../../../Components/UserUpdateModal/UserUpdateModal";
import useApiConfig from "../../../Hooks/useApiConfig";
import useSingleUser from "../../../Hooks/useSingleUser";

const UsersCard = ({ user, idx, refetch }) => {
    const baseUrl = useApiConfig();

    const [singleUser] = useSingleUser();

    const [selectedUser, setSelectedUser] = useState(null);
    const [showRolePopup, setShowRolePopup] = useState(false);
    const [newRole, setNewRole] = useState("");

    const [userUpdateModal, setUserUpdateModal] = useState(false);
    const [accessModal, setAccessModal] = useState(false);


    useEffect(() => {
        if (user?.designation) {
            setNewRole(user.designation);
        }
    }, [user]);

    const handleUpdateDesignation = () => {
        if (!newRole.trim()) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Designation cannot be empty!",
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: `Update designation to "${newRole}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update role!",
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedDesignation = {
                    designation: newRole
                }
                axios
                    .patch(`${baseUrl}/users/admin/${user._id}`, updatedDesignation)
                    .then((response) => {
                        if (response.data.modifiedCount > 0) {
                            refetch();
                            Swal.fire({
                                title: "Success!",
                                text: "User role updated successfully.",
                                icon: "success",
                                confirmButtonText: "OK",
                            });
                        }
                        setShowRolePopup(false);
                        setNewRole("");
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Failed to update role!",
                        });
                    });
            }
        });
    };

    const handleDelete = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`${baseUrl}/user/${user._id}`)
                    .then((response) => {
                        if (response.data.deletedCount > 0) {
                            refetch();
                            Swal.fire({
                                title: "Deleted!",
                                text: "User has been deleted.",
                                icon: "success",
                                confirmButtonText: "OK",
                                confirmButtonColor: "#3B82F6",
                            });
                        }
                    });
            }
        });
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
    };

    return (
        <>
            <tr>
                <td className="text-center">
                    {(idx + 1) < 10 ? `0${idx + 1}` : `${idx + 1}`}
                </td>
                <td className="flex justify-center items-center">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
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
                </td>
                <td>
                    <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-sm opacity-80">{user.designation}</div>
                    </div>
                </td>
                <td>
                    <p>{user.email}</p>
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                            title="Details"
                        >
                            <FaEye className="text-green-500" />
                        </button>

                        {
                            singleUser?.permissions?.includes("update-users")
                            &&
                            <button
                                onClick={() => setShowRolePopup(true)}
                                className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                                title="Update Designation"
                            >
                                <FaUserShield className="text-orange-500" />
                            </button>
                        }

                        {
                            singleUser?.permissions?.includes("update-users")
                            &&
                            <button
                                onClick={() => setUserUpdateModal(true)}
                                className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                                title="Update Details"
                            >
                                <FaEdit className="text-orange-500" />
                            </button>
                        }

                        {
                            singleUser?.permissions?.includes("update-users")
                            &&
                            <button
                                onClick={() => setAccessModal(true)}
                                className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                                title="Update Access"
                            >
                                <FaUserClock className="text-yellow-500" />
                            </button>
                        }

                        {
                            singleUser?.permissions?.includes("update-users")
                            &&
                            <button
                                onClick={() => handleDelete()}
                                className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                                title="Delete User"
                            >
                                <FaTrashAlt className="text-red-500" />
                            </button>
                        }
                    </div>
                </th>
            </tr>

            {/* Role Update Popup */}
            {showRolePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-4/5 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Update User</h2>
                            <button
                                onClick={() => setShowRolePopup(false)}
                                aria-label="Close modal"
                                className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            {/* Input Field */}
                            <input
                                type="text"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                placeholder="Enter designation"
                                className="w-full border-gray-500 bg-white border p-2 text-sm rounded-md"
                            />

                            {/* Submit Button */}
                            <div>
                                <button
                                    onClick={handleUpdateDesignation}
                                    className="w-full mx-auto py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowRolePopup(false)}
                                className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {/* user update modal */}
            {userUpdateModal && (
                <UserUpdateModal
                    user={user}
                    refetch={refetch}
                    onClose={() => setUserUpdateModal(false)}
                />
            )}

            {/* user update modal */}
            {accessModal && (
                <UpdateAccessModal
                    user={user}
                    refetch={refetch}
                    onClose={() => setAccessModal(false)}
                />
            )}
        </>
    );
};

export default UsersCard;