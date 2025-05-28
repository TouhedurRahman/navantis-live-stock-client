import { useEffect, useState } from "react";
import useCustomer from "../../../../Hooks/useCustomer";

const DueListReport = ({ reportType, filteredOrders = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [orders, setOrders] = useState(filteredOrders);
    const [customers] = useCustomer();

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
                ${reportType === "Customer wise Due Payments"
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

        const groupedDues = {};

        orders.forEach((order) => {
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const mpo = order?.orderedBy || "Unknown MPO";
            const pharmacyId = order?.pharmacyId || "Unknown Pharmacy ID";
            const pharmacyName = order?.pharmacy || "Unknown Pharmacy Name";
            const totalPayable = Number(order?.totalPayable || 0);
            const totalPaid = Number(order?.paid || 0);
            const due = Number(order?.due || 0);

            if (due <= 0) return;

            if (!groupedDues[areaManager]) {
                groupedDues[areaManager] = {};
            }

            if (!groupedDues[areaManager][mpo]) {
                groupedDues[areaManager][mpo] = [];
            }

            const existing = groupedDues[areaManager][mpo].find(p => p.pharmacyId === pharmacyId);

            if (existing) {
                existing.totalPayable += totalPayable;
                existing.totalPaid += totalPaid;
                existing.due += due;
            } else {
                groupedDues[areaManager][mpo].push({
                    pharmacyId,
                    pharmacyName,
                    totalPayable,
                    totalPaid,
                    due
                });
            }
        });

        let grandPayble = 0;
        let grandPaid = 0;
        let grandDue = 0;

        const groupedHTML = Object.entries(groupedDues)
            .map(([areaManager, mpoData]) => {
                let areaPayble = 0;
                let areaPaid = 0;
                let areaDue = 0;

                const mpoSections = Object.entries(mpoData)
                    .map(([mpoName, pharmacies]) => {
                        const mpoOrder = orders.find(order => order.orderedBy === mpoName && order.areaManager === areaManager);
                        const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                        let mpoPayble = 0;
                        let mpoPaid = 0;
                        let mpoDue = 0;

                        const rows = pharmacies.map((pharmacy) => {
                            mpoPayble += pharmacy.totalPayable;
                            mpoPaid += pharmacy.totalPaid;
                            mpoDue += pharmacy.due;

                            return `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ccc;  width: 8%;">${pharmacy.pharmacyId}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; width: 28%;">${pharmacy.pharmacyName}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; width: 28%;">${customers.find(cus => cus.customerId === pharmacy.pharmacyId)?.address
                                }</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                ${pharmacy.totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                ${pharmacy.totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                ${pharmacy.due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `;
                        }).join("");

                        areaPayble += mpoPayble;
                        areaPaid += mpoPaid;
                        areaDue += mpoDue;

                        return `
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">
                            MPO/SCC/ASE: ${mpoName} | Territory: ${mpoTerritory}
                        </p>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                            <thead>
                                <tr>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; width: 8%;">Customer ID</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 28%;">Customer Name</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 28%;">Customer Address</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%;">Payable</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%;">Paid</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%;">Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                                <tr style="font-weight: bold; background-color: #fafafa;">
                                    <td colspan="3" style="padding: 8px; border: 1px solid #ccc;">MPO/SCC/ASE Total</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                        ${mpoPayble.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                        ${mpoPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                        ${mpoDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
                    }).join("");

                grandPayble += areaPayble;
                grandPaid += areaPaid;
                grandDue += areaDue;

                return `
            <div style="margin-bottom: 30px;">
                <p style="margin-bottom: 5px; text-align: center; font-weight: bold; font-size: 12px;">
                    Sr. AM/AM: ${areaManager} | Territory: ${(() => {
                        const areaOrder = orders.find(order => order.areaManager === areaManager);
                        return areaOrder?.parentTerritory || "Unknown Territory";
                    })()}
                </p>
                ${mpoSections}
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tbody>
                        <tr style="font-weight: bold; background-color: #eee;">
                            <td colspan="3" style="padding: 8px; border: 1px solid #ccc;">Area Manager Total</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                ${areaPayble.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-
                            </td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                ${areaPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-
                            </td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%;">
                                ${areaDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
            }).join("");

        const grandTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tbody>
                    <tr style="font-weight: bold; background-color: #ccc;">
                        <td colspan="3" style="padding: 10px; border: 1px solid #000;">Grand Due Total</td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: right; width: 12%;">
                            ${grandPayble.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-
                        </td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: right; width: 12%;">
                            ${grandPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-
                        </td>
                        <td style="padding: 10px; border: 1px solid #000; text-align: right; width: 12%;">
                            ${grandDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}/-
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
                    <title>Due Payments</title>
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
                                    ${grandTotalHTML}
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

export default DueListReport;