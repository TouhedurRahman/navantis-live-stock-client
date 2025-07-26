import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import useApiConfig from '../../Hooks/useApiConfig';

const DepotReqVaAModal = ({ isOpen, onClose, product, productQinWarehouse, productQinDepot, lastMonthSales, refetch }) => {
    const baseUrl = useApiConfig();

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const approvedDptReqMutation = useMutation({
        mutationFn: async (data) => {
            const { _id, ...productWithoutId } = product;
            const updatedProduct = {
                ...productWithoutId,
                approvedQuantity: Number(data.quantity),
                approvedDate: getTodayDate(),
                status: "approved"
            };

            const response = await axios.patch(`${baseUrl}/depot-request/${product._id}`, updatedProduct);
            return response.data;
        },
        onError: (error) => {
            console.error("Error stock out from warehouse:", error);
        },
    });

    const onSubmit = async (data) => {
        try {
            await Promise.all([
                approvedDptReqMutation.mutateAsync(data)
            ]);

            reset();
            refetch();
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Depot requested accepted.",
                showConfirmButton: false,
                timer: 1500
            });
            onClose();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Something went wrong. Please try again.",
                showConfirmButton: false,
                timer: 1500
            });
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
                    <h2 className="text-2xl font-semibold">Depot Request</h2>
                    <button onClick={onClose} aria-label="Close modal">
                        <FaTimes className="text-gray-500 hover:text-red-500" size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {/* Product Name and Code */}
                    <div className="bg-white p-6 rounded-lg shadow-lg transform transition duration-300">
                        <h3 className="text-2xl font-extrabold text-green-900 mb-2 text-center border-b-2 border-green-300 pb-2">
                            {product.productName}
                        </h3>
                        <p className=' text-xl font-bold font-sans mb-2 text-center'>{product.netWeight}</p>
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
                                <p className="text-3xl font-extrabold mt-2">{lastMonthSales}</p>
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