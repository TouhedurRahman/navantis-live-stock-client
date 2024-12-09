import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import WarehouseDetailsModal from '../../../Components/WarehouseDetailsModal/WarehouseDetailsModal';
import useDepotProducts from '../../../Hooks/useDepotProducts';
import useWhProducts from '../../../Hooks/useWhProducts';

const DepotReqProductCard = ({ idx, product, refetch }) => {
    const [whProducts, whProductsLoading] = useWhProducts();
    const [depotProducts] = useDepotProducts();
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const productQinWarehouse = whProducts
        .filter(product => product.productName === product.productName)
        .reduce((sum, product) => sum + product.totalQuantity, 0) || 0;

    const productQinDepot = depotProducts
        .filter(product => product.productName === product.productName)
        .reduce((sum, product) => sum + product.totalQuantity, 0) || 0;

    const deniedDptReqMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`http://localhost:5000/depot-request/${product._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Delete damage request:", error);
        },
    });

    const handleDeny = () => {
        Swal.fire({
            title: "Sure to denied request?",
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
                        deniedDptReqMutation.mutateAsync(),
                    ]);

                    refetch();

                    Swal.fire({
                        title: "Success!",
                        text: "Request Denied.",
                        icon: "success",
                        showConfirmButton: false,
                        confirmButtonColor: "#3B82F6",
                        timer: 1500
                    });
                } catch (error) {
                    // console.error("Error adding product:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to denied request. Please try again.",
                        icon: "error",
                        showConfirmButton: false,
                        confirmButtonColor: "#d33",
                        timer: 1500
                    });
                }
            }
        });
    };

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td>
                    <div className="font-bold">{product.productName}</div>
                </td>
                <td className='text-center'>
                    {productQinWarehouse}
                </td>
                <td className='text-center'>
                    {productQinDepot}
                </td>
                <td className='text-center'>
                    {product.requestedQuantity}
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
                        // onClick={ }
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

            {/* Details Modals */}
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

export default DepotReqProductCard;