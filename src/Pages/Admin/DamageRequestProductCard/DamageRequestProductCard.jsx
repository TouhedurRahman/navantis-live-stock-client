import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import WarehouseDetailsModal from '../../../Components/WarehouseDetailsModal/WarehouseDetailsModal';
import useApiConfig from '../../../Hooks/useApiConfig';
import useAuth from '../../../Hooks/useAuth';

const DamageRequestProductCard = ({ idx, product, refetch }) => {
    const { user } = useAuth();
    const baseUrl = useApiConfig();

    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const whDamagedProductMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                ...product,
                status: "approved",
            };

            const response = await axios.post(`${baseUrl}/damaged-in-wh`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock damage:", error);
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: async () => {
            const updatedProduct = {
                productName: product.productName,
                netWeight: product.netWeight,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.totalQuantity) - Number(product.damageQuantity)
            };

            const response = await axios.patch(`${baseUrl}/wh-product/${product._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating product to warehouse:", error);
        },
    });

    const deniedDamagedProductMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/damaged-in-wh/${product._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Delete damage request:", error);
        },
    });

    const whSoutProductMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                productName: product.productName,
                netWeight: product.netWeight,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.damageQuantity),
                date: getTodayDate(),
                addedby: user?.displayName || "Navantis Pharma Limited",
                addedemail: user?.email || "info@navantispharma.com"
            };

            const response = await axios.post(`${baseUrl}/stock-out-wh`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock out from warehouse:", error);
        },
    });

    const addDamagedExpiredMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                productName: product.productName,
                netWeight: product.netWeight,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.damageQuantity),
                status: 'damaged',
                date: getTodayDate(),
                addedby: user?.displayName || "Navantis Pharma Limited",
                addedemail: user?.email || "info@navantispharma.com"
            };

            const response = await axios.post(`${baseUrl}/damaged-expired`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock damaged products:", error);
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
                        whDamagedProductMutation.mutateAsync(),
                        updateProductMutation.mutateAsync(),
                        whSoutProductMutation.mutateAsync(),
                        addDamagedExpiredMutation.mutateAsync()
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
