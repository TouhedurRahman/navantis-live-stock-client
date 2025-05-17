const DepotStockOutInvoice = ({ invoiceWithAP, firstDate, lastDate, totalUniqueProducts, totalUnit, totalTP, totalAP, filteredProducts }) => {
    const accessAP = invoiceWithAP ?? false;

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

    const handlePrint = () => {
        const companyHeader = `
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
                <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Depot Stock Out List</u></h3>
                <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                    ${(firstDate !== lastDate)
                ?
                `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                :
                `Date <b>${firstDate}</b>`
            }</p>
            </div>
            <div class="mb-1 text-sm text-gray-400 text-right italic">
                    <h3 class="">Printed on ${now}</h3>
            </div>
            <div style="margin-bottom: 20px; padding: 5px 15px; border: 1px solid #B2BEB5; border-radius: 3px;">
                <p style="font-size: 11px; font-weight: bold; text-align: center; text-transform: uppercase;">
                    Summary
                </p>
                <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                    <span style="font-size: 11px; font-weight: 600;">Total Items</span>
                    <span style="font-size: 11px; font-weight: 700;">${totalUniqueProducts}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-top: 1px solid #B2BEB5;">
                    <span style="font-size: 11px; font-weight: 600;">Total Quantity</span>
                    <span style="font-size: 11px; font-weight: 700;">${totalUnit}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-top: 1px solid #B2BEB5;">
                    <span style="font-size: 11px; font-weight: 600;">Total Trade Price</span>
                    <span style="font-size: 11px; font-weight: 700;">${totalTP.toLocaleString('en-IN')}/-</span>
                </div>
                ${accessAP ? `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-top: 1px solid #B2BEB5;">
                        <span style="font-size: 11px; font-weight: 600;">Total Actual Price</span>
                        <span style="font-size: 11px; font-weight: 700;">${totalAP.toLocaleString('en-IN')}/-</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

        const filteredTableContent = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: center;">Sl.</th>
                        <th style="text-align: left;">Product Name</th>
                        <th style="text-align: center;">Pack Size</th>
                        <th style="text-align: center;">Batch</th>
                        <th style="text-align: center;">Exp.</th>
                        <th style="text-align: right;">Quantity</th>
                        <th style="text-align: right;">Price/Unit (TP)</th>
                        <th style="text-align: right;">Total Price (TP)</th>
                        ${accessAP ? `
                            <th style="text-align: right;">Price/Unit (AP)</th>
                            <th style="text-align: right;">Total Price (AP)</th>
                        ` : ''}                        
                        <th style="text-align: center;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredProducts.map(
            (product, idx) => `
                            <tr>
                                <td style="text-align: center;">${idx + 1}</td>
                                <td>${product.productName}</td>
                                <td style="text-align: center;">${product.netWeight}</td>
                                <td style="text-align: center;">${product.batch}</td>
                                <td style="text-align: center;">${product.expire}</td>
                                <td style="text-align: right;">${product.totalQuantity}</td>
                                <td style="text-align: right;">${product.tradePrice.toLocaleString('en-IN')}/-</td>
                                <td style="text-align: right;">${(product.tradePrice * product.totalQuantity).toLocaleString('en-IN')}/-</td>
                                ${accessAP ? `
                                    <td style="text-align: right;">${product.actualPrice.toLocaleString('en-IN')}/-</td>
                                    <td style="text-align: right;">${(product.actualPrice * product.totalQuantity).toLocaleString('en-IN')}/-</td>
                                ` : ''}
                                <td style="text-align: center; white-space: nowrap;">${new Date(product.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                            </tr>
                        `
        ).join('')}
                </tbody>
                <tbody>
                ${accessAP ? `
                    <tr>
                        <!-- Merged first four columns -->
                        <td colspan="5" style="text-align: center; font-weight: bold;">Total</td>
                        <td style="text-align: right;">${totalUnit}</td>
                        <td style="text-align: right;"></td>
                        <td style="text-align: right;">${totalTP.toLocaleString('en-IN')}/-</td>
                        <td style="text-align: right;"></td>
                        ${accessAP ? `
                            <td style="text-align: right;">${totalAP.toLocaleString('en-IN')}/-</td>
                        ` : ''}
                        <td style="text-align: center; white-space: nowrap;"></td>
                    </tr>
                    ` : `
                    <tr>
                        <!-- Merged first four columns -->
                        <td colspan="5" style="text-align: center; font-weight: bold;">Total</td>
                        <td style="text-align: right;">${totalUnit}</td>
                        <td style="text-align: right;"></td>
                        <td style="text-align: right;">${totalTP.toLocaleString('en-IN')}/-</td>
                        <td style="text-align: center; white-space: nowrap;"></td>
                    </tr>
                    `
            }
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
                                content: "Printed on ${now}";
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

export default DepotStockOutInvoice;