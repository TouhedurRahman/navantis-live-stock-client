import { useEffect, useState } from "react";

const InvoiceSalesSummaryReport = ({ reportType, filteredOrders = [], orderReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [orders, setOrders] = useState(filteredOrders);
    const [returns, setReturns] = useState(orderReturns);

    useEffect(() => {
        const sortedOrders = [...filteredOrders].sort((a, b) => {
            const getPriority = (territory) => {
                if (territory === "Doctor") return 0;
                if (territory === "Institute") return 1;
                return 2;
            };

            return getPriority(a.territory) - getPriority(b.territory);
        });

        setOrders(sortedOrders);
    }, [filteredOrders]);

    useEffect(() => {
        setReturns(orderReturns);
    }, [orderReturns]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

    const handlePrint = () => {
        const companyHeader = `
            <div>
                <div style="position: relative; text-align: center; margin-bottom: 20px;">
                    <img src='/images/NPL-Updated-Logo.png' alt="Company Logo"
                        style="left: 0; width: 150px; height: auto;" />
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                    <p style="margin: 0; font-size: 10px;">Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.</p>
                    <p style="margin: 0; font-size: 10px;">Hotline: +880 1322-852183</p>
                </div>
                <div style="text-align: left; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>${reportType}</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                </div>
                <div class="mb-1 text-sm text-gray-400 text-right italic">
                    <h3 class="">Printed on ${now}</h3>
                </div>
                ${reportType === "Customer wise Net Sales"
                ?
                `
                <div style="display: flex; flex-direction: column; gap: 2px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">
                    <div class="grid grid-cols-[max-content_15px_auto] text-[11px] gap-y-1">
                        <span class="font-bold">Customer Code</span>
                        <span class="font-bold">:</span>
                        <span>${customerCode}</span>

                        <span class="font-bold">Customer Name</span>
                        <span class="font-bold">:</span>
                        <span>${customerName}</span>

                        <span class="font-bold">Customer Address</span>
                        <span class="font-bold">:</span>
                        <span>${customerAddress}</span>

                        <span class="font-bold">Mobile</span>
                        <span class="font-bold">:</span>
                        <span>+880 ${customerMobile.slice(-10, -6)}-${customerMobile.slice(-6)}</span>
                    </div>
                </div>
                `
                :
                ""
            }
            </div>
        `;

        const invoices = {};
        orders.forEach(order => {
            if (!order.invoice) return;
            if (!invoices[order.invoice]) {
                invoices[order.invoice] = {
                    orderDate: order.date,
                    soldAmount: order.soldAmount || order.totalPrice,
                    totalPayable: order.totalPayable || 0,
                    paid: (order.totalPayable || 0) - (order.due || 0),
                    due: order.due || 0,
                    returnAmount: 0,
                };
            }
        });

        returns.forEach(ret => {
            if (!ret.invoice || !invoices[ret.invoice]) return;
            const totalReturn = ret.products.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
            invoices[ret.invoice].returnAmount += totalReturn;
        });

        let grandSold = 0, grandReturn = 0, grandPayable = 0, grandPaid = 0, grandDue = 0;

        const groupedHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="padding: 8px; border: 1px solid #aaa;">Invoice No.</th>
                        <th style="padding: 8px; border: 1px solid #aaa;">Order Date</th>
                        <th style="padding: 8px; border: 1px solid #aaa; text-align: right;">Sales Amount</th>
                        <th style="padding: 8px; border: 1px solid #aaa; text-align: right;">Return Amount</th>
                        <th style="padding: 8px; border: 1px solid #aaa; text-align: right;">Net Sales</th>
                        <th style="padding: 8px; border: 1px solid #aaa; text-align: right;">Paid</th>
                        <th style="padding: 8px; border: 1px solid #aaa; text-align: right;">Due</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(invoices).map(([invoice, data]) => {
            grandSold += data.soldAmount;
            grandReturn += data.returnAmount;
            grandPayable += data.totalPayable;
            grandPaid += data.paid;
            grandDue += data.due;
            return `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${invoice}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${data.orderDate}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.soldAmount.toLocaleString()}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.returnAmount.toLocaleString()}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.totalPayable.toLocaleString()}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.paid.toLocaleString()}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.due.toLocaleString()}</td>
                        </tr>`;
        }).join('')}
                </tbody>
            </table>
        `;

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tbody>
                    <tr style="background-color: #d9edf7; font-weight: bold;">
                        <td colspan="2" style="padding: 8px; border: 1px solid #aaa;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right;">${grandSold.toLocaleString()}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right;">${grandReturn.toLocaleString()}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right;">${grandPayable.toLocaleString()}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right;">${grandPaid.toLocaleString()}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right;">${grandDue.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        `;

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map(
            (style) => style.outerHTML
        ).join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>Net Sales</title>
                    ${styles}
                    <style>
                        @media print {
                            @page {
                                size: A4;
                                margin: 5mm;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                font-family: Arial, sans-serif;
                                position: relative;
                            }
                            th, td {
                                font-size: 10px;
                            }
                            thead {
                                display: table-header-group;
                            }
                        }
                    </style>
                </head>
                <body>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <td colspan="100%">
                                    ${companyHeader}
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="100%">
                                    ${groupedHTML}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="100%">
                                    ${finalTotalHTML}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            </html>
        `);

        newWindow.document.close();
        newWindow.onload = () => {
            setTimeout(() => {
                newWindow.focus();
                newWindow.print();
            }, 500);
        };
    };

    return handlePrint;
};

export default InvoiceSalesSummaryReport;