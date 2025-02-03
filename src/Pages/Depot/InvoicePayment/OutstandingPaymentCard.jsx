import React from 'react';
import { MdPrint } from 'react-icons/md';

const OutstandingPaymentCard = ({ idx, order, refetch }) => {
    const handlePrint = () => {
        console.log("Remove product:", product._id);
        refetch();
    };

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td>
                    <div className="text-center">{order.invoice}</div>
                </td>
                <td>
                    <div className="text-center">
                        {new Date(order.date).toISOString().split('T')[0].split('-').reverse().join('-')}
                    </div>
                </td>
                <td className='text-left'>
                    {order.orderedBy}
                </td>
                <td className='text-left'>
                    {order.pharmacy}
                </td>
                <td className='text-right'>
                    {order.totalProduct}
                </td>
                <td className='text-right'>
                    {order.totalUnit}
                </td>
                <td className='text-right'>
                    {(order.totalPrice).toLocaleString('en-IN')}/-
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={handlePrint}
                            title="Remove order from warehouse"
                            className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                        >
                            <MdPrint className="text-green-500" />
                        </button>
                    </div>
                </th>
            </tr>
        </>
    );
};

export default OutstandingPaymentCard;