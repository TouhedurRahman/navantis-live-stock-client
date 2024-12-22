import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FaCheck, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';

const ExpireRequestCard = ({ idx, product, refetch }) => {
    const updateExpStatusMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                ...product,
                totalQuantity: 0,
                status: "expired",
            };

            const response = await axios.post('http://localhost:5000/expire-request', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error update expired status:", error);
        },
    });

    const deleteDepotExpProductMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`http://localhost:5000/depot-product/${product.dptProductId}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating product to depot:", error);
        },
    });

    const deniedExpiredProductMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`http://localhost:5000/expire-request/${product._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Delete expire request:", error);
        },
    });

    const handleApproveExpire = () => {
        Swal.fire({
            title: "Sure expired?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, expire!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        updateExpStatusMutation.mutateAsync(),
                        deleteDepotExpProductMutation.mutateAsync()
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
            title: "Sure to denied expire?",
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
                        deniedExpiredProductMutation.mutateAsync(),
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
                    {product.batch}
                </td>
                <td className='text-center'>
                    {product.expire}
                </td>
                <td className='text-center'>
                    {product.totalQuantity}
                </td>
                <td className='text-center'>
                    <button
                        onClick={handleApproveExpire}
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
        </>
    );
};

export default ExpireRequestCard;
