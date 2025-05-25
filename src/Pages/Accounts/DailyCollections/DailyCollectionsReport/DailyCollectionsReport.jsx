import { useEffect, useState } from "react";

const DailyCollectionsReport = ({ reportType, filteredOrders = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [orders, setOrders] = useState(filteredOrders);

    useEffect(() => {
        setOrders(filteredOrders);
    }, [filteredOrders]);

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
                ${reportType === "Customer wise Daily Collections"
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

        const groupedOrders = {};

        orders.forEach((order) => {
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const mpo = order?.orderedBy || "Unknown MPO";
            const pharmacyId = order?.pharmacyId || "Unknown Pharmacy ID";
            const pharmacyName = order?.pharmacy || "Unknown Pharmacy Name";
            const payments = order?.payments || [];

            if (!groupedOrders[areaManager]) {
                groupedOrders[areaManager] = {};
            }

            if (!groupedOrders[areaManager][mpo]) {
                groupedOrders[areaManager][mpo] = [];
            }

            payments.forEach((payment) => {
                if (payment.paid && payment.paymentType) {
                    groupedOrders[areaManager][mpo].push({
                        pharmacyId,
                        pharmacyName,
                        paymentType: payment.paymentType.toLowerCase(),
                        paidAmount: Number(payment.paid),
                    });
                }
            });
        });

        let grandTotals = { cash: 0, cheque: 0, bank: 0 };

        const groupedHTML = Object.entries(groupedOrders)
            .map(([areaManager, mpoData]) => {
                let areaManagerTotals = { cash: 0, cheque: 0, bank: 0 };

                const mpoSections = Object.entries(mpoData)
                    .map(([mpoName, pharmacies]) => {
                        const mpoOrder = orders.find(order => order.orderedBy === mpoName && order.areaManager === areaManager);
                        const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                        let mpoTotals = { cash: 0, cheque: 0, bank: 0 };

                        const rows = pharmacies
                            .map((pharmacy) => {
                                const cash = pharmacy.paymentType === "cash" ? pharmacy.paidAmount : 0;
                                const cheque = pharmacy.paymentType === "cheque" ? pharmacy.paidAmount : 0;
                                const bank = pharmacy.paymentType === "bank" ? pharmacy.paidAmount : 0;

                                mpoTotals.cash += cash;
                                mpoTotals.cheque += cheque;
                                mpoTotals.bank += bank;

                                return `
                                    <tr>
                                        <td style="padding: 8px; border: 1px solid #ccc;">${pharmacy.pharmacyId}</td>
                                        <td style="padding: 8px; border: 1px solid #ccc;">${pharmacy.pharmacyName}</td>
                                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${cash ? cash.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : ""}</td>
                                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${cheque ? cheque.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : ""}</td>
                                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${bank ? bank.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : ""}</td>
                                    </tr>
                                `;
                            })
                            .join("");

                        areaManagerTotals.cash += mpoTotals.cash;
                        areaManagerTotals.cheque += mpoTotals.cheque;
                        areaManagerTotals.bank += mpoTotals.bank;

                        return `
                            <div style="margin-bottom: 20px;">
                                <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">MPO/SCC/ASE: ${mpoName} | Territory: ${mpoTerritory}</p>
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed;">
                                    <thead>
                                        <tr>
                                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left;">Pharmacy ID</th>
                                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left;">Pharmacy Name</th>
                                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right;">Cash</th>
                                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right;">Cheque</th>
                                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right;">Bank</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rows}
                                        <tr style="font-weight: bold; background-color: #fafafa;">
                                            <td colspan="2" style="padding: 8px; border: 1px solid #ccc; text-align: left;">MPO/SCC/ASE Total</td>
                                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${mpoTotals.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${mpoTotals.cheque.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${mpoTotals.bank.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        `;
                    })
                    .join("");

                grandTotals.cash += areaManagerTotals.cash;
                grandTotals.cheque += areaManagerTotals.cheque;
                grandTotals.bank += areaManagerTotals.bank;

                return `
                    <div style="margin-bottom: 30px;">
                        <p style="margin-bottom: 5px; text-align: center; font-weight: bold; font-size: 12px;">Sr. AM/AM: ${areaManager} | Territory: ${(() => {
                        const areaOrder = orders.find(order => order.areaManager === areaManager);
                        return areaOrder?.parentTerritory || "Unknown Territory";
                    })()}
                    </p>
                        ${mpoSections}
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed;">
                            <tbody>
                                <tr style="font-weight: bold; background-color: #eee;">
                                    <td colspan="2" style="padding: 8px; border: 1px solid #ccc; text-align: left;">Area Manager Total</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${areaManagerTotals.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${areaManagerTotals.cheque.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${areaManagerTotals.bank.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            })
            .join("");

        const grandTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed;">
                <tbody>
                    <tr style="font-weight: bold; background-color: #ccc;">
                        <td colspan="2" style="padding: 10px; border: 1px solid #000; text-align: left;">Grand Total</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: right;">${grandTotals.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: right;">${grandTotals.cheque.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: right;">${grandTotals.bank.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-</td>
                    </tr>
                </tbody>
            </table>
        `;

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
            .map((style) => style.outerHTML)
            .join("");

        newWindow.document.write(`
            <html>
                <head>
                <title>Daily Collections</title>
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
                    th, td { font-size: 10px; }
                    }
                </style>
                </head>
                <body>
                    ${companyHeader}
                    ${groupedHTML}
                    ${grandTotalHTML}
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

export default DailyCollectionsReport;