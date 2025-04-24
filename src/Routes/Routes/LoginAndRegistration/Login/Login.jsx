import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { FaUserCircle } from "react-icons/fa";
// import { GrValidate } from "react-icons/gr";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { LoadCanvasTemplate, loadCaptchaEnginge, validateCaptcha } from "react-simple-captcha";
import Swal from 'sweetalert2';
import useAuth from "../../../../Hooks/useAuth";

const Login = () => {
    const { logIn, resetPassword } = useAuth();

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [isOpen, setIsOpen] = useState(false);
    const [enterUserEmail, setEnterUserEmail] = useState('');
    // const [loginDisabled, setLoginDisabled] = useState(true);
    // const [isCaptchaValid, setIsCaptchaValid] = useState(false);

    const navigate = useNavigate();

    const captchaRef = useRef(null);
    const userEmailRef = useRef(null);

    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    /* useEffect(() => {
        loadCaptchaEnginge(5);
    }, []); */

    /* const handleValidateCaptcha = () => {
        const captchaValue = captchaRef.current.value;

        if (validateCaptcha(captchaValue)) {
            setLoginDisabled(false);
            setIsCaptchaValid(true);
        } else {
            setLoginDisabled(true);
            setIsCaptchaValid(false);
        }
    } */

    const handleEmailOnBlur = (e) => {
        const email = e.target.value;
        setEnterUserEmail(email);
    }

    const handleLogin = (data) => {
        /* if (!isCaptchaValid) {
            alert('Please validate the CAPTCHA before logging in.');
            return;
        } */

        const email = data.email;
        const password = data.password;

        logIn(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                Swal.fire({
                    icon: "success",
                    title: "Login successful!",
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate(from, { replace: true });
            })
            .catch(error => {
                // console.error("Log in Error:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Wrong user credentials.',
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3B82F6"
                    // text: error.message,
                });
            });
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
                    reset();
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
        <div className='py-10 justify-center flex items-center'>
            <div className="hero-content mt-10 mx-3 shadow-2xl shadow-blue-50 border-2 border-[#3B82F6] rounded-lg flex-col lg:flex-row">
                <div className="card shrink-0 w-full max-w-sm p-5">
                    <h2 className='text-2xl flex justify-center items-center font-bold'><FaUserCircle className='mr-2 text-[#3B82F6]' /> Login</h2>
                    <form onSubmit={handleSubmit(handleLogin)}>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text font-bold">Email</span>
                            </label>
                            <input
                                type="email"
                                ref={userEmailRef}
                                {...register("email", { required: "Email Address is required" })}
                                placeholder="user@gmail.com"
                                className="input input-accent w-full max-w-xs  border-2 border-[#3B82F6] focus:outline-none"
                                onBlur={handleEmailOnBlur}
                            />
                            {
                                errors.email && <p className='text-red-600'>{errors.email?.message}</p>
                            }
                        </div>

                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text font-bold">Password</span>
                            </label>
                            <div className='relative'>
                                <div className='flex'>
                                    <input
                                        type={(isOpen === false) ? 'password' : 'text'}
                                        {...register("password", {
                                            required: "Password is required",
                                            maxLength: { value: 8, message: "Password must be 6-8 characters" },
                                            minLength: { value: 6, message: "Password must be 6-8 characters" },
                                        })}
                                        placeholder="●●●●●●●●"
                                        className="input input-accent w-full max-w-xs border-2 border-[#3B82F6] focus:outline-none"
                                    />
                                    <div className="absolute right-2 flex items-center h-full">
                                        {
                                            (isOpen === false)
                                                ?
                                                <AiFillEyeInvisible
                                                    style={{ cursor: "pointer" }}
                                                    className='w-full text-xl'
                                                    onClick={() => setIsOpen(!isOpen)}
                                                />
                                                :
                                                <AiFillEye
                                                    style={{ cursor: "pointer" }}
                                                    className='w-full text-xl'
                                                    onClick={() => setIsOpen(!isOpen)}
                                                />
                                        }
                                    </div>
                                </div>
                            </div>
                            {
                                errors.password && <p className='text-red-600'>{errors.password?.message}</p>
                            }

                            {/* <div className="form-control">
                                <div className='w-full max-w-xs flex justify-center items-center'>
                                    <label className="label">
                                        <LoadCanvasTemplate />
                                    </label>
                                </div>
                                <div className='form-control w-full max-w-xs flex flex-row justify between items-center space-x-2'>
                                    <input
                                        type="text"
                                        name="captcha"
                                        ref={captchaRef}
                                        placeholder="Type the captcha"
                                        className="w-[60%] input input-accent text-center input-bordered border-2 border-[#3B82F6] focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleValidateCaptcha} // Change button type to "button" to prevent form submission
                                        className='w-[40%] btn flex justify-center items-center bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-green-200 hover:border-[#3B82F6]'
                                    >
                                        Validate<GrValidate />
                                    </button>
                                </div>
                            </div> */}

                            <label className="label mb-1">
                                <span
                                    className="label-text-alt text-blue-600 hover:link"
                                    onClick={handleResetPassword}
                                >
                                    Forget password?
                                </span>
                            </label>
                        </div>
                        <div className="form-control w-full max-w-xs">
                            {/* <input type="submit" className='w-full btn bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white' value='Login' disabled={loginDisabled} /> */}
                            <input type="submit" className='w-full btn bg-transparent border-2 border-[#3B82F6] text-black font-bold hover:bg-[#3B82F6] hover:text-white' value='Login' />
                        </div>
                    </form>

                    <p className='w-full max-w-xs pt-3 text-center'>
                        <span>New Here?</span> <Link className='text-blue-600  hover:link' to='/registration'>Create an Account</Link>
                    </p>

                    {/* <div className='w-full max-w-xs'>
                        <SocialLogin />
                    </div> */}

                </div>
            </div>
        </div>
    );
};

export default Login;