import { useEffect, useState } from "react";
import useOrders from "../../../../Hooks/useOrders";

const CusInvSalesReport = ({ filteredCustomers = [], reportType }) => {
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
                totalInvoices,
                totalUnits,
                last7,
                last30,
                last90
            };
        });
    };

    const now = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    const handlePrint = () => {
        const companyHeader = `
            <div style="text-align: center; margin-bottom: 20px;">
                <img src='/images/NPL-Updated-Logo.png' alt="Company Logo"
                style="width: 150px; height: auto; margin-bottom: 5px;" />
                <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                <p style="margin: 0; font-size: 10px;">
                Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.
                </p>
                <p style="margin: 0; font-size: 10px;">Hotline: +880 1322-852183</p>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-decoration: underline;">${reportType}</h3>
            </div>
            <div style="text-align: right; font-size: 10px; font-style: italic; margin-bottom: 5px;">
                Printed on ${now}
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
                <h3 style="margin-top: 20px; margin-bottom: 3px; font-weight: bold; text-align: center;">
                    ${territory === "Doctor" ? "Doctor Requisition" : territory}
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th rowspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: center; width: 8%";>Customer ID</th>
                            <th rowspan="2" style="border: 1px solid #ccc; padding: 6px; text-align: left; width: 32%;">Customer Name</th>
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
                    : reportData.map(({ id, name, totalInvoices, totalUnits, last7, last30, last90 }) => `
                                <tr>
                                    <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${id}</td>
                                    <td style="border: 1px solid #ccc; padding: 6px;">${name}</td>
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

        const styles = [...document.querySelectorAll("link[rel=stylesheet], style")]
            .map((style) => style.outerHTML)
            .join("");

        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head>
                    <title>Customer Invoice Sales Report</title>
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

export default CusInvSalesReport;