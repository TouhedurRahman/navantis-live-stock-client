import { useEffect, useState } from "react";

const SalesReturnsReport = ({ reportType, filteredReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [salesReturns, setSalesReturns] = useState(filteredReturns);

    useEffect(() => {
        setSalesReturns(filteredReturns);
    }, [filteredReturns]);

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
                ${reportType === "Customer wise Sales Returns"
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

        const groupedInvoices = {};
        let grandTotalQty = 0;
        let grandTotalPrice = 0;

        salesReturns.forEach(salesReturn => {
            const {
                date,
                invoice,
                pharmacyId,
                pharmacy,
                orderedBy: mpo,
                areaManager: am,
                products = []
            } = salesReturn;

            const totalQty = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
            const totalPrice = products.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.tradePrice || 0)), 0);

            if (!groupedInvoices[am]) groupedInvoices[am] = {};
            if (!groupedInvoices[am][mpo]) groupedInvoices[am][mpo] = {};

            if (!groupedInvoices[am][mpo][invoice]) {
                groupedInvoices[am][mpo][invoice] = {
                    date,
                    pharmacyId,
                    pharmacy,
                    totalQty: 0,
                    totalPrice: 0
                };
            }

            // Sum qty and price if invoice already exists
            groupedInvoices[am][mpo][invoice].totalQty += totalQty;
            groupedInvoices[am][mpo][invoice].totalPrice += totalPrice;

            grandTotalQty += totalQty;
            grandTotalPrice += totalPrice;
        });

        const groupedHTML = Object.entries(groupedInvoices).map(([am, mpoGroup]) => {
            let amTotalQty = 0;
            let amTotalPrice = 0;

            const mpoHTML = Object.entries(mpoGroup).map(([mpo, invoices]) => {
                const mpoOrder = salesReturns.find(salesReturn => salesReturn.orderedBy === mpo && salesReturn.areaManager === am);
                const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                let mpoTotalQty = 0;
                let mpoTotalPrice = 0;

                const invoicesHTML = Object.entries(invoices).map(([invoiceNo, inv]) => {
                    mpoTotalQty += inv.totalQty;
                    mpoTotalPrice += inv.totalPrice;

                    return `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${new Date(inv.date).toISOString().split('T')[0].split('-').reverse().join('-')}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${invoiceNo}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${inv.pharmacyId}</td>
                    <td style="padding: 8px; border: 1px solid #ccc;">${inv.pharmacy}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${inv.totalQty.toLocaleString('en-IN')}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                        ${inv.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
            `;
                }).join('');

                amTotalQty += mpoTotalQty;
                amTotalPrice += mpoTotalPrice;

                return `
            <div style="margin-bottom: 20px;">
                <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">MPO/SCC/ASE: ${mpo} | Territory: ${mpoTerritory}</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; width: 10%;">Date</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; width: 15%;">Invoice No.</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; width: 10%;">Cus. ID</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left;">Customer Name</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 10%;">Total Unit</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 15%;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoicesHTML}
                        <tr>
                            <td colspan="4" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">MPO/SCC/ASE Total</td>
                            <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 10%;">
                                ${mpoTotalQty.toLocaleString('en-IN')}
                            </td>
                            <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 15%;">
                                ${mpoTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
            }).join('');

            return `
        <div style="margin-bottom: 30px;">
            <p style="margin-bottom: 5px; text-align: center; font-weight: bold; font-size: 12px;">Sr. AM/AM: ${am} | Territory: ${(() => {
                    const areaOrder = salesReturns.find(salesReturn => salesReturn.areaManager === am);
                    return areaOrder?.parentTerritory || "Unknown Territory";
                })()}
            </p>
            ${mpoHTML}
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tbody>
                        <tr>
                            <td colspan="4" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">Area Manager Total</td>
                            <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 10%;">
                                ${amTotalQty.toLocaleString('en-IN')}
                            </td>
                            <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 15%;">
                                ${amTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        }).join('');

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tbody>
                    <tr>
                        <td colspan="4" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 10%;">
                            ${grandTotalQty.toLocaleString('en-IN')}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 15%;">
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
                    <title>Products Sales Returns</title>
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
                                    ${groupedHTML}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="100%">
                                    ${finalTotalHTML}
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

export default SalesReturnsReport;