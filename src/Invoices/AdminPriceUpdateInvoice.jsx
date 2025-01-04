const AdminPriceUpdateInvoice = ({ invoiceWithAP, firstDate, lastDate, totalUniqueProducts, filteredProducts }) => {
    const accessAP = invoiceWithAP ?? false;

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
                <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Price Update List</u></h3>
                <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                    ${(firstDate !== lastDate)
                ?
                `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                :
                `Date <b>${firstDate}</b>`
            }</p>
            </div>
            <div style="margin-bottom: 20px; padding: 5px 15px; border: 1px solid #B2BEB5; border-radius: 3px;">
                <p style="font-size: 11px; font-weight: bold; text-align: center; text-transform: uppercase;">
                    Summary
                </p>
                <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                    <span style="font-size: 11px; font-weight: 600;">Total Items</span>
                    <span style="font-size: 11px; font-weight: 700;">${totalUniqueProducts}</span>
                </div>
            </div>
        </div>
    `;

        const filteredTableContent = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: center;">Sl.</th>
                                <th style="text-align: left;">Product Name</th>
                                <th style="text-align: right;">New Quantity</th>
                                <th style="text-align: right;">Previous Quantity</th>
                                ${accessAP ? `
                                <th style="text-align: right;">Price Type</th>    
                                ` : ''}
                                <th style="text-align: right;">New Price</th>
                                <th style="text-align: right;">Previous Price</th>
                                <th style="text-align: right;">Updated Price</th>
                                <th style="text-align: center;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredProducts.map(
            (product, idx) => `
                <tr class="border-b">
                    <th class="text-center">${idx + 1}</th>
                    <td>${product.productName}</td>
                    <td class="text-right">${product.newQuantity}</td>
                    <td class="text-right">${product.initialQuantity}</td>
                    ${accessAP ? `
                    <td class="text-center">
                        <div class="flex flex-col items-center">
                            <p>AP</p>
                            <div class="w-full border-t my-2"></div>
                            <p>TP</p>
                        </div>
                    </td>        
                    ` : ''}
                    <td class="text-right">
                        <div class="flex flex-col justify-center items-end">
                            ${accessAP ? `
                            <p>${product.actualPrice.toLocaleString('en-IN')}/-</p>
                            <div class="w-full border-t my-2"></div> 
                            ` : ''}
                            <p>${product.tradePrice.toLocaleString('en-IN')}/-</p>
                        </div>
                    </td>
                    <td class="text-right">
                        <div class="flex flex-col justify-center items-end">
                            ${accessAP ? `
                            <p>${product.initialActualPrice.toLocaleString('en-IN')}/-</p>
                            <div class="w-full border-t my-2"></div>                                    
                            ` : ''}
                            <p>${product.initialTradePrice.toLocaleString('en-IN')}/-</p>
                        </div>
                    </td>
                    <td class="text-right">
                        <div class="flex flex-col justify-center items-end">
                            ${accessAP ? `
                            <p>
                                ${Math.abs(product.actualPrice - product.initialActualPrice).toLocaleString('en-IN')} /- 
                                ${product.actualPrice > product.initialActualPrice ? " (Inc)" : " (Dec)"}
                            </p>
                            <div class="w-full border-t my-2"></div> 
                            ` : ''}
                            <p>
                                ${Math.abs(product.tradePrice - product.initialTradePrice).toLocaleString('en-IN')} /- 
                                ${product.tradePrice > product.initialTradePrice ? " (Inc)" : " (Dec)"}
                            </p>
                        </div>
                    </td>
                    <td class="text-center text-nowrap">
                        ${new Date(product.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </td>
                </tr>
            `
        ).join('')}
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
                            body::after {
                                content: "Printed on ${finalFormattedDateTime}";
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                width: 100%;
                                text-align: center;
                                font-size: 12px;
                                font-style: italic;
                                color: #555;
                            }
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
        newWindow.print();
    };

    return handlePrint;
};

export default AdminPriceUpdateInvoice;