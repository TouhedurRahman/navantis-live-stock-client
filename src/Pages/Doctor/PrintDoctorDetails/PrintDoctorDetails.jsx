import { useEffect, useState } from "react";

const PrintDoctorDetails = ({ filteredDoctors = [] }) => {
    const [doctors, setDoctors] = useState(filteredDoctors);

    useEffect(() => {
        setDoctors(filteredDoctors);
    }, [filteredDoctors]);

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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Doctors Details</u></h3>
                </div>
                <div style="text-align: right; font-size: 12px; font-style: italic;">
                    Printed on ${now}
                </div>
            </div>
        `;

        // Group doctors by territory
        const grouped = doctors.reduce((acc, doctor) => {
            const key = doctor.territory || "Unknown";
            if (!acc[key]) acc[key] = [];
            acc[key].push(doctor);
            return acc;
        }, {});

        // Create HTML table per territory
        const groupedTables = Object.entries(grouped).map(([territory, doctortList]) => {
            const rows = doctortList.map(doctor => `
                <tr>
                    <td>
                        <p style="text-align: center">${doctor.doctorId}</p>
                    </td>
                    <td>
                        <p>${doctor.name}</p>
                    </td>
                    <td>
                        <p>${doctor.designation}</p>
                    </td>
                    <td>
                        <p>${doctor.speciality}</p>
                    </td>
                    <td>
                        <p>${doctor.qualification}</p>
                    </td>
                    <td style='text-align: center;'>
                        <p>${doctor.category}</p>
                    </td>
                    <td>
                        <p>${doctor.visitingAddress}</p>
                    </td>
                    <td>
                        <p>${doctor.chamberName}</p>
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
                                <th style='text-align: center; width: 10%'>Doctor<br />ID</th>
                                <th>Doctor Name</th>
                                <th>Designation</th>
                                <th>Speciality</th>
                                <th>Qualification</th>
                                <th style='text-align: center;'>Category</th>
                                <th>Visiting Address</th>
                                <th>Chamber</th>
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

export default PrintDoctorDetails;