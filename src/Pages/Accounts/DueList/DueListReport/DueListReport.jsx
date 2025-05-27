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
                ${reportType === "Customer wise Net Sales"
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
                existing.due += due;
            } else {
                groupedDues[areaManager][mpo].push({
                    pharmacyId,
                    pharmacyName,
                    due,
                });
            }
        });

        let grandDue = 0;

        const groupedHTML = Object.entries(groupedDues)
            .map(([areaManager, mpoData]) => {
                let areaDue = 0;

                const mpoSections = Object.entries(mpoData)
                    .map(([mpoName, pharmacies]) => {
                        const mpoOrder = orders.find(order => order.orderedBy === mpoName && order.areaManager === areaManager);
                        const mpoTerritory = mpoOrder?.territory || "Unknown Territory";

                        let mpoDue = 0;

                        const rows = pharmacies.map((pharmacy) => {
                            mpoDue += pharmacy.due;

                            return `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ccc;">${pharmacy.pharmacyId}</td>
                            <td style="padding: 8px; border: 1px solid #ccc;">${pharmacy.pharmacyName}</td>
                            <td style="padding: 8px; border: 1px solid #ccc;">${customers.find(cus => cus.customerId === pharmacy.pharmacyId)?.address
                                }</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                ${pharmacy.due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `;
                        }).join("");

                        areaDue += mpoDue;

                        return `
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">
                            MPO/SCC/ASE: ${mpoName} | Territory: ${mpoTerritory}
                        </p>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                            <thead>
                                <tr>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0;">Customer ID</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0;">Customer Name</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0;">Customer Address</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right;">Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                                <tr style="font-weight: bold; background-color: #fafafa;">
                                    <td colspan="3" style="padding: 8px; border: 1px solid #ccc;">MPO/SCC/ASE Total</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                        ${mpoDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
                    }).join("");

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
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
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
                        <td style="padding: 10px; border: 1px solid #000; text-align: right;">
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
                    <title>Net Sales</title>
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