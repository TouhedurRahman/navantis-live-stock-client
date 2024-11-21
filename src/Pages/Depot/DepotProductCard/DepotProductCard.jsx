import { useState } from 'react';
import { FaTimes, FaEye } from "react-icons/fa";
import DepotDetailsModal from '../../../Components/DepotDetailsModal/DepotDetailsModal';

const DepotProductCard = ({ idx, product, refetch }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    // const totaltActualPrice = product.actualPrice * product.totalQuantity;
    const totalTradePrice = product.tradePrice * product.totalQuantity;

    const handleRemove = () => {
        console.log("Remove product:", product._id);
    };

    return (
        <>
            <tr>
                <td className='flex justify-center items-center'>
                    {idx}
                </td>
                <td>
                    <div className="font-bold">{product.productName}</div>
                </td>
                <td className='text-center'>
                    {product.batch}
                </td>
                <td className='text-center'>
                    {product.expire}
                </td>
                <td className='text-center'>
                    {product.totalQuantity}
                </td>
                <td className='text-right'>
                    {product.tradePrice.toLocaleString('en-IN')}/-
                </td>
                <td className='text-right'>
                    {totalTradePrice.toLocaleString('en-IN')}/-
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={() => setdetailsModalOpen(true)}
                            title="Details"
                            className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                        >
                            <FaEye className="text-orange-500" />
                        </button>
                        <button
                            onClick={handleRemove}
                            title="Remove product from warehouse"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTimes className="text-red-500" />
                        </button>
                    </div>
                </th>
            </tr>

            {/* Modals for different operations */}
            {isdetailsModalOpen && (
                <DepotDetailsModal
                    isOpen={isdetailsModalOpen}
                    onClose={() => setdetailsModalOpen(false)}
                    product={product}
                    refetch={refetch}
                />
            )}
        </>
    );
};

export default DepotProductCard;