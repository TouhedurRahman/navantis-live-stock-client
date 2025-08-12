import { useEffect, useState } from "react";
import useOrders from "../../../../Hooks/useOrders";

const CusInvSalesReport = ({ filteredCustomers = [] }) => {
    const [customers, setCustomers] = useState(filteredCustomers);
    const [orders] = useOrders();

    useEffect(() => {
        setCustomers(filteredCustomers);
    }, [filteredCustomers]);

    const diffInDays = (date1, date2) => {
        const diffTime = Math.abs(date1 - date2);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const prepareReportData = () => {
        const today = new Date();

        return customers.map((customer) => {
            const custOrders = orders.filter(
                (order) =>
                    String(order.pharmacyId).trim() === String(customer.customerId).trim()
            );

            const totalInvoices = custOrders.length;
            let last7 = 0,
                last30 = 0,
                last90 = 0;

            custOrders.forEach((order) => {
                const orderDate = new Date(order.date);
                if (isNaN(orderDate)) return;
                const daysDiff = diffInDays(today, orderDate);

                if (daysDiff <= 7) last7++;
                if (daysDiff <= 30) last30++;
                if (daysDiff <= 90) last90++;
            });

            return {
                id: customer.customerId,
                name: customer.name,
                totalInvoices,
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
                <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-decoration: underline;">Customer Invoice Sales</h3>
            </div>
            <div style="text-align: right; font-size: 10px; font-style: italic; margin-bottom: 20px;">
                Printed on ${now}
            </div>
        `;

        const reportData = prepareReportData();

        const groupedHTML = `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                <tr>
                    <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Customer ID</th>
                    <th style="border: 1px solid #ccc; padding: 6px;">Customer</th>
                    <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Total Invoices</th>
                    <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Last 7 Days</th>
                    <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Last 30 Days</th>
                    <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Last 90 Days</th>
                </tr>
                </thead>
                <tbody>
                ${reportData.length === 0
                ? `<tr><td colspan="5" style="text-align:center; padding: 8px;">No data available</td></tr>`
                : reportData
                    .map(
                        ({ id, name, totalInvoices, last7, last30, last90 }) => `
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${id}</td>
                        <td style="border: 1px solid #ccc; padding: 6px;">${name}</td>
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${totalInvoices}</td>
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last7}</td>
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last30}</td>
                        <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${last90}</td>
                    </tr>`
                    )
                    .join("")
            }
                </tbody>
            </table>
        `;

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
              }
              th, td {
                font-size: 10px;
              }
              thead {
                display: table-header-group;
              }
            }
            table {
              font-size: 12px;
              border-collapse: collapse;
            }
          </style>
        </head>
        <body>
          <div>${companyHeader}</div>
          <div>${groupedHTML}</div>
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