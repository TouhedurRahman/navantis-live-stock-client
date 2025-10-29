import PageTitle from '../../../Components/PageTitle/PageTitle';
import useSingleUser from '../../../Hooks/useSingleUser';
import FieldEmployees from '../../Dashboard/FieldEmployees/FieldEmployees';

const Home = () => {
    const [singleUser] = useSingleUser();

    return (
        <div>
            <div>
                <PageTitle
                    from={"Account"}
                    to={"Dashboard"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">My dashboard</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                <div>
                    {
                        singleUser.base !== "Field"
                            ?
                            <>
                                <p className="text-gray-600 font-mono font-extrabold text-center mb-6">
                                    Comming soon...
                                </p>
                            </>
                            :
                            <>
                                <FieldEmployees />
                            </>
                    }
                </div>
            </div>
        </div>
    );
};

export default Home;