import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import WarehouseDetailsModal from '../../../Components/WarehouseDetailsModal/WarehouseDetailsModal';

const WarehouseRequestProductCard = ({ idx, product, refetch, whProducts }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const existingSameBatchProducts = whProducts.filter(
        existingSameBatchProduct =>
            existingSameBatchProduct.productName === product.productName
            &&
            existingSameBatchProduct.batch === product.batch
            &&
            existingSameBatchProduct.expire === product.expire
    );
    const existingSameBatchProductQuantity = existingSameBatchProducts.reduce((sum, product) => sum + product.totalQuantity, 0);

    // console.log("Total Quantity:", existingSameBatchProductQuantity);

    const matchingProducts = whProducts.filter(
        matchingProduct =>
            matchingProduct.productName === product.productName
    );
    const initialQuantity = matchingProducts.reduce((sum, product) => sum + (product.totalQuantity), 0);
    // console.log(initialQuantity);

    const matchingProductName = whProducts.find(
        existingProduct =>
            existingProduct.productName === product.productName
    );
    const initialActualPrice = matchingProductName?.actualPrice ?? null;
    const initialTradePrice = matchingProductName?.tradePrice ?? null;
    // console.log(initialActualPrice, initialTradePrice);

    const addProductMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.totalQuantity)
            };
            const response = await axios.post('http://localhost:5000/wh-products', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding product to warehouse:", error);
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: async () => {
            const updatedProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(existingSameBatchProductQuantity) + Number(product.totalQuantity)
            };

            const response = await axios.patch(`http://localhost:5000/wh-product/${product._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating product to warehouse:", error);
        },
    });

    const addStockMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                boxQuantity: Number(product.boxQuantity),
                productWithBox: Number(product.productWithBox),
                productWithoutBox: Number(product.productWithoutBox),
                totalQuantity: Number(product.totalQuantity),
                date: product.date,
                remarks: product.remarks,
                addedby: product.addedby,
                addedemail: product.addedemail
            };
            const response = await axios.post('http://localhost:5000/stock-in-wh', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding stock-in:", error);
        },
    });

    const addPriceChangeMutation = useMutation({
        mutationFn: async () => {
            const newProduct = {
                productName: product.productName,

                actualPrice: Number(product.actualPrice),
                initialActualPrice: Number(initialActualPrice),

                tradePrice: Number(product.tradePrice),
                initialTradePrice: Number(initialTradePrice),

                initialQuantity: Number(initialQuantity),
                newQuantity: Number(product.totalQuantity),

                date: product.date
            };
            const response = await axios.post('http://localhost:5000/price-update', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error price change:", error);
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (updatedStatus) => {
            const updatedProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,

                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),

                boxQuantity: Number(product.boxQuantity),
                productWithBox: Number(product.productWithBox),
                productWithoutBox: Number(product.productWithoutBox),

                orderQuantity: Number(product.orderQuantity),
                totalQuantity: updatedStatus === "pending" ? Number(product.orderQuantity) : Number(product.totalQuantity),
                missingQuantity: Number(product.missingQuantity),

                orderDate: product.orderDate,
                date: updatedStatus === "pending" ? product.orderDate : product.date,

                remarks: product.remarks,
                status: updatedStatus,

                addedby: product.addedby,
                addedemail: product.addedemail
            };
            const response = await axios.patch(`http://localhost:5000/wh-req/${product._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error denied stock-in:", error);
        },
    });

    const handleWhStockin = () => {
        Swal.fire({
            title: "Sure to stock in warehouse?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, stock in!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    /* if (existingProducts.length === 0) {
                        await Promise.all([
                            updateStatusMutation.mutateAsync("approved"),
                            addProductMutation.mutateAsync(),
                            addStockMutation.mutateAsync()
                        ]);
                    } else {
                        await Promise.all([
                            updateStatusMutation.mutateAsync("approved"),
                            addProductMutation.mutateAsync(),
                            updateProductMutation.mutateAsync(),
                            addStockMutation.mutateAsync()
                        ]);
                    } */

                    const mutations = [
                        updateStatusMutation.mutateAsync("approved"),
                        addProductMutation.mutateAsync(),
                        addStockMutation.mutateAsync(),
                    ];

                    if (matchingProducts.length > 0)
                        mutations.push(updateProductMutation.mutateAsync());


                    if (initialActualPrice !== product.actualPrice || initialTradePrice !== product.tradePrice)
                        mutations.push(addPriceChangeMutation.mutateAsync());

                    await Promise.all(mutations);

                    refetch();

                    Swal.fire({
                        title: "Success!",
                        text: "Stock in successful.",
                        icon: "success",
                        showConfirmButton: false,
                        confirmButtonColor: "#3B82F6",
                        timer: 1500
                    });
                } catch (error) {
                    console.error("Error adding product:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "Faild to Stock in. Please try again.",
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
                        updateStatusMutation.mutateAsync("pending"),
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
                        onClick={handleWhStockin}
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

export default WarehouseRequestProductCard;
