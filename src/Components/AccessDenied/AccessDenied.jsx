import { MdOutlineVpnLock } from "react-icons/md";
import useLogOut from "../../Hooks/useLogOut";

const AccessDenied = () => {
    const handleLogout = useLogOut();

    return (
        <div className='py-20 justify-center flex items-center'>
            <div className="hero-content mt-10 mx-3 shadow-2xl shadow-orange-100 border-2 border-[#3B82F6] rounded-lg flex-col lg:flex-row">
                <div className="card shrink-0 w-full max-w-sm p-5">
                    <h2 className='text-2xl flex justify-center items-center font-bold'>
                        <MdOutlineVpnLock className='mr-2 text-[#3B82F6]' /> Access Denied
                    </h2>
                    <p className="text-center mt-4">
                        You do not have the necessary permissions to access this page. If you already register, please wait for the admin approval.
                    </p>
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

export default AccessDenied;