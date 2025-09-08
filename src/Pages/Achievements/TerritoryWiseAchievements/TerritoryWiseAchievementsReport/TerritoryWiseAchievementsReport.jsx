import { useEffect, useState } from "react";
import useTerritories from "../../../../Hooks/useTerritories";

const TerritoryWiseAchievementsReport = ({ filteredOrders = [], firstDate, lastDate }) => {
    const [orders, setOrders] = useState(filteredOrders);
    const [territories] = useTerritories();

    useEffect(() => {
        setOrders(filteredOrders);
    }, [filteredOrders]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const shiftOneMonthBack = (dateStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        let d = new Date(year, month - 1, day);
        d.setMonth(d.getMonth() - 1);

        const lastDayPrevMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        if (day > lastDayPrevMonth) {
            d.setDate(lastDayPrevMonth);
        }
        return d;
    };

    // Get current and previous ranges
    const currentStart = new Date(firstDate + "T00:00:00").getTime();
    const currentEnd = new Date(lastDate + "T23:59:59").getTime();

    const prevStartDate = shiftOneMonthBack(firstDate);
    const prevEndDate = shiftOneMonthBack(lastDate);

    const prevRange = {
        start: new Date(prevStartDate.setHours(0, 0, 0, 0)).getTime(),
        end: new Date(prevEndDate.setHours(23, 59, 59, 999)).getTime(),
    };

    const calculateUnits = (territoryName, startTime, endTime) => {
        return orders
            .filter(o => {
                const orderTime = new Date(o.date).getTime();
                return o.territory === territoryName && orderTime >= startTime && orderTime <= endTime;
            })
            .reduce((acc, o) => acc + (o.totalUnit || 0), 0);
    };

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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Territory wise Achievements</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                </div>
                <div class="mb-1 text-sm text-gray-400 text-right italic">
                    <h3 class="">Printed on ${now}</h3>
                </div>
            </div>
        `;

        const grouped = {};

        territories.forEach((t) => {
            if (t.territory === t.parentTerritory) return;

            const parent = t.parentTerritory || "Unknown Area";
            const manager = t.areaManager || "Unknown Manager";
            const name = t.territory;

            if (!grouped[parent]) grouped[parent] = {};
            if (!grouped[parent][manager]) grouped[parent][manager] = {};
            grouped[parent][manager][name] = { totalTarget: t.totalTarget || 0 };
        });

        Object.keys(grouped).forEach((parent) => {
            Object.keys(grouped[parent]).forEach((manager) => {
                Object.keys(grouped[parent][manager]).forEach((territoryName) => {
                    const totalTarget = grouped[parent][manager][territoryName].totalTarget || 0;

                    const salesCurrent = calculateUnits(territoryName, currentStart, currentEnd);
                    const salesPrev = calculateUnits(territoryName, prevRange.start, prevRange.end);

                    const achievementCurrent = totalTarget ? (salesCurrent / totalTarget) * 100 : 0;
                    const achievementPrev = totalTarget ? (salesPrev / totalTarget) * 100 : 0;
                    const growth = salesPrev ? ((salesCurrent - salesPrev) / salesPrev) * 100 : 100;

                    grouped[parent][manager][territoryName] = {
                        totalTarget,
                        salesCurrent,
                        achievementCurrent,
                        salesPrev,
                        achievementPrev,
                        growth,
                    };
                });
            });
        });

        const tableHTML = Object.entries(grouped)
            .map(([parent, managers]) => `
                <h3>Area: ${parent}</h3>
                ${Object.entries(managers)
                    .map(([manager, terrs]) => `
                        <h4>Area Manager: ${manager}</h4>
                        <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr>
                                    <th style="border:1px solid #aaa; padding:5px;">Territory</th>
                                    <th style="border:1px solid #aaa; padding:5px;">Total Target</th>
                                    <th style="border:1px solid #aaa; padding:5px;">Sales (This Month)</th>
                                    <th style="border:1px solid #aaa; padding:5px;">Achievement % (This Month)</th>
                                    <th style="border:1px solid #aaa; padding:5px;">Sales (Previous Month)</th>
                                    <th style="border:1px solid #aaa; padding:5px;">Achievement % (Previous Month)</th>
                                    <th style="border:1px solid #aaa; padding:5px;">Growth %</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(terrs)
                            .map(([territoryName, data]) => `
                                        <tr>
                                            <td style="border:1px solid #ccc; padding:5px;">${territoryName}</td>
                                            <td style="border:1px solid #ccc; padding:5px;">${data.totalTarget}</td>
                                            <td style="border:1px solid #ccc; padding:5px;">${data.salesCurrent}</td>
                                            <td style="border:1px solid #ccc; padding:5px;">${data.achievementCurrent.toFixed(2)}%</td>
                                            <td style="border:1px solid #ccc; padding:5px;">${data.salesPrev}</td>
                                            <td style="border:1px solid #ccc; padding:5px;">${data.achievementPrev.toFixed(2)}%</td>
                                            <td style="border:1px solid #ccc; padding:5px;">${data.growth.toFixed(2)}%</td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    `).join('')}
            `).join('');

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map(
            (style) => style.outerHTML
        ).join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>Territory wise Achievements generated on ${today}</title>
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
                                    ${tableHTML}
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

export default TerritoryWiseAchievementsReport;