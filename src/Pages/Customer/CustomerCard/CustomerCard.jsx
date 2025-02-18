import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const CustomerCard = ({ idx, customer, refetch }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const handleRemove = () => {
        console.log("Remove product:", product._id);
    };

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td className='text-center'>
                    {customer.customerId}
                </td>
                <td>
                    {customer.customerName}
                </td>
                <td>
                    {customer.address}
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            // onClick={() => setdetailsModalOpen(true)}
                            title="Customer Details"
                            className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                        >
                            <FaEye className="text-orange-500" />
                        </button>
                        <Link
                            to={`/update-customer/${customer._id}`}
                            title="Edit/update customer"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaEdit className="text-yellow-500" />
                        </Link>
                        <button
                            onClick={handleRemove}
                            title="Remove customer"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTrashAlt className="text-red-500" />
                        </button>
                    </div>
                </th>
            </tr>
        </>
    );
};

export default CustomerCard;