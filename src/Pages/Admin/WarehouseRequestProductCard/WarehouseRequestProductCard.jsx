import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import WarehouseDetailsModal from '../../../Components/WarehouseDetailsModal/WarehouseDetailsModal';

const WarehouseRequestProductCard = ({ idx, product, refetch }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const reqDeniedMutation = useMutation({
        mutationFn: async () => {
            const updatedProduct = {
                ...product,
                status: "pending",
            };
            const response = await axios.patch(`http://localhost:5000/wh-req/${product._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error denied stock-in:", error);
        },
    });

    const handleDeny = () => {
        Swal.fire({
            title: "Sure to denied stock?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, denied!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        reqDeniedMutation.mutateAsync(),
                    ]);

                    refetch();

                    Swal.fire({
                        title: "Success!",
                        text: "Request Denied.",
                        icon: "success",
                        confirmButtonColor: "#3B82F6"
                    });
                } catch (error) {
                    // console.error("Error adding product:", error);
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
                        // onClick={handleRemove}
                        title="Remove product from warehouse"
                        className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                    >
                        <FaCheck className="text-green-500" />
                    </button>
                </td>
                <td className='text-center'>
                    <button
                        onClick={handleDeny}
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
