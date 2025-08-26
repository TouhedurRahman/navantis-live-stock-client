import { useEffect, useState } from "react";

const AllProductsSummaryReport = ({ reportType, filteredOrders = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
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
                ${reportType === "Customer wise Products Summary All"
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

        const allProductsSummary = {};
        let totalQty = 0;
        let totalPrice = 0;

        orders.forEach(order => {
            order.products.forEach(product => {
                if (!product.name || !product.netWeight) return;

                const key = `${product.name} | ${product.netWeight}`;
                const qty = Number(product.quantity);
                const price = qty * Number(product.tradePrice);

                totalQty += qty;
                totalPrice += price;

                if (!allProductsSummary[key]) {
                    allProductsSummary[key] = {
                        productCode: product.productCode,
                        productName: product.name,
                        netWeight: product.netWeight,
                        quantity: 0,
                        totalPrice: 0
                    };
                }

                allProductsSummary[key].quantity += qty;
                allProductsSummary[key].totalPrice += price;
            });
        });

        const sortedProducts = Object.values(allProductsSummary).sort((a, b) =>
            a.productName.localeCompare(b.productName)
        );

        const summaryHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: center; width: 5%;">SL</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 12%;">Product Code</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 45%;">Product Name</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: center; width: 10%;">Pack Size</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%;">Quantity</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 16%;">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedProducts.map((product, index) => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${index + 1}</td>
                            <td style="padding: 8px; border: 1px solid #ccc;">${product.productCode}</td>
                            <td style="padding: 8px; border: 1px solid #ccc;">${product.productName}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${product.netWeight}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${product.quantity}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                ${product.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="4" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                            ${totalQty.toLocaleString('en-IN')}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                            ${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    <title>Product Summary All generated on ${today}</title>
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
                                    ${summaryHTML}
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

export default AllProductsSummaryReport;