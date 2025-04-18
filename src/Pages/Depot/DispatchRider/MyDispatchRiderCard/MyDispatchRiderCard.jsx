import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useApiConfig from '../../../../Hooks/useApiConfig';

const MyDispatchRiderCard = ({ idx, rider, refetch }) => {
    const baseUrl = useApiConfig();

    const deleteRiderMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.delete(`${baseUrl}/rider/${rider._id}`);
            return response.data;
        },
        onError: (error) => {
            console.error("Error delete rider:", error);
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
                        deleteRiderMutation.mutateAsync(),
                    ]);

                    refetch();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Rider successfully deleted.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "Faild to delete rider",
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
                    {rider.riderId}
                </td>
                <td>
                    {rider.name}
                </td>
                <td>
                    {rider.mobile}
                </td>
                <td>
                    {rider.email}
                </td>
                <td>
                    {rider.nidl}
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <Link
                            to={`/update-rider/${rider._id}`}
                            title="Edit/update rider"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaEdit className="text-yellow-500" />
                        </Link>
                        <button
                            onClick={handleRemove}
                            title="Remove rider"
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

export default MyDispatchRiderCard;