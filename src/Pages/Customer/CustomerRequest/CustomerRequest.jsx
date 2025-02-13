import React from 'react';
import Loader from '../../../Components/Loader/Loader';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useCustomer from '../../../Hooks/useCustomer';

const CustomerRequest = () => {
    const [customers, loading, refetch] = useCustomer();
    const pendingCustomers = customers.filter(customer => customer.status === 'pending');

    return (
        <div>
            <PageTitle
                from={"Customer"}
                to={"Customer request"}
            />
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Request to approve customer(s)</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                {
                    loading
                        ?
                        <>
                            <Loader />
                        </>
                        :
                        <>

                        </>
                }
            </div>
        </div>
    );
};

export default CustomerRequest;