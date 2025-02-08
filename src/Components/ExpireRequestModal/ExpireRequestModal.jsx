import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
// import './DepotRequestModal.css';

const ExpireRequestModal = ({ isOpen, onClose }) => {
    const { user } = true;
    const whProductsLoading = true;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const onSubmit = async (data) => {
        try {
            await Promise.all([
                // .mutateAsync(data)
            ]);

            reset();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Expire Return added",
                showConfirmButton: false,
                timer: 1500
            });

            window.location.reload();
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Something went wrong!",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSelectedProduct(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div
                // className={`bg-white rounded-lg shadow-lg w-full max-w-lg ${selectedProduct && 'h-4/5'}`}
                className={`bg-white rounded-lg shadow-lg w-full max-w-lg}`}
                style={{ maxHeight: '90%' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Expire Request</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 128px)' }}>
                    {whProductsLoading ? (
                        <p className="text-center text-gray-700">Loading products...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Select Product */}


                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            // disabled={!selectedProduct}
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                    <button
                        className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpireRequestModal;