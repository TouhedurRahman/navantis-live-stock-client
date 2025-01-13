import React from 'react';
import { useForm } from 'react-hook-form';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import usePharmacies from '../../../Hooks/usePharmacies';

const PlaceOrder = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [pharmacies] = usePharmacies();

    const onSubmit = (data) => {
        console.log(data);
        reset();
    };

    return (
        <div>
            <PageTitle from={"Order"} to={"Place order"} />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Make order</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0 space-y-4">
                    {/* Date Field */}
                    <div className="flex flex-col">
                        <label className="text-[#6E719A] mb-1 text-sm">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...register("date", { required: "Date is required" })}
                            placeholder="Enter date"
                            className="border-gray-500 bg-white border p-2 text-sm"
                        />
                        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div className="flex flex-col">
                            <label className="text-[#6E719A] mb-1 text-sm">
                                Pharmacy <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('pharmacy', { required: 'Please select a pharmacy' })}
                                className="border-gray-500 bg-white border p-2 text-sm"
                            // disabled={!selectedDate}
                            >
                                <option value="">-- Select a Pharmacy --</option>
                                {pharmacies.map((pharmacy) => (
                                    <option key={pharmacy.id} value={pharmacy.name}>
                                        {pharmacy.name}
                                    </option>
                                ))}
                            </select>
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="bg-blue-500 text-white mt-5 p-2 rounded text-sm">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default PlaceOrder;