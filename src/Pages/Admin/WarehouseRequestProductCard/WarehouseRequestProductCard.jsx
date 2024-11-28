import { useState } from 'react';
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import WarehouseDetailsModal from '../../../Components/WarehouseDetailsModal/WarehouseDetailsModal';

const WarehouseRequestProductCard = ({ idx, product, refetch }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    // const totaltActualPrice = product.actualPrice * product.totalQuantity;
    // const totalTradePrice = product.tradePrice * product.totalQuantity;

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
                    {product.orderQuantity}
                </td>
                <td className='text-center'>
                    {product.totalQuantity}
                </td>
                <td className='text-center'>
                    {(product.orderQuantity) - (product.totalQuantity)}
                </td>
                <td className='text-center'>
                    <button
                        onClick={() => setdetailsModalOpen(true)}
                        title="Details"
                        className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                    >
                        <FaEye className="text-orange-500" />
                    </button>
                </td>
                <td className='text-center'>
                    <button
                        onClick={handleRemove}
                        title="Remove product from warehouse"
                        className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                    >
                        <FaCheck className="text-green-500" />
                    </button>
                </td>
                <td className='text-center'>
                    <button
                        onClick={handleRemove}
                        title="Remove product from warehouse"
                        className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                    >
                        <FaTimes className="text-red-500" />
                    </button>
                </td>
            </tr >

            {/* Modals for different operations */}
            {
                isdetailsModalOpen && (
                    <WarehouseDetailsModal
                        isOpen={isdetailsModalOpen}
                        onClose={() => setdetailsModalOpen(false)}
                        product={product}
                        refetch={refetch}
                    />
                )
            }
        </>
    );
};

export default WarehouseRequestProductCard;
