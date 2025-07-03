import { useEffect, useState } from "react";

const MyProductSummaryReportExcel = ({ reportType, filteredOrders = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [orders, setOrders] = useState(filteredOrders);

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
                ${reportType === "Customer wise Products Summary"
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
        let grandTotalQty = 0;
        let grandTotalPrice = 0;

        orders.forEach(order => {
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const parentTerritory = order?.parentTerritory || "Unknown Territory";
            const mpo = order?.orderedBy || "Unknown MPO";
            const productDetails = order?.products || [];

            if (!groupedOrders[areaManager]) {
                groupedOrders[areaManager] = {};
            }

            if (!groupedOrders[areaManager][parentTerritory]) {
                groupedOrders[areaManager][parentTerritory] = {};
            }

            if (!groupedOrders[areaManager][parentTerritory][mpo]) {
                groupedOrders[areaManager][parentTerritory][mpo] = {
                    products: {}
                };
            }

            productDetails.forEach(product => {
                if (product.productCode && product.name && product.quantity && product.tradePrice) {
                    const productKey = product.name;
                    const quantity = Number(product.quantity);
                    const totalPrice = quantity * Number(product.tradePrice);

                    grandTotalQty += quantity;
                    grandTotalPrice += totalPrice;

                    if (!groupedOrders[areaManager][parentTerritory][mpo].products[productKey]) {
                        groupedOrders[areaManager][parentTerritory][mpo].products[productKey] = {
                            productCode: product.productCode,
                            productName: product.name,
                            netWeight: product.netWeight,
                            quantity: 0,
                            totalPrice: 0
                        };
                    }

                    groupedOrders[areaManager][parentTerritory][mpo].products[productKey].quantity += quantity;
                    groupedOrders[areaManager][parentTerritory][mpo].products[productKey].totalPrice += totalPrice;
                }
            });
        });

        const groupedHTML = Object.entries(groupedOrders).map(([areaManager, territories]) => {
            return Object.entries(territories).map(([parentTerritory, mpoList]) => {
                let territoryTotalQty = 0;
                let territoryTotalPrice = 0;

                const mpoTables = Object.entries(mpoList).map(([mpoName, mpoData]) => {
                    const productsArray = Object.values(mpoData.products);

                    let mpoTotalQty = 0;
                    let mpoTotalPrice = 0;

                    productsArray.forEach(product => {
                        mpoTotalQty += product.quantity;
                        mpoTotalPrice += product.totalPrice;
                    });

                    territoryTotalQty += mpoTotalQty;
                    territoryTotalPrice += mpoTotalPrice;

                    const mpoOrder = orders.find(order =>
                        order.orderedBy === mpoName &&
                        order.areaManager === areaManager &&
                        order.parentTerritory === parentTerritory
                    );
                    const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                    return `
                        ${!["Institute", "Doctor"].includes(mpoTerritory)
                            ?
                            `
                                <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">
                                    MPO/SCC/ASE: ${mpoName} | Territory: ${mpoTerritory}
                                </p>
                            `
                            :
                            ""
                        }
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 15%";>Product Code</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 35%";">Product Name</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: center; width: 10%";">Pack Size</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%";">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsArray.map(product => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ccc;">${product.productCode}</td>
                                <td style="padding: 8px; border: 1px solid #ccc;">${product.productName}</td>
                                <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${product.netWeight}</td>
                                <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${product.quantity}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td colspan="3" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">
                                ${mpoTerritory === "Institute"
                            ?
                            "Institute Total"
                            :
                            mpoTerritory === "Doctor"
                                ?
                                "Doctor Requisition Total"
                                :
                                `${mpoTerritory} Territory Total`}
                            </td>
                            <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                                ${mpoTotalQty.toLocaleString('en-IN')}
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
                }).join('');

                return `
            <div style="margin-bottom: 30px;">
                <p style="margin-bottom: 5px; text-align: center; font-weight: bold; font-size: 12px;">
                    ${parentTerritory === "Institute"
                        ?
                        "Institute"
                        :
                        parentTerritory === "Doctor"
                            ?
                            "Doctor Requisition"
                            :
                            `Sr. AM/AM: ${areaManager} | Territory: ${parentTerritory}`}
                </p>
                ${mpoTables}
                         ${["Institute", "Doctor"].includes(parentTerritory)
                        ?
                        ""
                        :
                        `
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                                <tbody>
                                    <tr />
                                    <tr>
                                        <td colspan="3" style="padding: 8px; border: 1px solid #aaa; font-weight: bold; width: 60%";">
                                            ${parentTerritory} Area Total
                                        </td>
                                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 20%";">
                                            ${territoryTotalQty.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        `
                    }
            </div>
        `;
            }).join('');
        }).join('');

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tbody>
                    <tr />
                    <tr>
                        <td colspan="3" style="padding: 8px; border: 1px solid #aaa; font-weight: bold; width: 60%";">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 20%";">
                            ${grandTotalQty.toLocaleString('en-IN')}
                        </td>
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

export default MyProductSummaryReportExcel;