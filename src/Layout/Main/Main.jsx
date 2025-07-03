import { ToastContainer } from 'react-toastify';
import Loader from '../../Components/Loader/Loader';
// import NonVerified from '../../Components/NonVerified/NonVerified';
import NotAssignedDesignation from '../../Components/NotAssignedDesignation/NotAssignedDesignation';
import useAuth from '../../Hooks/useAuth';
import useSingleUser from '../../Hooks/useSingleUser';
import Navbar from '../../Pages/Shared/Navbar/Navbar';
import Login from '../../Routes/Routes/LoginAndRegistration/Login/Login';

const Main = () => {
    const { user } = useAuth();
    const [singleUser, loadingSingleUser] = useSingleUser();

    const userDesignation = singleUser?.designation ?? null;

    if (!user) {
        return <Login />;
    }

    /* if (!user.emailVerified) {
        return <NonVerified />;
    } */

    return (
        <div className="font-nunito">
            {
                loadingSingleUser
                    ?
                    <>
                        <Loader />
                    </>
                    :
                    <>
                        {
                            userDesignation !== null
                                ?
                                <Navbar />
                                :
                                <NotAssignedDesignation />
                        }
                    </>
            }
            <ToastContainer />
        </div>
    );
};

export default Main;