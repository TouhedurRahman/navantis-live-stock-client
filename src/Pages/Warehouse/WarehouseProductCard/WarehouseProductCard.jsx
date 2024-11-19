import { useState } from 'react';
import { FaSyncAlt, FaBox, FaTruck, FaTimes, FaEye } from "react-icons/fa";
import UpdateProductModal from '../../../Components/UpdateProductModal/UpdateProductModal';
import StockInModal from '../../../Components/StockInModal/StockInModal';
import SendToDepotModal from '../../../Components/SendToDepotModal/SendToDepotModal';
import WarehouseDetailsModal from '../../../Components/WarehouseDetailsModal/WarehouseDetailsModal';

const WarehouseProductCard = ({ idx, product, refetch }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [isStockInModalOpen, setStockInModalOpen] = useState(false);
    const [isSendToDepotModalOpen, setSendToDepotModalOpen] = useState(false);

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
                            onClick={() => setUpdateModalOpen(true)}
                            title="Update product"
                            className="p-2 rounded-[5px] hover:bg-blue-100 focus:outline-none"
                        >
                            <FaSyncAlt className="text-blue-500" />
                        </button>
                        <button
                            onClick={() => setStockInModalOpen(true)}
                            title="Stock In New Quantity"
                            className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                        >
                            <FaBox className="text-green-500" />
                        </button>
                        <button
                            onClick={() => setSendToDepotModalOpen(true)}
                            title="Send product to depot"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaTruck className="text-yellow-500" />
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
                <WarehouseDetailsModal
                    isOpen={isdetailsModalOpen}
                    onClose={() => setdetailsModalOpen(false)}
                    product={product}
                    refetch={refetch}
                />
            )}
            {isUpdateModalOpen && (
                <UpdateProductModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setUpdateModalOpen(false)}
                    product={product}
                    refetch={refetch}
                />
            )}
            {isStockInModalOpen && (
                <StockInModal
                    isOpen={isStockInModalOpen}
                    onClose={() => setStockInModalOpen(false)}
                    product={product}
                    refetch={refetch}
                />
            )}
            {isSendToDepotModalOpen && (
                <SendToDepotModal
                    isOpen={isSendToDepotModalOpen}
                    onClose={() => setSendToDepotModalOpen(false)}
                    product={product}
                    refetch={refetch}
                />
            )}
        </>
    );
};

export default WarehouseProductCard;
