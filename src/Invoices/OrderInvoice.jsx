import useAllUsers from "../Hooks/useAllUsers";
import useCustomer from "../Hooks/useCustomer";
import useOrders from "../Hooks/useOrders";

const OrderInvoice = ({ order }) => {
    const [orders] = useOrders();
    const [allUsers] = useAllUsers();
    const [customers] = useCustomer();

    const orderedBy = allUsers.find(alu => alu.email === order.email);
    const customer = customers.find(c => c.name === order.pharmacy);

    const outstandingOrders = orders.filter(outOrder =>
        outOrder._id !== order._id
        &&
        outOrder.pharmacyId === order.pharmacyId
        &&
        outOrder.status === 'outstanding'
    )

    const totalUnit = order.products.reduce((sum, product) => sum + Number(product.quantity), 0);
    const totalTP = order.products.reduce((sum, product) => sum + Number(product.quantity * product.tradePrice), 0);

    const outStandingDue = outstandingOrders.reduce((sum, order) => sum + Number(order.due), 0);

    // less discount
    const lessDiscount = Number(totalTP * (order.discount / 100));

    // net payable amount
    const netPayable = Number(totalTP - lessDiscount - (order.paid || 0) - (order.adjustedPrice || 0));

    const convertAmountToWords = (num) => {
        const ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
        ];
        const thousands = ['', 'Thousand'];

        let words = '';

        if (num === 0) {
            return 'Zero Taka Only';
        }

        // Convert integer part
        let integerPart = Math.floor(num);
        let decimalPart = Math.round((num - integerPart) * 100);

        let i = 0;
        while (integerPart > 0) {
            if (integerPart % 1000 !== 0) {
                words = `${convertHundreds(integerPart % 1000)} ${thousands[i]} ${words}`;
            }
            integerPart = Math.floor(integerPart / 1000);
            i++;
        }

        // If there's a decimal part, append 'Paisa'
        if (decimalPart > 0) {
            words += `Taka and ${convertHundreds(decimalPart)} Paisa Only`;
        }

        // If there's no decimal part, add 'Taka Only'
        if (decimalPart === 0) {
            words += 'Taka Only';
        }

        return words.trim();

        function convertHundreds(num) {
            let result = '';
            if (num > 99) {
                result += ones[Math.floor(num / 100)] + ' Hundred ';
                num %= 100;
            }
            if (num > 19) {
                result += tens[Math.floor(num / 10)] + ' ';
                num %= 10;
            }
            if (num > 0) {
                result += ones[num] + ' ';
            }
            return result.trim();
        }
    };

    const amountInWords = convertAmountToWords(netPayable);

    const handlePrint = () => {
        const companyHeader =
            `<div class="font-sans">
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
                <table class="mt-8 w-full border-collapse text-[11px]">
                    <tr>
                        <!-- First Row -->
                        <td class="p-2 border border-[#B2BEB5] w-1/3">
                            <p class="text-justify m-0 text-[11px]">
                                Haque Villa, House No-4, Block-C, Road No-3, Section-1, Kolwalapara, Mirpur-1, Dhaka-1216, Bangladesh.
                            </p>
                            <p class="text-justify m-0 text-[11px]">
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
                            <p class="m-0 text-[11px]">
                                <span class="font-bold">Dhaka Sales Depot</span> <br />
                                House No - 43 , Road No - 06 <br />
                                South Bishil <br />
                                Mirpur - 01 <br />
                                Dhaka - 1216 <br />
                                Bangladesh. <br />
                                Cell: +880 1322-852183
                            </p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] w-1/3 align-top">
                            <p class="m-0 text-[11px] font-bold">Customer Code: ${customer.customerId}</p>
                            <p class="m-0 text-[11px]">${customer.name}</p>
                            <p class="m-0 text-[11px]">${customer.address}</p>
                            <p class="m-0 text-[11px]">Cell: +880 ${customer.mobile.slice(-10, -6)}-${customer.mobile.slice(-6)}</p>
                        </td>
                        <td class="p-2 border border-[#B2BEB5] w-1/3 align-top">
                            <div class="grid grid-cols-[max-content_15px_auto] text-[11px] gap-y-1">
                                <span class="font-bold">Date</span>
                                <span class="font-bold">:</span>
                                <span>${new Date(order?.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>

                                <span class="font-bold">Invoice No.</span>
                                <span class="font-bold">:</span>
                                <span>${order?.invoice}</span>

                                <span class="font-bold">Pay Mode</span>
                                <span class="font-bold">:</span>
                                <span class="font-bold">${order?.payMode}</span>

                                <span class="font-bold">Territory</span>
                                <span class="font-bold">:</span>
                                <span>${order?.territory}</span>

                                <span class="font-bold">${orderedBy?.designation?.split(" ").map(word => word[0].toUpperCase()).join("")}</span>
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
                                <span>${new Date(order.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>`;

        const filteredTableContent = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="text-align: center;">Sl.</th>
                        <th style="text-align: left;">Product Code</th>
                        <th style="text-align: left;">Product Name</th>
                        <th style="text-align: center;">Pack Size</th>
                        <th style="text-align: center;">Batch No.</th>
                        <th style="text-align: center;">Expire</th>
                        <th style="text-align: right;">TP (TK)</th>
                        <th style="text-align: right;">Inv. Qty</th>
                        <th style="text-align: right;">Vat (TK)</th>
                        <th style="text-align: right;">Net Price (Tk)</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.products.map(
            (product, idx) => `
                            <tr>
                                <td style="text-align: center;">${idx + 1}</td>
                                <td style="text-align: left;">${product.productCode}</td>
                                <td style="text-align: left;">${product.name}</td>
                                <td style="text-align: center;">${product.netWeight}</td>
                                <td style="text-align: center;">${product.batch}</td>
                                <td style="text-align: center;">${product.expire}</td>
                                <td style="text-align: right;">${product.tradePrice}</td>
                                <td style="text-align: right;">${product.quantity}</td>
                                <td style="text-align: right;">${0.00}</td>
                                <td style="text-align: right;">${((product.tradePrice) * (product.quantity))}</td>
                            </tr>
                        `
        ).join('')}
                </tbody>
                <tbody>
                    <tr>
                        <!-- Merged first four columns -->
                        <td colspan="7" style="text-align: right; font-weight: bold;">Sub Total</td>
                        <td style="text-align: right;">${totalUnit}</td>
                        <td style="text-align: right;">${0.00}</td>
                        <td style="text-align: right;">${(Number((Number(totalTP)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-</td>
                    </tr>
                </tbody>
            </table>
            <div class="w-[40%] ml-auto text-right font-bold text-[11px] mt-2 space-y-1">
                <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <span>Grand Total</span>
                    <span>:</span>
                    <span class="w-24">${(Number((Number(totalTP)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-</span>
                </div>

                <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <span>Less Discount ${order.discount > 0 ? `(${order.discount}%)` : ``}</span>
                    <span>:</span>
                    <span class="w-24">${(Number((Number(lessDiscount)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-</span>
                </div>

                ${(order.adjustedPrice > 0) ? `
                    <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                        <span>Expire Adjust</span>
                        <span>:</span>
                        <span class="w-24">${(Number((Number(order.adjustedPrice)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-</span>
                    </div>
                    `: ``}

                ${(order.paid > 0) ? `
                    <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                        <span>Paid</span>
                        <span>:</span>
                        <span class="w-24">${(Number((Number(order.paid)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-</span>
                    </div>
                    `: ``}

                <hr class="border-t border-gray-800 my-1">

                <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2 font-bold">
                    <span>Net Payable Amount</span>
                    <span>:</span>
                    <span class="w-24">${(Number((Number(netPayable)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-</span>
                </div>
            </div>
            <div class="mt-1">
                <p class="text-[11px]"><span class="font-bold">Amount in Words: </span>${amountInWords}.</p>
            </div>
            <div class="mt-1 mb-3">
                <p class="text-[11px]"><span class="font-bold">Note: </span>Good once sold will not be taken back.</p>
            </div>
            ${outstandingOrders.length > 0 ? `
                <div>
                    <div class="mt-5 mb-1">
                        <p class="text-[11px] font-bold">Outstanding(s)</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: center;">Sl.</th>
                                <th style="text-align: center;">Invoice No.</th>
                                <th style="text-align: center;">Customer Code</th>
                                <th style="text-align: center;">Date</th>
                                <th style="text-align: right;">Payable (TK)</th>
                                <th style="text-align: right;">Paid (TK)</th>
                                <th style="text-align: right;">Due (TK)</th>
                                <th style="text-align: center;">Total Due (TK)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${outstandingOrders.map(
            (order, idx) => `
                                    <tr>
                                        <td style="text-align: center;">${idx + 1}</td>
                                        <td style="text-align: center;">${order.invoice}</td>
                                        <td style="text-align: center;">${order.pharmacyId}</td>
                                        <td style="text-align: center;">${new Date(order.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                                        <td style="text-align: right;">${order.totalPayable}</td>
                                        <td style="text-align: right;">${order.paid}</td>
                                        <td style="text-align: right;">${order.due}</td>
                                        ${idx === 0 ? `<td rowspan='${outstandingOrders.length}' style="text-align: center;">${outStandingDue.toLocaleString('en-IN')}/-</td>` : ""}
                                    </tr>
                                `
        ).join('')}
                        </tbody>
                    </table>
                </div>
            `: ``}
            <div>
                <!-- Signature Section -->
                    <table style="width: 100%; border-collapse: separate; border-spacing: 30px 0; margin-top: 200px;">
                        <tr>
                            <td style="width: 33.33%; text-align: center; border: none; border-top: 1px dotted #000; padding-top: 5px;  font-weight: bold;">Customer</td>
                            <td style="width: 33.33%; text-align: center; border: none; border-top: 1px dotted #000; padding-top: 5px;  font-weight: bold;">Depot In-charge</td>
                            <td style="width: 33.33%; text-align: center; border: none; border-top: 1px dotted #000; padding-top: 5px;  font-weight: bold;">Authorised by</td>
                        </tr>
                    </table>
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
                                font-size: 11px;
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
                                font-size: 11px;
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
        newWindow.print();
    };

    return handlePrint;
};

export default OrderInvoice;