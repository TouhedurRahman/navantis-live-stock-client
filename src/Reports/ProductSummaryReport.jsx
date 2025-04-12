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
                if (product.name && product.quantity && product.tradePrice) {
                    const productKey = product.name;
                    const quantity = Number(product.quantity);
                    const totalPrice = quantity * Number(product.tradePrice);

                    grandTotalQty += quantity;
                    grandTotalPrice += totalPrice;

                    if (!groupedOrders[areaManager][mpo].products[productKey]) {
                        groupedOrders[areaManager][mpo].products[productKey] = {
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
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 20%;">Territory</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 20%;">Order by</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 60%;">Product Summary</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="3" style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #e9f5ff;">
                            Area Manager: ${areaManager}
                        </td>
                    </tr>
                    ${Object.entries(mpoList).map(([mpoName, mpoData]) => {
                const productsArray = Object.values(mpoData.products);
                return `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ccc;">${mpoName}</td>
                                <td style="padding: 8px; border: 1px solid #ccc;">${mpoName}</td>
                                <td style="padding: 8px; border: 1px solid #ccc;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr>
                                                <th style="padding: 8px; border: 1px solid #aaa; text-align: left;">Product</th>
                                                <th style="padding: 8px; border: 1px solid #aaa; text-align: right;">Quantity</th>
                                                <th style="padding: 8px; border: 1px solid #aaa; text-align: right;">Total Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${productsArray.map(product => `
                                                <tr>
                                                    <td style="padding: 8px; border: 1px solid #ccc;">${product.productName}</td>
                                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${product.quantity}</td>
                                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                                        ${product.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        `;
            }).join('')}
                </tbody>
            </table>
            `;
        }).join('');

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #d9edf7; font-weight: bold;">
                        <th style="padding: 8px; border: 1px solid #aaa; width: 40%;">Grand Total</th>
                        <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">Total Quantity</th>
                        <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 20%;">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #aaa;"></td>
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