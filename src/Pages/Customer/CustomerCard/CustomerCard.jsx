import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const CustomerCard = ({ idx, customer, refetch }) => {
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);

    const deleteCustomerMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`http://localhost:5000/customer/${customer._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error delete customer:", error);
        }
    });

    const handleRemove = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        deleteCustomerMutation.mutateAsync(),
                    ]);

                    refetch();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Customer successfully deleted.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "Faild to delete customer",
                        showConfirmButton: false,
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
                <td className='text-center'>
                    {customer.customerId}
                </td>
                <td>
                    {customer.customerName}
                </td>
                <td>
                    {customer.address}
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            // onClick={() => setdetailsModalOpen(true)}
                            title="Customer Details"
                            className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                        >
                            <FaEye className="text-orange-500" />
                        </button>
                        <Link
                            to={`/update-customer/${customer._id}`}
                            title="Edit/update customer"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaEdit className="text-yellow-500" />
                        </Link>
                        <button
                            onClick={handleRemove}
                            title="Remove customer"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTrashAlt className="text-red-500" />
                        </button>
                    </div>
                </th>
            </tr>
        </>
    );
};

export default CustomerCard;