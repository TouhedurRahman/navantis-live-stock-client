import { useEffect, useState } from "react";

const NetSalesReport = ({ reportType, filteredOrders = [], orderReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
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

    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

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

        const groupedOrders = {};

        orders.forEach(order => {
            const parentTerritory = order?.parentTerritory || "Unknown Territory";
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const mpo = order?.orderedBy || "Unknown MPO";

            const soldAmount = Number(order.soldAmount || 0);
            const adjustedPrice = Number(order.adjustedPrice || 0);
            const discountPercent = Number(order.discount || 0);

            const totalProductPrice = order.products.reduce((acc, p) => acc + Number(p.totalPrice || 0), 0);

            const discountAmount = totalProductPrice * (discountPercent / 100);

            const key = `${parentTerritory}___${areaManager}`;

            if (!groupedOrders[key]) groupedOrders[key] = {};
            if (!groupedOrders[key][mpo]) groupedOrders[key][mpo] = {
                soldAmount: 0,
                adjusted: 0,
                discount: 0
            };

            groupedOrders[key][mpo].soldAmount += soldAmount;
            groupedOrders[key][mpo].adjusted += adjustedPrice;
            groupedOrders[key][mpo].discount += discountAmount;
        });

        const groupedReturns = {};

        returns.forEach(ret => {
            const parentTerritory = ret?.parentTerritory || "Unknown Territory";
            const areaManager = ret?.areaManager || "Unknown Area Manager";
            const mpo = ret?.orderedBy || "Unknown MPO";
            const returnTotal = ret.products.reduce((acc, product) => acc + Number(product.totalPrice || 0), 0);

            if (!groupedReturns[`${parentTerritory}___${areaManager}`]) {
                groupedReturns[`${parentTerritory}___${areaManager}`] = {};
            }
            if (!groupedReturns[`${parentTerritory}___${areaManager}`][mpo]) {
                groupedReturns[`${parentTerritory}___${areaManager}`][mpo] = 0;
            }

            groupedReturns[`${parentTerritory}___${areaManager}`][mpo] += returnTotal;
        });

        let grandGrossTotal = 0;
        let grandAdjustmentTotal = 0;
        let grandDiscountTotal = 0;
        let grandReturnTotal = 0;
        let grandNetTotal = 0;

        const groupedHTML = Object.entries(groupedOrders).map(([key, mpoList]) => {
            const [parentTerritory, areaManager] = key.split("___");

            const areaGrossTotal = Object.values(mpoList).reduce((acc, v) => acc + v.soldAmount, 0);
            const areaAdjustmentTotal = Object.values(mpoList).reduce((acc, v) => acc + v.adjusted, 0);
            const areaDiscountTotal = Object.values(mpoList).reduce((acc, v) => acc + v.discount, 0);
            const areaReturnTotal = Object.entries(mpoList).reduce((acc, [mpoName]) => acc + (groupedReturns[key]?.[mpoName] || 0), 0);
            const areaNetTotal = Object.entries(mpoList).reduce((acc, [mpoName, v]) => {
                const returnAmount = groupedReturns[key]?.[mpoName] || 0;
                return acc + (v.soldAmount - v.adjusted - v.discount - returnAmount);
            }, 0);

            grandGrossTotal += areaGrossTotal;
            grandAdjustmentTotal += areaAdjustmentTotal;
            grandDiscountTotal += areaDiscountTotal;
            grandReturnTotal += areaReturnTotal;
            grandNetTotal += areaNetTotal;

            return `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; width: 13%;">Territory</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0;">Order by</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align:right; width: 13%;">Sold Amount</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align:right; width: 13%;">Adjustment</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align:right; width: 13%;">Discount</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align:right; width: 13%;">Return Amount</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align:right; width: 13%;">Net Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="1" style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #e9f5ff;">
                                ${parentTerritory}
                            </td>
                            <td colspan="6" style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #e9f5ff;">
                                Area Manager: ${areaManager}
                            </td>
                        </tr>
                        ${Object.entries(mpoList).map(([mpoName, v]) => {
                const returnAmount = groupedReturns[key]?.[mpoName] || 0;
                const netAmount = v.soldAmount - v.adjusted - v.discount - returnAmount;

                const mpoOrder = orders.find(order => order.orderedBy === mpoName && order.areaManager === areaManager && order.parentTerritory === parentTerritory);
                const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                return `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ccc;">${mpoTerritory}</td>
                            <td style="padding: 8px; border: 1px solid #ccc;">${mpoName}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align:right;">${v.soldAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align:right;">${v.adjusted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align:right;">${v.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align:right;">${returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align:right; font-weight:bold;">${netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        `;
            }).join("")}
                    <tr>
                        <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Area Total</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align:right; font-weight: bold; background-color: #f9f9f9;">${areaGrossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align:right; font-weight: bold; background-color: #f9f9f9;">${areaAdjustmentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align:right; font-weight: bold; background-color: #f9f9f9;">${areaDiscountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align:right; font-weight: bold; background-color: #f9f9f9;">${areaReturnTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align:right; font-weight: bold; background-color: #f9f9f9;">${areaNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
                        <td style="padding: 8px; border: 1px solid #aaa; text-align:right; width: 13%;">${grandGrossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align:right; width: 13%;">${grandAdjustmentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align:right; width: 13%;">${grandDiscountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align:right; width: 13%;">${grandReturnTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align:right; width: 13%;">${grandNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                    <title>Net Sales generated on ${today}</title>
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

export default NetSalesReport;