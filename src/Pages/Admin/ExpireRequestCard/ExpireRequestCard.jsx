import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FaCheck, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import useApiConfig from '../../../Hooks/useApiConfig';
import useAuth from '../../../Hooks/useAuth';

const ExpireRequestCard = ({ idx, product, refetch }) => {
    const { user } = useAuth();
    const baseUrl = useApiConfig();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const addDepotExpiredMutation = useMutation({
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
                date: getTodayDate()
            };

            const response = await axios.post(`${baseUrl}/depot-expired`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error update expired status:", error);
        },
    });

    const addStockOutDepotMutation = useMutation({
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
                date: getTodayDate(),
                addedby: user?.displayName || "Navantis Pharma Limited",
                addedemail: user?.email || "info@navantispharma.com"
            };

            const response = await axios.post(`${baseUrl}/stock-out-depot`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock out depot:", error);
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
                totalQuantity: Number(product.totalQuantity),
                status: 'expired',
                date: getTodayDate(),
                addedby: user?.displayName || "Navantis Pharma Limited",
                addedemail: user?.email || "info@navantispharma.com"
            };

            const response = await axios.post(`${baseUrl}/damaged-expired`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock expired products:", error);
        },
    });

    const deleteExpireRequestMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/expire-request/${product._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Delete expire request:", error);
        },
    });

    const addDepotProductMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                productName: product.productName,
                netWeight: product.netWeight,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.totalQuantity)
            };
            const response = await axios.post(`${baseUrl}/depot-products`, newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding product to depot:", error);
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
                        addDepotExpiredMutation.mutateAsync(),
                        addStockOutDepotMutation.mutateAsync(),
                        addDamagedExpiredMutation.mutateAsync(),
                        deleteExpireRequestMutation.mutateAsync()
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
                        addDepotProductMutation.mutateAsync(),
                        deleteExpireRequestMutation.mutateAsync(),
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
