import { useEffect, useState } from "react";

const MPOWiseNetSalesReport = ({ filteredOrders = [], orderReturns = [], firstDate, lastDate }) => {
    const [orders, setOrders] = useState(filteredOrders);
    const [returns, setReturns] = useState(orderReturns);

    useEffect(() => {
        setOrders(filteredOrders);
    }, [filteredOrders]);

    useEffect(() => {
        setReturns(orderReturns);
    }, [orderReturns]);

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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>MPO wise Net Sales</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                </div>
            </div>
        `;

        // Step 1: Group by Area Manager → OrderedBy (mpo) → Sum totalPayable
        const groupedOrders = {};
        let grandTotal = 0;

        orders.forEach(order => {
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const mpo = order?.orderedBy || "Unknown MPO";
            const totalPayable = Number(order.totalPayable || 0);

            if (!groupedOrders[areaManager]) {
                groupedOrders[areaManager] = {};
            }

            if (!groupedOrders[areaManager][mpo]) {
                groupedOrders[areaManager][mpo] = 0;
            }

            groupedOrders[areaManager][mpo] += totalPayable;
        });

        const groupedHTML = Object.entries(groupedOrders).map(([areaManager, mpoList]) => {
            const areaTotal = Object.values(mpoList).reduce((acc, total) => acc + total, 0);
            grandTotal += areaTotal;

            return `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; width: 70%;">Order by</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 30%;">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #e0e0e0;">
                                ${areaManager} (Total Sales: ${areaTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                            </td>
                        </tr>
                        ${Object.entries(mpoList).map(([mpoName, total]) => {
                return ` 
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ccc; width: 70%;">${mpoName}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 30%;">
                                        ${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            `;
            }).join('')}
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9; width: 70%;">
                                <strong>Area Total</strong>
                            </td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; width: 30%;">
                                ${areaTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
        }).join('');

        const finalTotalHTML = `
            <div style="text-align: right; font-size: 12px; font-weight: bold; margin-top: 20px;">
                <p>Grand Total: <strong>${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
            </div>
        `;

        const now = new Date().toLocaleString("en-US", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            hour12: true
        });

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map(
            (style) => style.outerHTML
        ).join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>Order Despatch Report</title>
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
                            th, td { font-size: 10px; }
                            body::after {
                                content: "Printed on ${now}";
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                width: 100%;
                                text-align: center;
                                font-size: 12px;
                                color: #555;
                                font-style: italic;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${companyHeader}
                    ${groupedHTML}
                    ${finalTotalHTML}
                </body>
            </html>
        `);

        newWindow.document.close();
        newWindow.print();
    };

    return handlePrint;
};

export default MPOWiseNetSalesReport;