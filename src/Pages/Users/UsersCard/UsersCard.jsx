import axios from "axios";
import { useState } from "react";
import { FaEdit, FaTrashAlt, FaUserClock } from "react-icons/fa";
import { FaEye, FaUserShield } from "react-icons/fa6";
import Swal from "sweetalert2";
import UpdateAccessModal from "../../../Components/UpdateAccessModal/UpdateAccessModal";
import UserDetailsModal from "../../../Components/UserDetailsModal/UserDetailsModal";
import UserUpdateModal from "../../../Components/UserUpdateModal/UserUpdateModal";
import useSingleUser from "../../../Hooks/useSingleUser";

const UsersCard = ({ user, idx, refetch }) => {
    const [singleUser] = useSingleUser();

    const [selectedUser, setSelectedUser] = useState(null);
    const [showRolePopup, setShowRolePopup] = useState(false);
    const [newRole, setNewRole] = useState("");

    const [userUpdateModal, setUserUpdateModal] = useState(false);
    const [accessModal, setAccessModal] = useState(false);

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
                    .patch(`http://localhost:5000/users/admin/${user._id}`, updatedDesignation)
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
                    .delete(`http://localhost:5000/user/${user._id}`)
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
                    {idx < 10 ? `0${idx + 1}` : `${idx + 1}`}
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
                        >
                            <FaEye className="text-green-500" />
                        </button>

                        {
                            singleUser?.permissions?.includes("update-users")
                            &&
                            <button
                                onClick={() => setShowRolePopup(true)}
                                className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
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
                            >
                                <FaTrashAlt className="text-red-500" />
                            </button>
                        }
                    </div>
                </th>
            </tr>

            {/* Role Update Popup */}
            {showRolePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="relative bg-white p-8 rounded-2xl shadow-2xl transform transition-transform duration-300 scale-105">
                        {/* Close Icon */}
                        <button
                            onClick={() => setShowRolePopup(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
                        >
                            ✖
                        </button>

                        {/* Title */}
                        <h2 className="text-xl font-medium mb-6 text-gray-800 text-center">
                            Update Designation
                        </h2>

                        {/* Input */}
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full mb-6 focus:ring-4 focus:ring-blue-300 focus:outline-none shadow-md transition"
                            placeholder="Enter designation"
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowRolePopup(false)}
                                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 hover:shadow-md transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateDesignation}
                                className="px-5 py-2 bg-[#3B82F6] text-white rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition duration-300"
                            >
                                Update
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