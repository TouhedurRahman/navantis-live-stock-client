import { useEffect, useState } from "react";
import useOrders from "../../../../Hooks/useOrders";

const CusInvSalesExcel = ({ filteredCustomers = [], reportType }) => {
    const [customers, setCustomers] = useState(filteredCustomers);
    const [orders] = useOrders();
    const territories = [...new Set(customers.map(customer => customer.territory))];

    useEffect(() => {
        const sortedCustomers = [...filteredCustomers].sort((a, b) => {
            const getPriority = (territory) => {
                if (territory === "Doctor") return 0;
                if (territory === "Institute") return 1;
                return 2;
            };

            return getPriority(a.territory) - getPriority(b.territory);
        });

        setCustomers(sortedCustomers);
    }, [filteredCustomers]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

    const diffInDays = (date1, date2) => {
        const diffTime = Math.abs(date1 - date2);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const prepareReportDataByTerritory = (territory) => {
        const today = new Date();
        const territoryCustomers = customers.filter(c => c.territory === territory);

        return territoryCustomers.map((customer) => {
            const custOrders = orders.filter(
                (order) =>
                    String(order.pharmacyId).trim() === String(customer.customerId).trim()
            );

            const totalInvoices = custOrders.length;
            const totalUnits = custOrders.reduce((sum, o) => sum + (o.totalUnit || 0), 0);

            let last7 = { invoices: 0, units: 0 };
            let last30 = { invoices: 0, units: 0 };
            let last90 = { invoices: 0, units: 0 };

            custOrders.forEach((order) => {
                const orderDate = new Date(order.date);
                if (isNaN(orderDate)) return;
                const daysDiff = diffInDays(today, orderDate);

                if (daysDiff <= 7) {
                    last7.invoices++;
                    last7.units += (order.totalUnit || 0);
                }
                if (daysDiff <= 30) {
                    last30.invoices++;
                    last30.units += (order.totalUnit || 0);
                }
                if (daysDiff <= 90) {
                    last90.invoices++;
                    last90.units += (order.totalUnit || 0);
                }
            });

            return {
                id: customer.customerId,
                name: customer.name,
                payMode: customer.payMode,
                totalInvoices,
                totalUnits,
                last7,
                last30,
                last90
            };
        });
    };

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
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">
                        Downloaded on ${now}
                    </p>
                </div>
            </div>
        `;

        let groupedHTML = territories.map((territory) => {
            const reportData = prepareReportDataByTerritory(territory);

            const totals = reportData.reduce(
                (acc, cur) => {
                    acc.totalInvoices += cur.totalInvoices;
                    acc.totalUnits += cur.totalUnits;
                    acc.last7Invoices += cur.last7.invoices;
                    acc.last7Units += cur.last7.units;
                    acc.last30Invoices += cur.last30.invoices;
                    acc.last30Units += cur.last30.units;
                    acc.last90Invoices += cur.last90.invoices;
                    acc.last90Units += cur.last90.units;
                    return acc;
                },
                {
                    totalInvoices: 0, totalUnits: 0,
                    last7Invoices: 0, last7Units: 0,
                    last30Invoices: 0, last30Units: 0,
                    last90Invoices: 0, last90Units: 0
                }
            );

            return `
                <table>
                    <tr />
                </table>
                <h3 style="margin-top: 20px; margin-bottom: 3px; font-weight: bold; text-align: center;">
                    ${territory === "Doctor" ? "Doctor Requisition" : territory}
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th rowspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: center; width: 8%";>Customer ID</th>
                            <th rowspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: left; width: 26%;">Customer Name</th>
                            <th rowspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: center; width: 6%;">Pay Mode</th>
                            <th colspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: center;">Total</th>
                            <th colspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: center;">Last 7 Days</th>
                            <th colspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: center;">Last 30 Days</th>
                            <th colspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: center;">Last 90 Days</th>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Invoices</th>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Units</th>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Invoices</th>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Units</th>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Invoices</th>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Units</th>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Invoices</th>
                            <th style="border: 1px solid #ccc; padding: 4px; text-align: center;">Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.length === 0
                    ? `<tr><td colspan="10" style="text-align:center; padding: 8px;">No data available</td></tr>`
                    : reportData.map(({ id, name, payMode, totalInvoices, totalUnits, last7, last30, last90 }) => `
                                <tr>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${id}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px;">${name}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center">${`${(modes => (modes.filter(mode => ["Credit", "SpIC", "STC"].includes(mode)).length === 1
                            ? modes.find(mode => ["Credit", "SpIC", "STC"].includes(mode))
                            : "Cash"))(payMode)}`}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totalInvoices}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totalUnits}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last7.invoices}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last7.units}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last30.invoices}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last30.units}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last90.invoices}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last90.units}</td>
                                </tr>
                            `).join("")
                }
                        <!-- <tr style="font-weight: bold; background: #f5f5f5;">
                            <td colspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: right;">TOTAL:</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.totalInvoices}</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.totalUnits}</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.last7Invoices}</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.last7Units}</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.last30Invoices}</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.last30Units}</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.last90Invoices}</td>
                            <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totals.last90Units}</td>
                        </tr> -->
                    </tbody>
                </table>
            `;
        }).join("");

        const htmlContent = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body>
                    ${companyHeader}
                    ${groupedHTML}
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType} Dated ${today}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return handleDownloadExcel;
};

export default CusInvSalesExcel;