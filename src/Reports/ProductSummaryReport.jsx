import { useEffect, useState } from "react";

const ProductSummaryReport = ({ filteredOrders = [], firstDate, lastDate }) => {
    const [orders, setOrders] = useState(filteredOrders);

    useEffect(() => {
        setOrders(filteredOrders);
    }, [filteredOrders]);

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

        const groupedOrders = {};
        let grandTotalQty = 0;
        let grandTotalPrice = 0;

        orders.forEach(order => {
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const mpo = order?.orderedBy || "Unknown MPO";
            const productDetails = order?.products || [];

            if (!groupedOrders[areaManager]) {
                groupedOrders[areaManager] = {};
            }

            if (!groupedOrders[areaManager][mpo]) {
                groupedOrders[areaManager][mpo] = {
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

                    if (!groupedOrders[areaManager][mpo].products[productKey]) {
                        groupedOrders[areaManager][mpo].products[productKey] = {
                            productCode: product.productCode,
                            productName: product.name,
                            quantity: 0,
                            totalPrice: 0
                        };
                    }

                    groupedOrders[areaManager][mpo].products[productKey].quantity += quantity;
                    groupedOrders[areaManager][mpo].products[productKey].totalPrice += totalPrice;
                }
            });
        });

        const groupedHTML = Object.entries(groupedOrders).map(([areaManager, mpoList]) => {
            return `
                <div style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 5px;">Area Manager: ${areaManager}</h3>
                    ${Object.entries(mpoList).map(([mpoName, mpoData]) => {
                const productsArray = Object.values(mpoData.products);
                const mpoOrder = orders.find(order => order.orderedBy === mpoName && order.areaManager === areaManager);
                const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                let mpoTotalQty = 0;
                let mpoTotalPrice = 0;

                productsArray.forEach(product => {
                    mpoTotalQty += product.quantity;
                    mpoTotalPrice += product.totalPrice;
                });

                return `
                            <h4 style="margin: 10px 0 5px;">MPO: ${mpoName} (${mpoTerritory})</h4>
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                                <thead>
                                    <tr>
                                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left;">Product Code</th>
                                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left;">Product</th>
                                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right;">Quantity</th>
                                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right;">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${productsArray.map(product => `
                                        <tr>
                                            <td style="padding: 8px; border: 1px solid #ccc;">${product.productCode}</td>
                                            <td style="padding: 8px; border: 1px solid #ccc;">${product.productName}</td>
                                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${product.quantity}</td>
                                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                                ${product.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    `).join('')}
                                    <tr>
                                        <td colspan="2" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">MPO Total</td>
                                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                                            ${mpoTotalQty.toLocaleString('en-IN')}
                                        </td>
                                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                                            ${mpoTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        `;
            }).join('')}  
                </div>
            `;
        }).join('');

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #aaa;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right;">
                            ${grandTotalQty.toLocaleString('en-IN')}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right;">
                            ${grandTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

export default ProductSummaryReport;