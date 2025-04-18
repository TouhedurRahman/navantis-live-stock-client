import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FaEye } from "react-icons/fa";
import { FcExpired } from 'react-icons/fc';
import Swal from 'sweetalert2';
import DepotDetailsModal from '../../../Components/DepotDetailsModal/DepotDetailsModal';
import useApiConfig from '../../../Hooks/useApiConfig';

const DepotProductCard = ({ idx, product, refetch }) => {
    const baseUrl = useApiConfig();

    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const totalTradePrice = product.tradePrice * product.totalQuantity;

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const depotExpiredProductMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                productName: product.productName,
                netWeight: product.netWeight,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.totalQuantity),
                status: "pending",
                date: getTodayDate()
            };

            const response = await axios.post(`${baseUrl}/expire-request`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock out from warehouse:", error);
        },
    });

    const deleteDepotExpProductMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/depot-product/${product._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating product to depot:", error);
        },
    });

    const handleExpired = () => {
        Swal.fire({
            title: "Products are expired?",
            text: "Stock out from depot. You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, stock out!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        depotExpiredProductMutation.mutateAsync(),
                        deleteDepotExpProductMutation.mutateAsync()
                    ]);

                    refetch();

                    Swal.fire({
                        title: "Success!",
                        text: "Expired product added.",
                        icon: "success",
                        confirmButtonColor: "#3B82F6"
                    });
                } catch (error) {
                    console.error("Error adding product:", error);

                    Swal.fire({
                        title: "Error!",
                        text: "Failed to stock out the product. Please try again.",
                        icon: "error",
                        confirmButtonColor: "#d33"
                    });
                }
            }
        });
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
                <td>
                    {product.netWeight}
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
                            onClick={handleExpired}
                            title="Expired product"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FcExpired className="text-red-500" />
                        </button>
                    </div>
                </th>
            </tr>

            {/* Modal */}
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