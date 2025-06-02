import useAllUsers from "../Hooks/useAllUsers";
import useCustomer from "../Hooks/useCustomer";
import useOrders from "../Hooks/useOrders";

const OrderInvoice = ({ order }) => {
    const [orders] = useOrders();
    const [allUsers] = useAllUsers();
    const [customers] = useCustomer();

    const orderedBy = allUsers.find(alu => alu.email === order.email);

    const customer = customers.find(c =>
        c.customerId === order.pharmacyId
    );

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
                <div style="position: relative; text-align: center;">
                    <img src='/images/NPL-Updated-Logo.png' alt="Company Logo"
                        style="left: 0; width: 150px; height: auto;" />
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                    <p style="margin: 0; font-size: 10px;">
                        House No - 4, Block - C, Road No - 3, Mirpur - 1, Dhaka - 1216
                    </p>
                    <hr class="border border-b-0 border-black my-1"/>
                    <h1 style="font-size: 18px; font-weight: bold;">INVOICE</h1>
                </div>

                <!-- Table Section -->
                <table class="mt-1 w-full border-collapse text-[10px]">
                    <tr>
                        <td class="p-2 border border-r-0 border-b-0 w-[60%] align-top">
                            <div class="grid grid-cols-[max-content_15px_auto] text-[10px] gap-y-1">
                                <span class="font-bold">Customer ID</span>
                                <span class="font-bold">:</span>
                                <span>${customer.customerId}</span>

                                <span class="font-bold">Customer Name</span>
                                <span class="font-bold">:</span>
                                <span class="font-bold">${customer.name}</span>

                                <span class="font-bold">Customer Address</span>
                                <span class="font-bold">:</span>
                                <span>${customer.address}</span>

                                <span class="font-bold">Phone Number</span>
                                <span class="font-bold">:</span>
                                <span>+880 ${customer.mobile.slice(-10, -6)}-${customer.mobile.slice(-6)}</span>

                                ${order?.territory !== "Institute"
                ?
                `<span class="font-bold">Territory</span>
                        <span class="font-bold">:</span>
                        <span class="font-bold">${order?.territory}</span>`
                :
                ""
            }
                            </div>
                        </td>
                        <td class="p-2 border border-l-0 border-b-0 w-[40%] align-top">
                            <div class="grid grid-cols-[max-content_15px_auto] text-[10px] gap-y-1">
                                <span class="font-bold">Invoice No.</span>
                                <span class="font-bold">:</span>
                                <span>${order.invoice}</span>

                                <span class="font-bold">Invoice Date</span>
                                <span class="font-bold">:</span>
                                <span>${new Date(order.date).toISOString().split('T')[0].split('-').reverse().join('-')}</span>

                                <span class="font-bold">Invoice Type</span>
                                <span class="font-bold">:</span>
                                <span class="font-bold">${order?.payMode}</span>

                                ${orderedBy?.name
                ?
                `<span class="font-bold">Ordered by</span>
                        <span class="font-bold">:</span>
                        <span>${orderedBy?.name}</span>`
                :
                ""
            }

                                <span class="font-bold">Delivered by</span>
                                <span class="font-bold">:</span>
                                <span>${order.deliveryMan}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>`;

        const filteredTableContent = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: center; width: 3%;">Sl.</th>
                        <th style="text-align: left; width: 7%;">Code</th>
                        <th style="text-align: left;">Product Name</th>
                        <th style="text-align: center; width: 8%;">Pack Size</th>
                        <th style="text-align: center; width: 6%;">Batch</th>
                        <th style="text-align: center; width: 6%;">Expire</th>
                        <th style="text-align: right; width: 7%;">TP</th>
                        <th style="text-align: right; width: 7%;">Quantity</th>
                        <th style="text-align: right; width: 3%;">Vat</th>
                        <th style="text-align: right; width: 12%;">Net Price</th>
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
                                <td style="text-align: right;">${(Number((Number(product.tradePrice)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="text-align: right;">${product.quantity}</td>
                                <td style="text-align: right;">${0.00}</td>
                                <td style="text-align: right;">${(Number(((product.tradePrice) * (product.quantity)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
                        <td style="text-align: right;">${(Number((Number(totalTP)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>
            <div class="border border-black border-t-0 px-[2px]">
                <div class="w-[40%] ml-auto text-right font-bold text-[10px] space-y-1">
                    <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                        <span>Grand Total</span>
                        <span>:</span>
                        <span class="w-24">${(Number((Number(totalTP)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                        <span>Less Discount ${order.discount > 0 ? `(${order.discount}%)` : ``}</span>
                        <span>:</span>
                        <span class="w-24">${(Number((Number(lessDiscount)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    ${(order.adjustedPrice > 0) ? `
                        <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                            <span>Expire Adjust</span>
                            <span>:</span>
                            <span class="w-24">${(Number((Number(order.adjustedPrice)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        `: ``}

                    ${(order.paid > 0) ? `
                        <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                            <span>Paid</span>
                            <span>:</span>
                            <span class="w-24">${(Number((Number(order.paid)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        `: ``}

                    <hr class="border-t border-gray-800 my-1">

                    <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2 font-bold">
                        <span>Net Payable Amount</span>
                        <span>:</span>
                        <span class="w-24">${(Number((Number(netPayable)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
                <div class="mt-1">
                    <p class="text-[10px]"><span class="font-bold">Amount in Words: </span>${amountInWords}.</p>
                </div>
                <div class="mt-1 mb-3">
                    <p class="text-[10px]"><span class="font-bold">Note: </span>Good once sold will not be taken back.</p>
                </div>
            </div>
            ${outstandingOrders.length > 0 ? `
                <div class="mt-3">
                    <table border="1" style="border-collapse: collapse; width: 40%;">
                        <tr>
                            <td>Previous Outstanding</td>
                            <td class="text-right">${(Number((Number(outStandingDue)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td>Current Invoice Value</td>
                            <td class="text-right">${(Number((Number(netPayable)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td>Total Outstanding</td>
                            <td class="text-right">${(Number((Number(outStandingDue + netPayable)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </table>

                    <div class="mt-3 mb-1">
                        <p class="text-[10px] font-bold">Previous Outstanding Invoices</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: center;">Sl. No.</th>
                                <th style="text-align: left;">Date</th>
                                <th style="text-align: left;">Invoice No.</th>
                                <th style="text-align: center;">Terms</th>
                                <th style="text-align: right;">Net Outstanding</th>
                                <th style="text-align: Center;">Aging (Days)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${outstandingOrders.map(
            (order, idx) => `
                                    <tr>
                                        <td style="text-align: center;">${idx + 1}</td>
                                        <td style="text-align: left;">${new Date(order.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                                        <td style="text-align: left;">${order.invoice}</td>
                                        <td style="text-align: center;">${order.payMode.toUpperCase()}</td>
                                        <td style="text-align: right;">${(Number((Number(order.due)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td style="text-align: center;">${`${Math.floor((new Date() - new Date(order.date)) / (1000 * 60 * 60 * 24))}`}</td>
                                    </tr>
                                `
        ).join('')}
                        </tbody>
                        <tbody>
                            <tr>
                                <!-- Merged first four columns -->
                                <td colspan="4" style="text-align: right; font-weight: bold;">Total</td>
                                <td style="text-align: right;">${(Number((Number(outStandingDue)).toFixed(2))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `: ``}
            <div>
                <!-- Signature Section -->
                    <table style="width: 100%; border-collapse: separate; border-spacing: 30px 0; margin-top: 150px;">
                        <tr>
                            <td style="width: 25%; text-align: center; border: none; border-top: 1px solid #000; padding-top: 5px;  font-weight: bold;">Customer</td>
                            <td style="width: 25%; text-align: center; border: none; border-top: 1px solid #000; padding-top: 5px;  font-weight: bold;">Depot In-charge</td>
                            <td style="width: 25%; text-align: center; border: none; border-top: 1px solid #000; padding-top: 5px;  font-weight: bold;">Accounts</td>
                            <td style="width: 25%; text-align: center; border: none; border-top: 1px solid #000; padding-top: 5px;  font-weight: bold;">Authorised by</td>
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
                                margin: 8mm;
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
                                padding: 2px;
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
                                font-size: 10px;
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

export default OrderInvoice;