import axios from 'axios';
import React, { useState } from 'react';
import { MdPrint } from 'react-icons/md';
import Swal from 'sweetalert2';
import useReturns from '../../../../Hooks/useReturns';

const OrderInvoiceCard = ({ idx, order, refetch }) => {
    const [returns] = useReturns();

    const [showModal, setShowModal] = useState(false);
    const [deliveryManName, setDeliveryManName] = useState("");

    const adjustPayments = returns.filter(adReturn =>
        adReturn.pharmacy === order.pharmacy
        &&
        adReturn.status === 'pending'
    );

    const totalAdjustedPrice = adjustPayments.reduce((acc, sum) => acc + sum.totalPrice, 0) || 0;
    // console.log(totalAdjustedPrice);

    const printInvoice = (order) => {
        const printContent = `
            <div>
                <h1>Order Invoice</h1>
                <p><strong>Invoice No:</strong> ${order.invoice}</p>
                <p><strong>Customer Name:</strong> ${order.orderedBy}</p>
                <p><strong>Pharmacy:</strong> ${order.pharmacy}</p>
                <p><strong>Delivery Man:</strong> ${order.deliveryManName || 'N/A'}</p>
            </div>
        `;

        const printWindow = window.open('', '_blank', 'width=600,height=400');
        printWindow.document.write(`
            <html>
                <head>
                <title>Print Invoice</title>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrint = (data) => {
        if (!deliveryManName.trim()) {
            Swal.fire("Warning", "Please provide a Delivery Man name.", "warning");
            return;
        }

        const { _id, ...orderData } = data;
        const updatedOrder = {
            ...orderData,
            adjustedPrice: Number(totalAdjustedPrice),
            totalPayable: Number(orderData.totalPayable - totalAdjustedPrice),
            due: Number(orderData.totalPayable - totalAdjustedPrice),
            status: 'due',
            deliveryMan: deliveryManName,
        };

        printInvoice(updatedOrder);

        axios.patch(`http://localhost:5000/order/${_id}`, updatedOrder)
            .then(response => {
                if (response.data.modifiedCount > 0) {
                    refetch();
                    setDeliveryManName("");
                    setShowModal(false);
                    Swal.fire({
                        title: "Success!",
                        text: "Products successfully delivered.",
                        icon: "success",
                        showConfirmButton: false,
                        confirmButtonColor: "#3B82F6",
                        timer: 1500
                    });
                }
            })
            .catch(error => {
                Swal.fire("Error", "Failed to process the delivery update.", "error");
                console.error(error);
            });
    };

    return (
        <>
            <tr>
                <td className='text-center'>{idx}</td>
                <td>
                    <div className="text-center">{order.invoice}</div>
                </td>
                <td>
                    <div className="text-center">
                        {new Date(order.date).toISOString().split('T')[0].split('-').reverse().join('-')}
                    </div>
                </td>
                <td className='text-left'>{order.orderedBy}</td>
                <td className='text-left'>{order.pharmacy}</td>
                <td className='text-right'>{order.totalProduct}</td>
                <td className='text-right'>{order.totalUnit}</td>
                <td className='text-right'>{(order.totalPayable).toLocaleString('en-IN')}/-</td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={() => setShowModal(true)}
                            title="Assign Delivery Man and Print Invoice"
                            className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                        >
                            <MdPrint className="text-green-500" />
                        </button>
                    </div>
                </th>
            </tr>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Assign Delivery Man</h2>
                        <input
                            type="text"
                            value={deliveryManName}
                            onChange={(e) => setDeliveryManName(e.target.value)}
                            placeholder="Enter Delivery Man Name"
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePrint(order)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderInvoiceCard;