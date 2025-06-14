import { useEffect, useState } from "react";

const MPOStatementReport = ({ reportType, filteredOrders = [], orderReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
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
                ${reportType === "Customer wise MPO Statement"
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

        const groupedOrders = {};

        orders.forEach(order => {
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const mpo = order?.orderedBy || "Unknown MPO";
            const soldAmount = Number(order.soldAmount || 0);
            const paidAmount = Number(order.paid || 0);
            const dueAmount = Number(order.due || 0);

            if (!groupedOrders[areaManager]) {
                groupedOrders[areaManager] = {};
            }

            if (!groupedOrders[areaManager][mpo]) {
                groupedOrders[areaManager][mpo] = {
                    sold: 0,
                    paid: 0,
                    due: 0,
                };
            }

            groupedOrders[areaManager][mpo].sold += soldAmount;
            groupedOrders[areaManager][mpo].paid += paidAmount;
            groupedOrders[areaManager][mpo].due += dueAmount;
        });

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
        let grandPaidTotal = 0;
        let grandDueTotal = 0;

        const groupedHTML = Object.entries(groupedOrders).map(([areaManager, mpoList]) => {
            const areaGrossTotal = Object.values(mpoList).reduce((sum, o) => sum + o.sold, 0);
            const areaReturnTotal = Object.entries(mpoList).reduce((acc, [mpo]) => acc + (groupedReturns[areaManager]?.[mpo] || 0), 0);
            const areaNetTotal = areaGrossTotal - areaReturnTotal;
            const areaPaidTotal = Object.values(mpoList).reduce((sum, o) => sum + o.paid, 0);
            const areaDueTotal = Object.values(mpoList).reduce((sum, o) => sum + o.due, 0);

            grandGrossTotal += areaGrossTotal;
            grandReturnTotal += areaReturnTotal;
            grandNetTotal += areaNetTotal;
            grandPaidTotal += areaPaidTotal;
            grandDueTotal += areaDueTotal;

            return `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 13%;">Territory</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left;">Order by</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%">
                                Sales
                            </th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%">
                                Sales Return
                            </th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%">
                                Net Sales
                            </th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%">
                                Collection
                            </th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%">
                                Due
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="1" style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #e9f5ff;">
                                ${orders.find(order => order.areaManager === areaManager)?.parentTerritory || "Unknown Territory"}
                            </td>
                            <td colspan="6" style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #e9f5ff;">
                                Area Manager: ${areaManager}
                            </td>
                        </tr>
                        ${Object.entries(mpoList).map(([mpoName, data]) => {
                const returnAmount = groupedReturns[areaManager]?.[mpoName] || 0;
                const netAmount = data.sold - returnAmount;
                const territory = orders.find(o => o.orderedBy === mpoName && o.areaManager === areaManager)?.territory || "Unknown Territory";

                return `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ccc;">${territory}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc;">${mpoName}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${data.sold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${data.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${data.due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            `;
            }).join('')}
                        <tr style="background-color: #f9f9f9; font-weight: bold;">
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">
                                ${orders.find(order => order.areaManager === areaManager)?.parentTerritory || "Unknown Territory"}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">
                                Area Totals
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
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9;">
                                ${areaPaidTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9;">
                                ${areaDueTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                        <td style="padding: 8px; border: 1px solid #aaa;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 12%;">
                            ${grandGrossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 12%;">
                            ${grandReturnTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 12%;">
                            ${grandNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 12%;">
                            ${grandPaidTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 12%;">
                            ${grandDueTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    <title>MPO Statement</title>
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

export default MPOStatementReport;