const OrderInvoice = ({ order }) => {
    const handlePrint = () => {
        const companyHeader =
            `<div class="font-sans mb-8">
                <!-- Header Section -->
                <div class="flex justify-between items-center mb-5">
                    <!-- Left side: Logo -->
                    <img
                        src='/images/NPL-Updated-Logo.png'
                        alt="Company Logo"
                        class="w-[150px] h-auto"
                    />

                    <!-- Center: Company Name -->
                    <h1 class="text-2xl font-bold text-center m-0">Navantis Pharma Limited</h1>

                    <!-- Right side: Customer Copy -->
                    <p class="text-sm font-bold text-right mt-0">Customer Copy</p>
                </div>

                <!-- Table Section -->
                <table class="w-full border-collapse mb-5">
                    <tr>
                        <!-- First Row -->
                        <td class="p-2 border border-[#B2BEB5] w-1/3">
                            <p class="m-0 text-sm">Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.</p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] text-center w-1/3">
                            <p class="m-0 text-lg font-bold">Invoice</p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] text-center w-1/3">
                            <div class="flex justify-between items-center">
                                <img src='/images/NPL-Updated-Logo.png' class="w-20 h-auto mr-1">
                                <img src='/images/noiderma-logo.png' class="w-20 h-auto mr-1">
                                <img src='/images/bionike-logo.png' alt="Logo 3" class="w-20 h-auto">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <!-- Second Row -->
                        <td class="p-2 border border-[#B2BEB5] w-1/3">
                            <p class="m-0 text-sm">Depot Address: Some Street, City, Country</p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] w-1/3">
                            <p class="m-0 text-sm">Customer Name: John Doe</p>
                            <p class="m-0 text-sm">Customer Address: Some Address</p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] w-1/3">
                            <p class="m-0 text-sm">Date: ${new Date().toLocaleDateString()}</p>
                            <p class="m-0 text-sm">Delivery Info: Delivered by Courier</p>
                        </td>
                    </tr>
                </table>

                <!-- Delivered Product Info -->
                <div class="border border-[#B2BEB5] p-3">
                    <p class="text-sm font-bold text-center uppercase">Delivered Products</p>
                    <table class="w-full border-collapse mt-2">
                        <tr class="bg-[#f4f4f4]">
                            <th class="p-2 border border-[#B2BEB5] text-left w-1/3">Product Name</th>
                            <th class="p-2 border border-[#B2BEB5] text-left w-1/3">Quantity</th>
                            <th class="p-2 border border-[#B2BEB5] text-left w-1/3">Price</th>
                        </tr>
                        <!-- Example Product Rows -->
                        <tr>
                            <td class="p-2 border border-[#B2BEB5]">Product 1</td>
                            <td class="p-2 border border-[#B2BEB5]">10</td>
                            <td class="p-2 border border-[#B2BEB5]">${(100 * 10).toLocaleString('en-IN')}/-</td>
                        </tr>
                        <tr>
                            <td class="p-2 border border-[#B2BEB5]">Product 2</td>
                            <td class="p-2 border border-[#B2BEB5]">5</td>
                            <td class="p-2 border border-[#B2BEB5]">${(200 * 5).toLocaleString('en-IN')}/-</td>
                        </tr>
                    </table>
                </div>
            </div>`;

        const filteredTableContent = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: center;">Sl.</th>
                        <th style="text-align: left;">Product Name</th>
                        <th style="text-align: center;">Batch</th>
                        <th style="text-align: center;">Exp.</th>
                        <th style="text-align: right;">Quantity</th>
                        <th style="text-align: right;">Price/Unit (TP)</th>
                        <th style="text-align: right;">Total Price (TP)</th>                        
                        <th style="text-align: center;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.products.map(
            (product, idx) => `
                            <tr>
                                <td style="text-align: center;">${idx + 1}</td>
                                <td>${0}</td>
                                <td style="text-align: center;">${0}</td>
                                <td style="text-align: center;">${0}</td>
                                <td style="text-align: right;">${0}</td>
                                <td style="text-align: right;">${0}/-</td>
                                <td style="text-align: right;">${0}/-</td>
                                <td style="text-align: center; white-space: nowrap;">${0}</td>
                            </tr>
                        `
        ).join('')}
                </tbody>
                <tbody>
                    <tr>
                        <!-- Merged first four columns -->
                        <td colspan="4" style="text-align: center; font-weight: bold;">Total</td>
                        <td style="text-align: right;">${0}</td>
                        <td style="text-align: right;"></td>
                        <td style="text-align: right;">${0}/-</td>
                        <td style="text-align: center; white-space: nowrap;"></td>
                    </tr>
            }
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

export default OrderInvoice;