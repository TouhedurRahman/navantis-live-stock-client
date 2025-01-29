import React from 'react';
import PageTitle from '../../../../Components/PageTitle/PageTitle';

const InvoicePayment = () => {
    return (
        <>
            <div>
                <PageTitle from={"Depot"} to={"Invoice & payment"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Invoice and Payment</h1>
                    <hr className="text-center border border-gray-500 mb-5" />
                </div>

                {/* Order List */}
                <div className="px-6">

                </div>
            </div>
        </>
    );
};

export default InvoicePayment;