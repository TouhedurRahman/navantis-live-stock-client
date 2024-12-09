import React from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from "react-icons/fa";

const DepotReqVaAModal = ({ isOpen, onClose, product, productQinWarehouse, productQinDepot, refetch }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    /* const whDamagedProductMutation = useMutation({
        mutationFn: async (data) => {
            const newProduct = {
                productName: product.productName,
                productCode: product.productCode,
                batch: product.batch,
                expire: product.expire,
                actualPrice: Number(product.actualPrice),
                tradePrice: Number(product.tradePrice),
                totalQuantity: Number(product.totalQuantity),
                damageQuantity: Number(data.quantity),
                date: data.date,
                remarks: data.remarks,
                status: "pending",
                addedby: product.addedby,
                addedemail: product.addedemail
            };

            const response = await axios.post('http://localhost:5000/damaged-in-wh', newProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock out from warehouse:", error);
        },
    }); */

    const onSubmit = async (data) => {
        try {
            /* await Promise.all([
                whDamagedProductMutation.mutateAsync(data)
            ]); */

            reset();
            alert('Damaged product added!');
            refetch();
            onClose();
            window.location.reload();
            reset();
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to stock in.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
                className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5"
                style={{ maxHeight: '90%' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-semibold">Damaged Product</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <FaTimes className="text-gray-500 hover:text-red-500" size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {/* Product Name and Code */}
                    <div className="bg-white p-6 rounded-lg shadow-lg transform transition duration-300">
                        <h3 className="text-2xl font-extrabold text-green-900 mb-4 text-center border-b-2 border-green-300 pb-2">
                            {product.productName}
                        </h3>
                        <div className="grid grid-cols-2 gap-6 items-center">
                            {/* Total Unit */}
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <p className="text-sm font-medium text-green-700 uppercase">Available in <br /> Warehouse</p>
                                <p className="text-3xl font-extrabold mt-2">{productQinWarehouse}</p>
                            </div>
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <p className="text-sm font-medium text-green-700 uppercase">Available in <br /> Depot</p>
                                <p className="text-3xl font-extrabold mt-2">{productQinDepot}</p>
                            </div>
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <p className="text-sm font-medium text-green-700 uppercase">Requested <br /> Quantity</p>
                                <p className="text-3xl font-extrabold mt-2">{product.requestedQuantity}</p>
                            </div>
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <p className="text-sm font-medium text-green-700 uppercase">Last Month <br /> Sale</p>
                                <p className="text-3xl font-extrabold mt-2">00</p>
                            </div>
                        </div>
                    </div>
                    {/* update input section */}
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700">
                                Approved Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                {...register('quantity', { required: "Quantity is required", min: 0 })}
                                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter approved quantity for depot"
                                onWheel={(e) => e.target.blur()}
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 mx-auto py-2 text-white rounded-md bg-green-500 hover:bg-green-600"
                        >
                            Approved
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                            onClick={() => {
                                onClose();
                                reset();
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepotReqVaAModal;