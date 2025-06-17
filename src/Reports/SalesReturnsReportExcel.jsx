import { useEffect, useState } from "react";

const SalesReturnsReportExcel = ({ reportType, filteredReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [salesReturns, setSalesReturns] = useState(filteredReturns);

    useEffect(() => {
        setSalesReturns(filteredReturns);
    }, [filteredReturns]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

    const handleDownloadExcel = () => {
        const companyHeader = `
            <div>
                <div style="position: relative; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.</p>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">Hotline: +880 1322-852183</p>
                </div>
                <div style="text-align: left; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>${reportType}</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">
                        Downloaded on ${now}
                    </p>
                </div>
                ${reportType === "Customer wise Sales Returns"
                ?
                `
                        <div style="font-weight: bold;">
                            <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                                Customer Code: ${customerCode}
                            </p>
                            <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                                Customer Name: ${customerName}
                            </p>
                            <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                                Customer Address: ${customerAddress}
                            </p>
                            <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                                Mobile: +880 ${customerMobile.slice(-10, -6)}-${customerMobile.slice(-6)}
                            </p>
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
                        <tr />
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
                        <tr />
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

        const htmlContent = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body>
                    ${companyHeader}
                    ${groupedHTML}
                    ${finalTotalHTML}
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType} Date from ${firstDate} to ${lastDate}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return handleDownloadExcel;
};

export default SalesReturnsReportExcel;