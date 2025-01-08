import axios from 'axios';
import { useRef, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdContactPhone, MdLockReset } from 'react-icons/md';
import Swal from 'sweetalert2';
import Loader from '../../../Components/Loader/Loader';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useAuth from '../../../Hooks/useAuth';
import useHosting from '../../../Hooks/useHosting';
import useSingleUser from '../../../Hooks/useSingleUser';

const MyProfile = () => {
    const { user, resetPassword, loading } = useAuth();
    const [singleUser, loadingSingleUser, refetch] = useSingleUser();
    const img_hosting_url = useHosting();

    const [file, setFile] = useState(null);
    const [enterUserEmail, setEnterUserEmail] = useState(null);

    const designationRef = useRef();
    const mobileNoRef = useRef();
    const userEmailRef = useRef(null);

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

    /* const handleUpdateDesignation = () => {
        const designation = designationRef.current.value;
        const updateDesignation = { designation: designation }
        updateInfo(updateDesignation);
    } */

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
                <PageTitle
                    from={"Profile"}
                    to={"My profile"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">My profile</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
            </div>
            <div className='flex justify-center items-center'>
                <div className="w-full bg-white">
                    <div className='w-full lg:flex justify-center items-center'>
                        <div className='w-full mx-auto flex justify-center items-center'>
                            {
                                loadingSingleUser
                                    ?
                                    <Loader />
                                    :
                                    <div className='flex flex-col justify-center items-center'>
                                        <div className='lg:flex justify-center items-center my-5'>
                                            <img
                                                className="h-[280px] w-[280px] mb-3 p-3 border border-gray-600 rounded-lg shadow-lg shadow-blue-200"
                                                src={
                                                    singleUser.profilePicture
                                                        ?
                                                        `${singleUser.profilePicture}`
                                                        :
                                                        "https://i.ibb.co/6r3zmMg/user.jpg"
                                                } alt="Loading..." />
                                        </div>
                                        <p className='text-center text font-bold my-2 text-gray-600'>Update Profile Picture</p>
                                        <hr></hr>
                                        <form onSubmit={handleUpload}>
                                            <input type="file" className="file-input file-input-bordered w-full max-w-xs" onChange={handleChange} />
                                            <div className='text-center'>
                                                <button value="submit" className='w-[120px] btn mx-auto my-5 bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white flex'>
                                                    Upload <FaCloudUploadAlt className='text-xl' />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                            }
                        </div>
                        <div className='w-full p-3 my-3 lg:m-5'>
                            {
                                loading
                                    ?
                                    <Loader />
                                    :
                                    <>
                                        <p className='text font-bold my-2 text-gray-600'>Name</p>
                                        <hr></hr>
                                        <p className="mb-5 text-sm font-bold"> {user?.displayName}</p>
                                        <p className='text font-bold my-2 text-gray-600'>Email</p>
                                        <hr></hr>
                                        <p className="mb-5 text-sm font-bold">{user?.email}</p>
                                        <p className='text font-bold my-2 text-gray-600'>Designation</p>
                                        <hr></hr>
                                        <p className="mb-5 text-sm font-bold">
                                            {
                                                (singleUser?.designation) ? "✓ Admin" : "✓ User"
                                            }
                                        </p>
                                        {/* <p className='text font-bold my-2 text-gray-600'>Designation</p>
                                        <hr></hr>
                                        <div className='w-full flex justify-between items-center my-3'>
                                            <input
                                                type="text"
                                                defaultValue={singleUser.designation}
                                                placeholder="Please enter your designation"
                                                className="input border-0 border-b-2 border-b-[#3B82F6] mr-5 font-bold w-full rounded focus:outline-none text-sm"
                                                ref={designationRef}
                                            />
                                            <button
                                                className='w-[120px] btn mx-auto bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white flex'
                                                onClick={handleUpdateDesignation}
                                            >
                                                Update <GrStatusGood className="text-xl" />
                                            </button>
                                        </div> */}
                                        {/* <hr></hr> */}
                                        <p className='text font-bold my-2 text-gray-600'>Mobile Number</p>
                                        <hr></hr>
                                        <div className='w-full flex justify-between items-center my-3'>
                                            <input
                                                type="text"
                                                defaultValue={singleUser.mobile}
                                                placeholder="Please enter your mobile no."
                                                className="input border-0 border-b-2 border-b-[#3B82F6] mr-5 font-bold w-full rounded focus:outline-none text-sm"
                                                ref={mobileNoRef}
                                            />
                                            <button
                                                className='w-[120px] btn mx-auto bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white flex'
                                                onClick={handleUpdateMobileNo}
                                            >
                                                Update <MdContactPhone className="text-xl" />
                                            </button>
                                        </div>
                                        {/* <hr></hr> */}
                                        <p className='text font-bold my-2 text-gray-600'>Change Password</p>
                                        <hr></hr>
                                        <div className='w-full flex justify-between items-center my-3'>
                                            <input
                                                type="email"
                                                placeholder="Please enter your email"
                                                className="input border-0 border-b-2 border-b-[#3B82F6] mr-5 font-bold w-full rounded focus:outline-none text-sm"
                                                onBlur={handleEmailOnBlur}
                                                ref={userEmailRef}
                                            />
                                            <button
                                                onClick={handleResetPassword}
                                                className='w-[120px] btn mx-auto bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white flex'
                                            >
                                                Reset <MdLockReset className="text-xl" />
                                            </button>
                                        </div>
                                    </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyProfile;