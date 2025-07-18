import { useEffect, useState } from "react";

const ProductSummary = ({ filteredOrders = [], firstDate, lastDate }) => {
    const [orders, setOrders] = useState(filteredOrders);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

    useEffect(() => {
        setOrders(filteredOrders);
    }, [filteredOrders]);

    const productSummary = new Map();

    orders.forEach(order => {
        order.products.forEach(product => {
            const key = `${product.name}-${product.netWeight}-${product.batch}`;

            if (!productSummary.has(key)) {
                productSummary.set(key, {
                    productCode: product.productCode,
                    name: product.name,
                    netWeight: product.netWeight,
                    batch: product.batch,
                    expire: product.expire,
                    soldQuantity: 0,
                    totalQuantity: 0,
                });
            }

            const existingProduct = productSummary.get(key);
            existingProduct.soldQuantity += product.quantity;
            existingProduct.totalQuantity += product.quantity;
        });
    });

    const summarisedProducts = Array.from(productSummary.values());

    const totalProducts = summarisedProducts.reduce((sum, product) => sum + Number(product.totalQuantity), 0);

    const handlePrint = () => {
        const companyHeader =
            `
            <div>
                <div style="position: relative; text-align: center; margin-bottom: 20px;">
                    <!-- Picture at the top left -->
                    <img
                        src='/images/NPL-Updated-Logo.png'
                        alt="Company Logo" 
                        style="left: 0; width: 150px; height: auto;"
                    />
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                    <p style="margin: 0; font-size: 10px;">
                        Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.
                    </p>
                    <p style="margin: 0; font-size: 10px;">Hotline: +880 1322-852183</p>
                </div>
                <div style="text-align: left; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Date Wise Product Summary</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ?
                `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                :
                `Date <b>${firstDate}</b>`
            }</p>
                </div>
                <div class="mb-1 text-sm text-gray-400 text-right italic">
                    <h3>Printed on ${now}</h3>
                </div>
                <div style="margin-bottom: 20px; padding: 5px 15px; border: 1px solid #B2BEB5; border-radius: 3px;">
                    <p style="font-size: 11px; font-weight: bold; text-align: center; text-transform: uppercase;">
                        Summary
                    </p>
                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                        <span style="font-size: 11px; font-weight: 600;">Total Product(s)</span>
                        <span style="font-size: 11px; font-weight: 700;">${totalProducts}</span>
                    </div>
                </div>
            </div>
        `;

        const filteredTableContent = `
            <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                <th style="text-align: center;">Sl.</th>
                <th style="text-align: left;">Product Code</th>
                <th style="text-align: left;">Product Name</th>
                <th style="text-align: center;">Pack Size</th>
                <th style="text-align: center;">Batch</th>
                <th style="text-align: center;">Expire</th>
                <th style="text-align: right;">Sold Qty</th>
                <th style="text-align: right;">Bonus Qty</th>
                <th style="text-align: right;">Total Qty</th>
                </tr>
            </thead>
            <tbody>
                ${summarisedProducts.map((product, idx) => {
            return `
                    <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td style="text-align: left;">${product.productCode}</td>
                    <td style="text-align: left;">${product.name}</td>
                    <td style="text-align: center;">${product.netWeight}</td>
                    <td style="text-align: center;">${product.batch}</td>
                    <td style="text-align: center;">${product.expire}</td>
                    <td style="text-align: right;">${product.soldQuantity}</td>
                    <td style="text-align: right;">${"0"}</td>
                    <td style="text-align: right;">${product.totalQuantity}</td>
                    </tr>
                `;
        }).join('')}
            </tbody>
                <tbody>
                    <tr>
                        <!-- Merged first four columns -->
                        <td colspan="8" style="text-align: right; font-weight: bold;">Sub Total</td>
                        <td style="text-align: right;">${totalProducts}</td>
                    </tr>
                </tbody>
            </table>
        `;

        const currentDateTime = new Date();
        const formattedDateTime = currentDateTime.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

        const formattedDateTimeWithAt = formattedDateTime.replace(', ', ', ');
        const finalFormattedDateTime = formattedDateTimeWithAt.replace(
            ", ",
            ", "
        );

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map(
            (style) => style.outerHTML
        ).join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>Invoice</title>
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
                            table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            th, td {
                                border: 1px solid black;
                                padding: 8px;
                                text-align: left;
                                vertical-align: middle;
                                font-size: 10px;
                            }
                            th {
                                background-color: #f0f0f0;
                            }
                            td.date-column {
                                white-space: nowrap;
                            }
                            /* Footer styles for all pages */
                            /* body::after {
                                content: "Printed on ${finalFormattedDateTime}";
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                width: 100%;
                                text-align: center;
                                font-size: 12px;
                                font-style: italic;
                                color: #555;
                            } */
                        }
                    </style>
                </head>
                <body>
                    ${companyHeader}
                    ${filteredTableContent}
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

export default ProductSummary;