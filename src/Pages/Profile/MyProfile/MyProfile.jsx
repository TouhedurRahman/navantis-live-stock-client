import axios from 'axios';
import { useRef, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdContactPhone, MdLockReset } from 'react-icons/md';
import Swal from 'sweetalert2';
import Loader from '../../../Components/Loader/Loader';
import useAllUsers from '../../../Hooks/useAllUsers';
import useAuth from '../../../Hooks/useAuth';
import useHosting from '../../../Hooks/useHosting';
import useSingleUser from '../../../Hooks/useSingleUser';

const MyProfile = () => {
    const { user, resetPassword, loading } = useAuth();
    const [allUsers] = useAllUsers();
    const [singleUser, loadingSingleUser, refetch] = useSingleUser();
    const img_hosting_url = useHosting();

    const [file, setFile] = useState(null);
    const [enterUserEmail, setEnterUserEmail] = useState(null);

    const mobileNoRef = useRef();
    const userEmailRef = useRef(null);

    const findParent = allUsers.find(allu => allu._id == singleUser.parentId);

    const updateInfo = (updatedInfo) => {
        const url = `http://localhost:5000/user/${user.email}`;
        axios.patch(url, updatedInfo)
            .then((response) => {
                if (response.data.acknowledged === true) {
                    refetch();
                    Swal.fire({
                        // position: "top-end",
                        icon: "success",
                        title: "Successfully Updated!",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            })
    }

    const handleChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("image", file);

        fetch(img_hosting_url, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(imgResponse => {
                const imgURL = imgResponse.data.display_url;
                const updatedProfilePic = {
                    profilePicture: imgURL
                }
                updateInfo(updatedProfilePic);
            })
            .catch(() => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Opps! File not selected.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3B82F6"
                });
            })
    }

    const handleUpdateMobileNo = () => {
        const mobileNo = mobileNoRef.current.value;
        const updateMobileNo = { mobile: mobileNo }
        updateInfo(updateMobileNo);
    }

    const handleEmailOnBlur = (e) => {
        const email = e.target.value;
        if (user.email === email) {
            setEnterUserEmail(email);
        }
    }

    const handleResetPassword = () => {
        if (enterUserEmail) {
            resetPassword(enterUserEmail)
                .then(() => {
                    Swal.fire({
                        title: "Email Sent!",
                        text: "Please check your email.",
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#3B82F6"
                    });
                    userEmailRef.current.value = '';
                    setEnterUserEmail('');
                })
                .then(() => { })
        }
        else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error! Please enter your registered email.",
                confirmButtonText: "OK",
                confirmButtonColor: "#3B82F6"
            });
            userEmailRef.current.value = '';
        }
    }

    return (
        <>
            <div className="w-full flex justify-center">
                <div className="w-full bg-white grid grid-cols-1 md:grid-cols-3 gap-2">

                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center bg-gray-50 p-6 shadow">
                        {loadingSingleUser ? <Loader /> : (
                            <div className='flex flex-col justify-center items center'>
                                <h3 className="text-lg text-center font-semibold text-gray-700 w-full border-b pb-2 mb-6">Profile Picture</h3>
                                <img
                                    className="h-72 w-72 border border-gray-300 rounded-full shadow-md"
                                    src={singleUser.profilePicture || "https://i.ibb.co/6r3zmMg/user.jpg"}
                                    alt="Profile"
                                />
                                <p className="text-gray-600 font-semibold mt-4">Update Profile Picture</p>
                                <form onSubmit={handleUpload} className="w-full text-center mt-3">
                                    <input
                                        type="file"
                                        className="file-input file-input-bordered w-full"
                                        onChange={handleChange}
                                    />
                                    <button type="submit" className="btn bg-blue-500 text-white mt-3 w-full flex items-center justify-center">
                                        Upload <FaCloudUploadAlt className="ml-1" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* User & Parent Info + Account Settings */}
                    <div className="col-span-2 flex flex-col gap-2">
                        {/* User & Parent Info */}
                        <div className={`grid grid-cols-1 md:grid-cols-${singleUser?.parentId ? "2" : "1"} gap-2`}>

                            {/* User Info */}
                            <div className={`p-6 bg-gray-50 shadow ${!singleUser?.parentId ? "md:col-span-2" : ""}`}>
                                <h3 className="text-lg text-center font-semibold text-gray-700 border-b pb-2">My Details</h3>
                                <table className="w-full mt-4 text-sm border-collapse">
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="p-2 font-semibold text-gray-600">Name</td>
                                            <td className="p-2">{user?.displayName}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2 font-semibold text-gray-600">Designation</td>
                                            <td className="p-2">{singleUser?.designation || "User"}</td>
                                        </tr>
                                        {
                                            singleUser?.territory && (
                                                <tr className="border-b">
                                                    <td className="p-2 font-semibold text-gray-600">Territory</td>
                                                    <td className="p-2">{singleUser?.territory || "Territory"}</td>
                                                </tr>
                                            )
                                        }
                                        <tr className="border-b">
                                            <td className="p-2 font-semibold text-gray-600">Mobile</td>
                                            <td className="p-2">{singleUser?.mobile ? `+880 ${singleUser.mobile.slice(-10, -6)}-${singleUser.mobile.slice(-6)}` : "Not updated yet."}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 font-semibold text-gray-600">Email</td>
                                            <td className="p-2">{user?.email}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Parent Info (if available) */}
                            {singleUser?.parentId && (
                                <div className="p-6 bg-gray-50 shadow">
                                    <h3 className="text-lg text-center font-semibold text-gray-700 border-b pb-2">My {findParent?.designation}</h3>
                                    <table className="w-full mt-4 text-sm border-collapse">
                                        <tbody>
                                            <tr className="border-b">
                                                <td className="p-2 font-semibold text-gray-600">Name</td>
                                                <td className="p-2">{singleUser?.parentName || "N/A"}</td>
                                            </tr>
                                            <tr className="border-b">
                                                <td className="p-2 font-semibold text-gray-600">Designation</td>
                                                <td className="p-2">{findParent?.designation || "N/A"}</td>
                                            </tr>
                                            {
                                                findParent?.territory && (
                                                    <tr className="border-b">
                                                        <td className="p-2 font-semibold text-gray-600">Territory</td>
                                                        <td className="p-2">{findParent?.territory || "Territory"}</td>
                                                    </tr>
                                                )
                                            }
                                            <tr className="border-b">
                                                <td className="p-2 font-semibold text-gray-600">Mobile</td>
                                                <td className="p-2">{findParent?.mobile ? `+880 ${findParent.mobile.slice(-10, -6)}-${findParent.mobile.slice(-6)}` : "Not updated yet."}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-semibold text-gray-600">Email</td>
                                                <td className="p-2">{findParent?.email || "Not updated yet."}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Account Settings */}
                        <div className="p-6 bg-gray-50 shadow">
                            <h3 className="text-xl text-center font-semibold text-gray-700 border-b pb-3">Account Settings</h3>
                            <div className="mt-6 space-y-6">

                                {/* Update Mobile Number */}
                                <div className="p-4 bg-white shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <h4 className="font-semibold text-gray-700">Update Mobile Number</h4>
                                        <p className="text-gray-500">Ensure your number is always up to date.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Enter mobile no"
                                            className="lg:w-64 input border border-gray-300 p-2 rounded w-full sm:w-auto text-sm"
                                            ref={mobileNoRef}
                                        />
                                        <button
                                            className="lg:w-36 btn bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center px-4 py-2 rounded-md"
                                            onClick={handleUpdateMobileNo}
                                        >
                                            Update <MdContactPhone className="ml-2 text-lg" />
                                        </button>
                                    </div>
                                </div>

                                {/* Reset Password */}
                                <div className="p-4 bg-white shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <h4 className="font-semibold text-gray-700">Reset Password</h4>
                                        <p className="text-gray-500">You will receive a password reset link.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="lg:w-64 input border border-gray-300 p-2 rounded w-full sm:w-auto text-sm"
                                            onBlur={handleEmailOnBlur}
                                            ref={userEmailRef}
                                        />
                                        <button
                                            onClick={handleResetPassword}
                                            className="lg:w-36 btn bg-red-500 hover:bg-red-600 text-white flex items-center justify-center px-4 py-2 rounded-md"
                                        >
                                            Reset <MdLockReset className="ml-2 text-lg" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyProfile;