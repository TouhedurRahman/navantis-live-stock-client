import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { MdMarkEmailUnread } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import useAuth from "../../Hooks/useAuth";
import useLogOut from "../../Hooks/useLogOut";

const NonVerified = () => {
    const { user } = useAuth();
    const handleLogout = useLogOut();
    const [resendLoading, setResendLoading] = useState(false);

    const handleResendVerificationEmail = () => {
        setResendLoading(true);
        sendEmailVerification(user)
            .then(() => {
                Swal.fire({
                    title: "Email Sent!",
                    text: "Please check your email.",
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3B82F6"
                });
            })
            .catch((error) => {
                toast.error("Failed to resend verification email. Please try again.");
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Failed to resend verification email. Please try again.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3B82F6"
                });
            })
            .finally(() => {
                setResendLoading(false);
            });
    };

    return (
        <div className='py-20 justify-center flex items-center'>
            <div className="hero-content mt-10 mx-3 shadow-2xl shadow-orange-100 border-2 border-[#3B82F6] rounded-lg flex-col lg:flex-row">
                <div className="card shrink-0 w-full max-w-sm p-5">
                    <h2 className='text-2xl flex justify-center items-center font-bold'>
                        <MdMarkEmailUnread className='mr-2 text-[#3B82F6]' /> Email Not Verified
                    </h2>
                    <p className="text-center mt-4">Your email (<span className="text-red-600">{user.email}</span>) is not verified. Please check your inbox and follow the instructions to verify your email address.</p>
                    <div className="form-control w-full mt-5">
                        <button
                            className='w-full btn bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white'
                            onClick={handleResendVerificationEmail}
                            disabled={resendLoading}
                        >
                            {resendLoading ? "Sending..." : "Resend Verification Email"}
                        </button>
                    </div>
                    <div className="form-control w-full mt-5">
                        <button
                            className='w-full btn bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white'
                            onClick={() => window.location.reload()}
                        >
                            Reload
                        </button>
                    </div>
                    <div className="form-control w-full mt-5">
                        <button
                            className='w-full btn bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white'
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NonVerified;