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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>MPO wise Net Sales</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                </div>
                <div class="mb-1 text-sm text-gray-400 text-right italic">
                    <h3 class="">Printed on ${now}</h3>
                </div>
            </div>
        `;

        // Step 1: Group by Area Manager → OrderedBy (mpo) → Sum totalPayable
        const groupedOrders = {};

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

        // Step 2: Group returns by Area Manager → OrderedBy (mpo) → Sum totalPrice of returned products
        const groupedReturns = {};

        returns.forEach(ret => {
            const areaManager = ret?.areaManager || "Unknown Area Manager";
            const mpo = ret?.orderedBy || "Unknown MPO";

            const returnTotal = ret.products.reduce((acc, product) => {
                return acc + Number(product.totalPrice || 0);
            }, 0);

            if (!groupedReturns[areaManager]) {
                groupedReturns[areaManager] = {};
            }

            if (!groupedReturns[areaManager][mpo]) {
                groupedReturns[areaManager][mpo] = 0;
            }

            groupedReturns[areaManager][mpo] += returnTotal;
        });

        let grandGrossTotal = 0;
        let grandReturnTotal = 0;
        let grandNetTotal = 0;

        const groupedHTML = Object.entries(groupedOrders).map(([areaManager, mpoList]) => {
            const areaNetTotal = Object.entries(mpoList).reduce((acc, [mpoName, total]) => {
                const returnAmount = groupedReturns[areaManager]?.[mpoName] || 0;
                return acc + (total - returnAmount);
            }, 0);
            grandNetTotal += areaNetTotal;

            const areaGrossTotal = Object.values(mpoList).reduce((a, b) => a + b, 0);
            grandGrossTotal += areaGrossTotal;

            const areaReturnTotal = Object.entries(mpoList).reduce((acc, [mpoName]) => {
                return acc + (groupedReturns[areaManager]?.[mpoName] || 0);
            }, 0);
            grandReturnTotal += areaReturnTotal;

            return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 40%;">Order by</th>
                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%;">Sold Amount</th>
                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%;">Return Amount</th>
                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%;">Net Sales</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="4" style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #e0e0e0;">
                        ${areaManager} (Area Manager)
                    </td>
                </tr>
                ${Object.entries(mpoList).map(([mpoName, grossTotal]) => {
                const returnAmount = groupedReturns[areaManager]?.[mpoName] || 0;
                const netAmount = grossTotal - returnAmount;
                return ` 
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ccc;">${mpoName}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                ${grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                ${returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; font-weight: bold;">
                                ${netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `;
            }).join('')}
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">
                        <strong>Area Totals</strong>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9;">
                        ${areaGrossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9;">
                        ${areaReturnTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9;">
                        ${areaNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                </tr>                
            </tbody>
        </table>
    `;
        }).join('');

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tbody>
                    <tr style="background-color: #d9edf7; font-weight: bold;">
                        <td style="padding: 8px; border: 1px solid #aaa; width: 40%;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">
                            ${grandGrossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">
                            ${grandReturnTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">
                            ${grandNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
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
                            /* body::after {
                                content: "Printed on ${now}";
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                width: 100%;
                                text-align: center;
                                font-size: 12px;
                                color: #555;
                                font-style: italic;
                            } */
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