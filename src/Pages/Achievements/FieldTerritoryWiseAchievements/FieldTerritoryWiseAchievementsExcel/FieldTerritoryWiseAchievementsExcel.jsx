import { useEffect, useState } from "react";
import useTerritories from "../../../../Hooks/useTerritories";

const FieldTerritoryWiseAchievementsExcel = ({
    currentMonthsOrders = [],
    previousMonthsOrders = [],
    lastDayOrders = [],
    firstDate,
    lastDate
}) => {
    const [currentMosOrders, setCurrentMosOrders] = useState(currentMonthsOrders);
    const [previousMosOrders, setPreviousMosOrders] = useState(previousMonthsOrders);
    const [todayOrders, setTodayOrders] = useState(lastDayOrders);
    const [territories] = useTerritories();

    useEffect(() => {
        setCurrentMosOrders(currentMonthsOrders);
    }, [currentMonthsOrders]);

    useEffect(() => {
        setPreviousMosOrders(previousMonthsOrders);
    }, [previousMonthsOrders]);

    useEffect(() => {
        setTodayOrders(lastDayOrders);
    }, [lastDayOrders]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const calculateUnits = (territoryName, orders) => {
        return orders
            .filter(o => o.territory === territoryName)
            .reduce((acc, o) => acc + (o.totalUnit || 0), 0);
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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Target, Sales Acievement & Growth</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">
                        Downloaded on ${now}
                    </p>
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
                    const salesCurrent = calculateUnits(territoryName, currentMosOrders);
                    const salesPrev = calculateUnits(territoryName, previousMosOrders);
                    const salesLastDay = calculateUnits(territoryName, todayOrders);

                    if (
                        salesCurrent === 0 &&
                        salesPrev === 0
                    ) {
                        delete grouped[parent][manager][territoryName];
                        return;
                    }

                    const achievementCurrent = totalTarget ? (salesCurrent / totalTarget) * 100 : 0;
                    const growth = salesPrev ? ((salesCurrent - salesPrev) / salesPrev) * 100 : 100;

                    grouped[parent][manager][territoryName] = {
                        totalTarget,
                        salesCurrent,
                        achievementCurrent,
                        growth,
                        salesLastDay
                    };
                });
                if (Object.keys(grouped[parent][manager]).length === 0) delete grouped[parent][manager];
            });
            if (Object.keys(grouped[parent]).length === 0) delete grouped[parent];
        });

        let grandTotals = { totalTarget: 0, salesCurrent: 0, salesPrev: 0, salesLastDay: 0 };

        const tableHTML = Object.entries(grouped)
            .map(([parent, managers]) => {
                let areaTotals = { totalTarget: 0, salesCurrent: 0, salesPrev: 0, salesLastDay: 0 };

                const managerTables = Object.entries(managers)
                    .map(([manager, terrs]) => {
                        const rows = Object.entries(terrs).map(([territoryName, data], i) => {
                            areaTotals.totalTarget += data.totalTarget;
                            areaTotals.salesCurrent += data.salesCurrent;
                            areaTotals.salesPrev += data.salesPrev;
                            areaTotals.salesLastDay += data.salesLastDay;

                            return `
                                <tr>
                                    <td style="border:1px solid #ccc; padding:5px; text-align: center; width: 5%;">${i + 1}</td>
                                    <td style="border:1px solid #ccc; padding:5px; text-align: left;">${territoryName}</td>
                                    <td style="border:1px solid #ccc; padding:5px; text-align: center;">${data.totalTarget}</td>

                                    <td style="border:1px solid #ccc; padding:5px; text-align: center;">${data.salesCurrent}</td>
                                    <td style="border:1px solid #ccc; padding:5px; text-align: right;">${data.achievementCurrent.toFixed(2)}%</td>

                                    <td style="border:1px solid #ccc; padding:5px; text-align: right;">${data.growth.toFixed(2)}%</td>
                                </tr>`;
                        }).join('');

                        return `
                            <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
                                <thead>
                                    <tr style="font-weight:bold;">
                                        <td colspan="6" style="padding:6px; text-align:center; font-weight:bold;">
                                            Sr. AM/AM: ${manager}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th style="border:1px solid #aaa; padding:5px; text-align: center; width: 8%;">Sl. No.</th>
                                        <th style="border:1px solid #aaa; padding:4px; text-align:left">Territory</th>
                                        <th style="border:1px solid #aaa; padding:4px; text-align:center; width: 18%;">Target</th>
                                        <th style="border:1px solid #aaa; padding:4px; text-align:center; width: 18%;">Sales</th>
                                        <th style="border:1px solid #aaa; padding:4px; text-align:right; width: 18%;">Achievement</th>
                                        <th style="border:1px solid #aaa; padding:4px; text-align:right; width: 18%;">Growth</th>
                                    </tr>
                                </thead>
                                <tbody>${rows}</tbody>
                            </table>`;
                    }).join('');

                grandTotals.totalTarget += areaTotals.totalTarget;
                grandTotals.salesCurrent += areaTotals.salesCurrent;
                grandTotals.salesPrev += areaTotals.salesPrev;
                grandTotals.salesLastDay += areaTotals.salesLastDay;

                const areaAchievementCurrent = areaTotals.totalTarget ? (areaTotals.salesCurrent / areaTotals.totalTarget) * 100 : 0;
                const areaGrowth = areaTotals.salesPrev ? ((areaTotals.salesCurrent - areaTotals.salesPrev) / areaTotals.salesPrev) * 100 : 100;

                const areaTotalsRow = `
                    <tr style="font-weight:bold; background:#f2f2f2;">
                        <td style="border:1px solid #000; padding:5px; text-align:left;" colspan="2">${parent} Total</td>
                        <td style="border:1px solid #000; padding:5px; text-align:center; width: 18%;">${areaTotals.totalTarget}</td>

                        <td style="border:1px solid #000; padding:5px; text-align:center; width: 18%;">${areaTotals.salesCurrent}</td>
                        <td style="border:1px solid #000; padding:5px; text-align:right; width: 18%;">${areaAchievementCurrent.toFixed(2)}%</td>

                        <td style="border:1px solid #000; padding:5px; text-align:right; width: 18%;">${areaGrowth.toFixed(2)}%</td>
                    </tr>`;

                return `
                    <h4 style="text-align: center; font-weight: bold; margin-bottom: 3px;">Area: ${parent}</h4>
                    ${managerTables}
                    <table style="width:100%; border-collapse: collapse; margin-bottom:20px;">
                        <tbody>${areaTotalsRow}</tbody>
                    </table>`;
            }).join('');

        const grandAchievementCurrent = grandTotals.totalTarget ? (grandTotals.salesCurrent / grandTotals.totalTarget) * 100 : 0;
        const grandGrowth = grandTotals.salesPrev ? ((grandTotals.salesCurrent - grandTotals.salesPrev) / grandTotals.salesPrev) * 100 : 100;

        const grandTotalRow = `
            <table style="width:100%; border-collapse: collapse; margin-top:20px;">
                <tbody>
                    <tr />
                    <tr style="font-weight:bold; background:#d9edf7;">
                        <td style="border:1px solid #000; padding:5px; text-align:left;" colspan="2">Grand Total</td>
                        <td style="border:1px solid #000; padding:5px; text-align:center; width: 18%;">${grandTotals.totalTarget}</td>

                        <td style="border:1px solid #000; padding:5px; text-align:center; width: 18%;">${grandTotals.salesCurrent}</td>
                        <td style="border:1px solid #000; padding:5px; text-align:right; width: 18%;">${grandAchievementCurrent.toFixed(2)}%</td>

                        <td style="border:1px solid #000; padding:5px; text-align:right; width: 18%;">${grandGrowth.toFixed(2)}%</td>
                    </tr>
                </tbody>
            </table>`;

        const htmlContent = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body>
                    ${companyHeader}
                    ${tableHTML}
                    ${grandTotalRow}
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Target, Sales Acievement & Growth Date from ${firstDate} to ${lastDate}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return handleDownloadExcel;
};

export default FieldTerritoryWiseAchievementsExcel;