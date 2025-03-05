import useAllUsers from "../Hooks/useAllUsers";
import useCustomer from "../Hooks/useCustomer";

const OrderInvoice = ({ order }) => {
    const [allUsers] = useAllUsers();
    const [customers] = useCustomer();

    const orderedBy = allUsers.find(alu => alu.email === order.email);
    const customer = customers.find(c => c.territory === order.territory);

    const totalUnit = order.products.reduce((sum, product) => sum + Number(product.quantity), 0);
    const totalTP = order.products.reduce((sum, product) => sum + Number(product.quantity * product.tradePrice), 0);

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
                            <p class="text-justify m-0 text-sm">
                                Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.
                            </p>
                            <p class="text-justify m-0 text-sm">
                                Cell: +880 1329-747657
                            </p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] text-center w-1/3">
                            <p class="m-0 text-lg font-bold">INVOICE</p>
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
                        <td class="p-2 border border-[#B2BEB5] w-1/3 align-top">
                            <p class="m-0 text-sm">Depot Address: Some Street, City, Country</p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] w-1/3 align-top">
                            <p class="m-0 text-sm">Customer Code: ${customer.customerId}</p>
                            <p class="m-0 text-sm">${customer.name}</p>
                            <p class="m-0 text-sm">${customer.address}</p>
                            <p class="m-0 text-sm">Cell: +880 ${customer.mobile.slice(-10, -6)}-${customer.mobile.slice(-6)}</p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] w-1/3 align-top">
                            <div class="grid grid-cols-[max-content_15px_auto] text-sm gap-y-1">
                                <span class="font-bold">Date</span>
                                <span class="font-bold">:</span>
                                <span>${order.date}</span>

                                <span class="font-bold">Invoice No.</span>
                                <span class="font-bold">:</span>
                                <span>${order.invoice}</span>

                                <span class="font-bold">Pay Mode</span>
                                <span class="font-bold">:</span>
                                <span>${order.payMode}</span>

                                <span class="font-bold">Territory</span>
                                <span class="font-bold">:</span>
                                <span>${order.territory}</span>

                                <span class="font-bold">${orderedBy.designation?.split(" ").map(word => word[0].toUpperCase()).join("")}</span>
                                <span class="font-bold">:</span>
                                <span>${orderedBy?.name}</span>

                                <span class="font-bold">Cell</span>
                                <span class="font-bold">:</span>
                                <span>+880 ${orderedBy?.mobile.slice(-10, -6)}-${orderedBy?.mobile.slice(-6)}</span>

                                <span class="font-bold">Delivered by</span>
                                <span class="font-bold">:</span>
                                <span>${order.deliveryMan}</span>

                                <span class="font-bold">Delivered Date</span>
                                <span class="font-bold">:</span>
                                <span>${new Date().toLocaleDateString()}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>`;

        const filteredTableContent = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: center;">Sl.</th>
                        <th style="text-align: left;">Product Code</th>
                        <th style="text-align: left;">Product Name</th>
                        <th style="text-align: right;">TP (TK)</th>
                        <th style="text-align: right;">Inv. Qty</th>
                        <th style="text-align: right;">Vat (TK)</th>
                        <th style="text-align: right;">Total TP (Tk)</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.products.map(
            (product, idx) => `
                            <tr>
                                <td style="text-align: center;">${idx + 1}</td>
                                <td style="text-align: left;">${product.productCode}</td>
                                <td style="text-align: leftr;">${product.name}</td>
                                <td style="text-align: right;">${product.tradePrice.toLocaleString('en-IN')}/-</td>
                                <td style="text-align: right;">${product.quantity}</td>
                                <td style="text-align: right;">${0.00}/-</td>
                                <td style="text-align: right;">${((product.tradePrice) * (product.quantity)).toLocaleString('en-IN')}/-</td>
                            </tr>
                        `
        ).join('')}
                </tbody>
                <tbody>
                    <tr>
                        <!-- Merged first four columns -->
                        <td colspan="4" style="text-align: right; font-weight: bold;">Sub Total</td>
                        <td style="text-align: right;">${totalUnit}</td>
                        <td style="text-align: right;">${0.00}/-</td>
                        <td style="text-align: right;">${totalTP.toLocaleString('en-IN')}/-</td>
                    </tr>
                </tbody>
            </table>
            <div class="space-y-2 font-bold text-sm mt-2">
                <div class="grid grid-cols-[1fr_auto_1fr] items-center">
                    <span class="text-right">Grand Total</span>
                    <span class="text-center w-6">:</span>
                    <span class="text-right px-3">
                        ${0}/-
                    </span>
                </div>

                <div class="grid grid-cols-[1fr_auto_1fr] items-center">
                    <span class="text-right">
                        Less Discount (${order.discount > 0 && order.discount} %)
                    </span>
                    <span class="text-center w-6">:</span>
                    <span class="text-right px-3">
                        ${0}/-
                    </span>
                </div>

                <div class="grid grid-cols-[1fr_auto_1fr] items-center">
                    <span class="text-right">Total Payable</span>
                    <span class="text-center w-6">:</span>
                    <span class="text-right px-3">
                        ${0}/-
                    </span>
                </div>
            </div>
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