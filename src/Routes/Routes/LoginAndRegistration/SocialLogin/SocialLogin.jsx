import axios from "axios";
import { FaGoogle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import useAuth from "../../../../Hooks/useAuth";
import useApiConfig from "../../../../Hooks/useApiConfig";

const SocialLogin = () => {
    const { googleLogIn } = useAuth();
    const baseUrl = useApiConfig();

    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleGoogleLogIn = () => {
        googleLogIn()
            .then(result => {
                const loggedUser = result.user;
                const user = {
                    name: loggedUser.displayName,
                    email: loggedUser.email,
                    profilePicture: loggedUser.photoURL
                };

                const url = `${baseUrl}/users`;
                axios.post(url, user)
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'User Login successful.',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        navigate(from, { replace: true });
                    });
            })
            .catch(error => {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: 'Google Sign-In failed.',
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3B82F6"
                });
            });
    }

    return (
        <div>
            <div className="divider">OR</div>

            <button
                onClick={handleGoogleLogIn}
                className='w-full btn bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white'
            >
                <FaGoogle className="" /> <span className="">CONTINUE WITH GOOGLE</span>
            </button>
        </div>
    );
};

export default SocialLogin;