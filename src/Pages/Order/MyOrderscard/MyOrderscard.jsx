import React from 'react';
import { FaEye, FaTrashAlt } from 'react-icons/fa';

const MyOrderscard = ({ idx, myOrder, refetch }) => {
    return (
        <>
            <tr>
                <td className="text-center">{idx}</td>
                <td>
                    <div className="font-bold">{myOrder.pharmacy}</div>
                    <div className="font-medium text-gray-400">{myOrder.pharmacyId}</div>
                </td>
                <td className='text-right'>{myOrder.totalUnit}</td>
                <td className="text-right">{myOrder.totalPrice}</td>
                <td className="text-center">
                    {new Date(myOrder.date).toISOString().split("T")[0].split("-").reverse().join("-")}
                </td>
                <td className="text-center">
                    <button
                        // onClick={() => setModalOpen(true)}
                        title="Details"
                        className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                    >
                        <FaEye className="text-orange-500" />
                    </button>
                </td>
                {
                    myOrder.status === "pending"
                    &&
                    <td className="text-center">
                        <button
                            // onClick={handleDeny}
                            title="Deny Request"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTrashAlt className="text-red-500" />
                        </button>
                    </td>
                }
            </tr>
        </>
    );
};

export default MyOrderscard;