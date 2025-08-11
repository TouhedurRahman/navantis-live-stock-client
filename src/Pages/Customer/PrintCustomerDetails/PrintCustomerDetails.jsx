import { useEffect, useState } from "react";

const PrintCustomerDetails = ({ filteredCustomers = [] }) => {
    const [customers, setCustomers] = useState(filteredCustomers);

    useEffect(() => {
        const sorted = [...filteredCustomers].sort((a, b) => {
            const priority = t => (t === "Doctor" ? 0 : t === "Institute" ? 1 : 2);
            return priority(a.territory) - priority(b.territory);
        });
        setCustomers(sorted);
    }, [filteredCustomers]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

    const handlePrint = () => {
        const companyHeader = `
            <div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src='/images/NPL-Updated-Logo.png' alt="Company Logo" style="width: 150px;" />
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                    <p style="margin: 0; font-size: 10px;">Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.</p>
                    <p style="margin: 0; font-size: 10px;">Hotline: +880 1322-852183</p>
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Customer Details</u></h3>
                </div>
                <div style="text-align: right; font-size: 12px; font-style: italic;">
                    Printed on ${now}
                </div>
            </div>
        `;

        // Group customers by territory
        const grouped = customers.reduce((acc, c) => {
            const key = c.territory || "Unknown";
            if (!acc[key]) acc[key] = [];
            acc[key].push(c);
            return acc;
        }, {});

        // Create HTML table per territory
        const groupedTables = Object.entries(grouped).map(([territory, custList]) => {
            const rows = custList.map(c => `
                <tr>
                    <td>
                        <p style="text-align: center">${c.customerId}</p>
                    </td>
                    <td>
                        <p>${c.name}</p>
                    </td>
                    <td>
                        <p>${c.address}</p>
                    </td>
                    <td style="text-align: center">
                        <p>${c.mobile}</p>
                    </td>
                    <td>
                        <p>${[...(c.payMode || [])].reverse().join(", ")}</p>
                    </td>
                    <td>
                        <p style="text-align: right">${(c.crLimit || 0).toLocaleString('en-IN')}</p>
                    </td>
                    <td>
                        <p style="text-align: right">${c.dayLimit}</p>
                    </td>
                </tr>
            `).join("");

            return `
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 10px; font-size: 15px; text-align: center">
                        ${territory === "Doctor" ? "Doctor Requisition" : `${territory}`}
                    </h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style='text-align: center; width: 10%'>Customer<br />ID</th>
                                <th style='width: 23%'>Customer Name</th>
                                <th style='width: 23%'>Customer Address</th>
                                <th style='width: 14%; text-align: center'>Phone</th>
                                <th style='width: 10%'>Pay Mode</th>
                                <th style='text-align: right; width: 10%'>Cr. Limit</th>
                                <th style='text-align: right; width: 10%'>Day Limit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            `;
        }).join("");

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
            .map(style => style.outerHTML)
            .join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>Customer Details</title>
                    ${styles}
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 10px;
                            margin: 0;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 10px;
                        }
                        th, td {
                            border: 1px solid #aaa;
                            padding: 6px;
                            font-size: 11px;
                            text-align: left;
                        }
                        th {
                            background-color: #f0f0f0;
                        }
                        h4 {
                            margin: 20px 0 10px 0;
                            font-size: 14px;
                            font-weight: bold;
                            border-bottom: 1px solid #ccc;
                            padding-bottom: 4px;
                        }
                        @media print {
                            @page {
                                size: A4;
                                margin: 10mm;
                            }
                            thead {
                                display: table-header-group;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${companyHeader}
                    ${groupedTables}
                </body>
            </html>
        `);

        newWindow.document.close();
        newWindow.onload = () => {
            setTimeout(() => {
                newWindow.focus();
                newWindow.print();
            }, 300);
        };
    };

    return handlePrint;
};

export default PrintCustomerDetails;