import React from 'react';
import { MdPrint } from 'react-icons/md';
import useOrders from '../../../../Hooks/useOrders';

const OrderInvoice = () => {
    const [orders] = useOrders();

    // Filter delivered orders
    const deliveredOrders = orders.filter(order => order.status === 'delivered');

    const handlePrintRow = (order) => {
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

    return (
        <div className="p-4">
            {/* <h1 className="text-2xl font-bold mb-4">Delivered Orders</h1> */}

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="text-center">Invoice No</th>
                            <th>Customer Name</th>
                            <th className='text-left'>Pharmacy</th>
                            <th className='text-right'>Total Product</th>
                            <th className='text-right'>Total Unit</th>
                            <th className='text-right'>Total Payable</th>
                            <th className='text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveredOrders.map(order => (
                            <tr key={order._id} className="text-center">
                                <td className="text-center">{order.invoice}</td>
                                <td className="text-left">{order.orderedBy}</td>
                                <td className="text-left">{order.pharmacy}</td>
                                <td className="text-right">{order.totalProduct}</td>
                                <td className="text-right">{order.totalUnit}</td>
                                <td className="text-right">{(order.totalPrice.toLocaleString('en-IN'))}/-</td>
                                <td className="text-center">
                                    <button
                                        onClick={() => handlePrintRow(order)}
                                        className="px-3 py-1 rounded-lg border-2 hover:border-black focus:outline-none"
                                    >
                                        <MdPrint />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderInvoice;