import axios from 'axios';
import React from 'react';
import { MdPrint } from 'react-icons/md';

const OrderInvoiceCard = ({ idx, order, refetch }) => {
    const printInvoice = (order) => {
        const printContent = `
                <div>
                    <h1>Order Invoice</h1>
                    <p><strong>Invoice No:</strong> ${order.invoice}</p>
                    <p><strong>Customer Name:</strong> ${order.orderedBy}</p>
                    <p><strong>Pharmacy:</strong> ${order.pharmacy}</p>
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
        const { _id, ...orderData } = data;

        const updatedOrder = {
            ...orderData,
            status: 'due'
        };

        printInvoice(updatedOrder);

        axios.patch(`http://localhost:5000/order/${_id}`, updatedOrder)
            .then(response => {
                if (response.data.modifiedCount > 0) {
                    refetch();
                    setInvoiceNumber("");
                    setPaymentAmount("");
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
                Swal.fire("Error", "Failed to process the payment.", "error");
                console.error(error);
            });
    };

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td>
                    <div className="text-center">{order.invoice}</div>
                </td>
                <td>
                    <div className="text-center">
                        {new Date(order.date).toISOString().split('T')[0].split('-').reverse().join('-')}
                    </div>
                </td>
                <td className='text-left'>
                    {order.orderedBy}
                </td>
                <td className='text-left'>
                    {order.pharmacy}
                </td>
                <td className='text-right'>
                    {order.totalProduct}
                </td>
                <td className='text-right'>
                    {order.totalUnit}
                </td>
                <td className='text-right'>
                    {(order.totalPrice).toLocaleString('en-IN')}/-
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={() => handlePrint(order)}
                            title="Remove order from warehouse"
                            className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                        >
                            <MdPrint className="text-green-500" />
                        </button>
                    </div>
                </th>
            </tr>
        </>
    );
};

export default OrderInvoiceCard;