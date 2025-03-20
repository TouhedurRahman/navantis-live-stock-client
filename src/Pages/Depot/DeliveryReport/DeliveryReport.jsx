import React from 'react';
import PageTitle from '../../../Components/PageTitle/PageTitle';

const DeliveryReport = () => {
    return (
        <>
            <div>
                <PageTitle
                    from={"Depot"}
                    to={"Delivery report"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Depot delivery report</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
            </div>
        </>
    );
};

export default DeliveryReport;