import axios from 'axios';
import { useRef, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdContactPhone, MdLockReset } from 'react-icons/md';
import Swal from 'sweetalert2';
import Loader from '../../../Components/Loader/Loader';
import PageTitle from '../../../Components/PageTitle/PageTitle';
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
            <div>
                <PageTitle from={"Profile"} to={"My Profile"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">My Profile</h1>
                    <hr className='border border-gray-500 mb-5' />
                </div>
            </div>

            <div className="flex justify-center items-center">
                <div className="w-full bg-white p-6">
                    <div className="lg:flex gap-10">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center w-full lg:w-1/3">
                            {loadingSingleUser ? <Loader /> : (
                                <>
                                    <div className="relative my-5">
                                        <img
                                            className="h-40 w-40 p-2 border border-gray-300 rounded-full shadow-md"
                                            src={singleUser.profilePicture || "https://i.ibb.co/6r3zmMg/user.jpg"}
                                            alt="Profile"
                                        />
                                    </div>
                                    <p className="text-gray-600 font-semibold">Update Profile Picture</p>
                                    <hr className="w-4/5 my-2" />
                                    <form onSubmit={handleUpload} className="flex flex-col items-center">
                                        <input
                                            type="file"
                                            className="file-input file-input-bordered w-full max-w-xs"
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="submit"
                                            className="w-[140px] btn mt-4 bg-blue-500 text-white font-bold hover:bg-blue-600 flex items-center gap-2"
                                        >
                                            Upload <FaCloudUploadAlt className="text-xl" />
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* User Information Section */}
                        <div className="w-full lg:w-2/3">
                            {loading ? <Loader /> : (
                                <div className="space-y-6">

                                    {/* User Details */}
                                    <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">User Information</h3>
                                        <div className="mt-4 space-y-3">
                                            <p><span className="text-gray-600 font-semibold">Name:</span> {user?.displayName}</p>
                                            <p><span className="text-gray-600 font-semibold">Designation:</span> {singleUser?.designation || "User"}</p>
                                            <p><span className="text-gray-600 font-semibold">Mobile:</span> {singleUser?.mobile ? `+880 ${singleUser.mobile.slice(-10, -6)}-${singleUser.mobile.slice(-6)}` : "Not updated yet."}
                                            </p>
                                            <p><span className="text-gray-600 font-semibold">Email:</span> {user?.email}</p>
                                        </div>
                                    </div>

                                    {/* Parent Details (if available) */}
                                    {singleUser?.parentId && (
                                        <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">My {findParent?.designation}</h3>
                                            <div className="mt-4 space-y-3">
                                                <p><span className="text-gray-600 font-semibold">Name:</span> {singleUser?.parentName || "N/A"}</p>
                                                <p><span className="text-gray-600 font-semibold">Designation:</span> {findParent?.designation || "N/A"}</p>
                                                <p><span className="text-gray-600 font-semibold">Mobile:</span> {findParent?.mobile ? `+880 ${findParent.mobile.slice(-10, -6)}-${findParent.mobile.slice(-6)}` : "Not updated yet."}
                                                </p>
                                                <p><span className="text-gray-600 font-semibold">Email:</span> {findParent?.email || "Not updated yet."}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Update Section */}
                                    <div className="p-5 bg-gray-50 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Account Settings</h3>
                                        <div className="mt-4 space-y-4">
                                            {/* Update Mobile Number */}
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    // defaultValue={singleUser.mobile}
                                                    placeholder="Enter mobile no"
                                                    className="input border-0 border-b-2 border-blue-500 font-bold w-full rounded focus:outline-none text-sm"
                                                    ref={mobileNoRef}
                                                />
                                                <button
                                                    className="w-[120px] btn bg-blue-500 text-white font-bold hover:bg-blue-600 flex items-center gap-2"
                                                    onClick={handleUpdateMobileNo}
                                                >
                                                    Update <MdContactPhone className="text-xl" />
                                                </button>
                                            </div>

                                            {/* Reset Password */}
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="input border-0 border-b-2 border-blue-500 font-bold w-full rounded focus:outline-none text-sm"
                                                    onBlur={handleEmailOnBlur}
                                                    ref={userEmailRef}
                                                />
                                                <button
                                                    onClick={handleResetPassword}
                                                    className="w-[120px] btn bg-red-500 text-white font-bold hover:bg-red-600 flex items-center gap-2"
                                                >
                                                    Reset <MdLockReset className="text-xl" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyProfile;