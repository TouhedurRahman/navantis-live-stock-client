import { useEffect, useState } from "react";

const NetSalesReportExcel = ({ reportType, filteredOrders = [], orderReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
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

    const handleDownloadExcel = () => {
        const companyHeader = `
            <div>
                <div style="position: relative; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.</p>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">Hotline: +880 1322-852183</p>
                </div>
                <div style="text-align: left; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>${reportType}</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">
                        Downloaded on ${now}
                    </p>
                </div>
                ${reportType === "Customer wise Net Sales"
                ?
                `
                    <div style="font-weight: bold;">
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Customer Code: ${customerCode}
                        </p>
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Customer Name: ${customerName}
                        </p>
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Customer Address: ${customerAddress}
                        </p>
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Mobile: +880 ${customerMobile.slice(-10, -6)}-${customerMobile.slice(-6)}
                        </p>
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

            const key = `${parentTerritory}___${areaManager}`;

            if (!groupedOrders[key]) groupedOrders[key] = {};
            if (!groupedOrders[key][mpo]) groupedOrders[key][mpo] = 0;

            groupedOrders[key][mpo] += soldAmount;
        });

        const groupedReturns = {};

        returns.forEach(ret => {
            const parentTerritory = ret?.parentTerritory || "Unknown Territory";
            const areaManager = ret?.areaManager || "Unknown Area Manager";
            const mpo = ret?.orderedBy || "Unknown MPO";
            const returnTotal = ret.products.reduce((acc, product) => acc + Number(product.totalPrice || 0), 0);

            const key = `${parentTerritory}___${areaManager}`;

            if (!groupedReturns[key]) groupedReturns[key] = {};
            if (!groupedReturns[key][mpo]) groupedReturns[key][mpo] = 0;

            groupedReturns[key][mpo] += returnTotal;
        });

        let grandGrossTotal = 0;
        let grandReturnTotal = 0;
        let grandNetTotal = 0;

        const groupedHTML = Object.entries(groupedOrders).map(([key, mpoList]) => {
            const [parentTerritory, areaManager] = key.split("___");

            const areaGrossTotal = Object.values(mpoList).reduce((a, b) => a + b, 0);
            const areaReturnTotal = Object.entries(mpoList).reduce((acc, [mpoName]) => acc + (groupedReturns[key]?.[mpoName] || 0), 0);
            const areaNetTotal = Object.entries(mpoList).reduce((acc, [mpoName, grossTotal]) => {
                const returnAmount = groupedReturns[key]?.[mpoName] || 0;
                return acc + (grossTotal - returnAmount);
            }, 0);

            grandGrossTotal += areaGrossTotal;
            grandReturnTotal += areaReturnTotal;
            grandNetTotal += areaNetTotal;

            return `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 20%;">Territory</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 20%;">Order by</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%;">Sold Amount</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%;">Return Amount</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%;">Net Sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="1" style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #e9f5ff;">
                                ${parentTerritory}
                            </td>
                            <td colspan="4" style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #e9f5ff;">
                                Area Manager: ${areaManager}
                            </td>
                        </tr>
                        ${Object.entries(mpoList).map(([mpoName, grossTotal]) => {
                const returnAmount = groupedReturns[key]?.[mpoName] || 0;
                const netAmount = grossTotal - returnAmount;

                const mpoOrder = orders.find(order => order.orderedBy === mpoName && order.areaManager === areaManager && order.parentTerritory === parentTerritory);
                const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                return `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ccc;">${mpoTerritory}</td>
                                <td style="padding: 8px; border: 1px solid #ccc;">${mpoName}</td>
                                <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #ccc; text-align: right; font-weight: bold;">${netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            `;
            }).join("")}
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">${parentTerritory}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Area Totals</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9; width: 20%;">
                                ${areaGrossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9; width: 20%;">
                                ${areaReturnTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f9f9f9; width: 20%;">
                                ${areaNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                        <tr />
                    </tbody>
                </table>
            `;
        }).join('');

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tbody>
                    <tr style="background-color: #d9edf7; font-weight: bold;">
                        <td colspan="2" style="padding: 8px; border: 1px solid #aaa;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">${grandGrossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">${grandReturnTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">${grandNetTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>
        `;

        const htmlContent = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body>
                    ${companyHeader}
                    ${groupedHTML}
                    ${finalTotalHTML}
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType} Date from ${firstDate} to ${lastDate}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return handleDownloadExcel;
};

export default NetSalesReportExcel;