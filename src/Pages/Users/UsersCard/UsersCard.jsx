import axios from "axios";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FaEye, FaUserShield } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import UserDetailsModal from "../../../Components/UserDetailsModal/UserDetailsModal";

const UsersCard = ({ user, idx, refetch }) => {
    const [selectedUser, setSelectedUser] = useState(null);

    const handleMakeAdmin = user => {
        Swal.fire({
            title: "Are you sure?",
            // text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Make Admin!"
        }).then((result) => {
            if (result.isConfirmed) {
                const url = `http://localhost:5000/users/admin/${user._id}`;
                fetch(url, {
                    method: 'PATCH'
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        if (data.modifiedCount) {
                            refetch();
                        }
                    })
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
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`http://localhost:5000/user/${user._id}`)
                    .then(response => {
                        if (response.data.deletedCount > 0) {
                            refetch();
                            Swal.fire({
                                title: "Deleted!",
                                text: "User has been deleted.",
                                icon: "success",
                                confirmButtonText: "OK",
                                confirmButtonColor: "#3B82F6"
                            });
                        }
                    })
            }
        });
    }

    const handleViewDetails = (user) => {
        setSelectedUser(user);
    };

    return (
        <>

            <tr>
                <td className="text-center">
                    {
                        (idx < 10)
                            ?
                            `0${idx + 1}`
                            :
                            `${idx + 1}`
                    }
                </td>
                <td className="flex justify-center items-center">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
                                <img
                                    src={
                                        user.profilePicture
                                            ?
                                            `${user.profilePicture}`
                                            :
                                            "https://i.ibb.co/6r3zmMg/user.jpg"
                                    }
                                    alt="Loading..." />
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-sm opacity-80">{user.designation && user.designation}</div>
                    </div>
                </td>
                <td>
                    <p>
                        {user.email}
                    </p>
                </td>
                <td>
                    {
                        user.role === 'admin'
                            ?
                            <div className="text-center">Admin</div>
                            :
                            <div className="flex justify-center items-center">
                                <button
                                    onClick={() => handleMakeAdmin(user)}
                                    className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none">
                                    <FaUserShield className="text-orange-500" />
                                </button>
                            </div>
                    }
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <Link>
                            <button
                                onClick={() => handleViewDetails(user)}
                                className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none">
                                <FaEye className="text-green-500" />
                            </button>
                        </Link>
                        <button
                            onClick={() => handleDelete()}
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTrashAlt className="text-red-500" />
                        </button>
                    </div>
                </th>
            </tr>
            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </>
    );
};

export default UsersCard;