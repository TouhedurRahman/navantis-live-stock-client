import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import DepotReqVaAModal from '../../../Components/DepotReqVaAModal/DepotReqVaAModal';
import useApiConfig from '../../../Hooks/useApiConfig';

const DepotReqProductCard = ({ idx, product, refetch, whProducts, depotProducts, orders }) => {
    const baseUrl = useApiConfig();

    const [isapproveModalOpen, setapproveModalOpen] = useState(false);

    const productQinWarehouse = whProducts
        .filter(whProduct =>
            whProduct.productName === product.productName
            &&
            whProduct.netWeight === product.netWeight
        )
        .reduce((sum, whProduct) => sum + whProduct.totalQuantity, 0) || 0;

    const productQinDepot = depotProducts
        .filter(depotProduct =>
            depotProduct.productName === product.productName
            &&
            depotProduct.netWeight === product.netWeight
        )
        .reduce((sum, depotProduct) => sum + depotProduct.totalQuantity, 0) || 0;

    const getLastMonthSales = (pname, netWeight) => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        return orders
            .filter(order => new Date(order.date) >= oneMonthAgo)
            .flatMap(order => order.products)
            .filter(product => product.name === pname && product.netWeight === netWeight)
            .reduce((total, product) => total + product.quantity, 0);
    };

    const lastMonthSales = getLastMonthSales(product.productName, product.netWeight);

    const deniedDptReqMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/depot-request/${product._id}`);
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
                    {new Date(product.requestedDate).toISOString().split('T')[0].split('-').reverse().join('-')}
                </td>
                <td className='text-center'>
                    <button
                        onClick={() => setapproveModalOpen(true)}
                        title="Details"
                        className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                    >
                        <FaEye className="text-orange-500" />
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
                isapproveModalOpen && (
                    <DepotReqVaAModal
                        isOpen={isapproveModalOpen}
                        onClose={() => setapproveModalOpen(false)}
                        product={product}
                        productQinWarehouse={productQinWarehouse}
                        productQinDepot={productQinDepot}
                        lastMonthSales={lastMonthSales}
                        refetch={refetch}
                    />
                )
            }
        </>
    );
};

export default DepotReqProductCard;