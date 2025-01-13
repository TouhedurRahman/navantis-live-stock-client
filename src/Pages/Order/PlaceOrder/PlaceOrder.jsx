import React from 'react';
import { useForm } from 'react-hook-form';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import usePharmacies from '../../../Hooks/usePharmacies';

const PlaceOrder = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [pharmacies] = usePharmacies();

    return (
        <div>
            <PageTitle from={"Order"} to={"Place order"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Make order</h1>
                <hr className='text-center border border-gray-500 mb-5' />
            </div>
        </div>
    );
};

export default PlaceOrder;