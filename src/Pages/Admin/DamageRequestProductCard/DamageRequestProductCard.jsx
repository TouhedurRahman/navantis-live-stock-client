import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import WarehouseDetailsModal from '../../../Components/WarehouseDetailsModal/WarehouseDetailsModal';

const DamageRequestProductCard = ({ idx, product, refetch, whProducts }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const whDamagedProductMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                ...product,
                status: "approved",
            };

            const response = await axios.post('http://localhost:5000/damaged-in-wh', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock damage:", error);
        },
    });

    const deniedDamagedProductMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                ...product,
                status: "approved",
            };
            const response = await axios.post('http://localhost:5000/damaged-in-wh');
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock damage:", error);
        },
    });

    const handleDamageStock = () => {
        Swal.fire({
            title: "Sure to stock Damae?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, damage!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        whDamagedProductMutation.mutateAsync()
                    ]);

                    refetch();

                    Swal.fire({
                        title: "Success!",
                        text: "Approved damaged product.",
                        icon: "success",
                        showConfirmButton: false,
                        confirmButtonColor: "#3B82F6",
                        timer: 1500
                    });
                } catch (error) {
                    // console.error("Error adding product:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "Faild. Please try again.",
                        icon: "error",
                        showConfirmButton: false,
                        confirmButtonColor: "#d33",
                        timer: 1500
                    });
                }
            }
        });
    };

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
                        deniedDamagedProductMutation.mutateAsync(),
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
                <td className='text-center'>
                    {product.damageQuantity}
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
                        onClick={handleDamageStock}
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

export default DamageRequestProductCard;
