import { useEffect, useState } from "react";
import useTerritories from "../../../../Hooks/useTerritories";

const ProductWiseAchievementsExcel = ({
    currentMonthsOrders = [],
    previousMonthsOrders = [],
    lastDayOrders = [],
    productKey,
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

    const productWiseFiltered = productKey === '' ? false : true;

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const calculateProductSales = (territoryName, orders) => {
        const productMap = new Map();
        orders.filter(o => o.territory === territoryName).forEach(order => {
            order.products?.forEach(p => {
                const name = p.name?.trim() || "";
                const netWeight = p.netWeight?.trim() || "";
                const key = `${name}|${netWeight}`;
                const qty = p.quantity || 0;
                if (!productMap.has(key)) {
                    productMap.set(key, { name, netWeight, sales: 0 });
                }
                productMap.get(key).sales += qty;
            });
        });
        return Array.from(productMap.values());
    };

    const getTerritoryTarget = (territoryName, productName, netWeight) => {
        const territory = territories.find(t => t.territory === territoryName);
        if (!territory || !territory.target) return 0;
        const targetProduct = territory.target.find(p => p.productName === productName && p.netWeight === netWeight);
        return targetProduct ? targetProduct.targetQuantity : 0;
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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Product wise Target VS Sales</u></h3>
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

        let reportHTML = '';

        const groupedByParent = {};
        territories.forEach(t => {
            const parent = t.parentTerritory || "Unknown Area";
            if (!groupedByParent[parent]) groupedByParent[parent] = [];
            groupedByParent[parent].push(t);
        });

        Object.entries(groupedByParent).forEach(([parentArea, areaTerritories]) => {
            const validTerritories = areaTerritories.filter(t => {
                const currentSales = calculateProductSales(t.territory, currentMosOrders);
                const previousSales = calculateProductSales(t.territory, previousMosOrders);
                return currentSales.length > 0 || previousSales.length > 0;
            });

            if (validTerritories.length === 0) return;

            const areaManager = areaTerritories[0]?.areaManager || "Unknown Manager";
            reportHTML += `
                <h4 style="text-align: center; font-weight: bold; margin: 0;">&nbsp;</h4>
                <h4 style="text-align: center; font-weight: bold; margin: 0;">Area: ${parentArea}</h4>
                <h4 style="text-align: center; font-weight: bold; margin: 0;">Sr. AM/AM: ${areaManager}</h4>
            `;

            validTerritories.forEach(t => {
                const territoryName = t.territory;

                const currentSales = calculateProductSales(territoryName, currentMosOrders);
                const previousSales = calculateProductSales(territoryName, previousMosOrders);
                const lastDaySales = calculateProductSales(territoryName, todayOrders);

                if (currentSales.length === 0 && previousSales.length === 0) return;

                reportHTML += `<h4 style="text-align: left; font-weight: bold; margin-bottom: 6px;">Territory: ${territoryName}</h4>`;
                reportHTML += `
                    <table style="width:100%; border-collapse: collapse; margin-bottom:20px;">
                        <thead>
                            <tr style="background:#eee;">
                                <th style="border:1px solid #aaa; padding:4px; text-align:center;">Sl. No.</th>
                                <th style="border:1px solid #aaa; padding:4px;">Product Name</th>
                                <th style="border:1px solid #aaa; padding:4px; text-align:center; width: 10%;">Pack Size</th>
                                <th style="border:1px solid #aaa; padding:4px; text-align:center; width: 10%;">Target</th>
                                <th style="border:1px solid #aaa; padding:4px; text-align:center; width: 10%;">Sales</th>
                                <th style="border:1px solid #aaa; padding:4px; text-align:right; width: 10%;">Achievement</th>
                                <!-- <th style="border:1px solid #aaa; padding:4px; text-align:center; width: 10%;">Previous Sales</th> -->
                                <!-- <th style="border:1px solid #aaa; padding:4px; text-align:right; width: 10%;">Previous Achievement</th> -->
                                <th style="border:1px solid #aaa; padding:4px; text-align:right; width: 10%;">Growth</th>
                                <!-- <th style="border:1px solid #aaa; padding:4px; text-align:center; width: 10%;">Last Day Sales</th> -->
                            </tr>
                        </thead>
                        <tbody>
                `;

                const targetProducts = (t.target || []).map(p => `${p.productName}|${p.netWeight}`);
                let allProducts = [
                    ...new Set([
                        ...(productWiseFiltered ? [] : targetProducts),
                        ...currentSales.map(p => `${p.name}|${p.netWeight}`),
                        ...previousSales.map(p => `${p.name}|${p.netWeight}`),
                        ...lastDaySales.map(p => `${p.name}|${p.netWeight}`),
                    ])
                ];

                allProducts = allProducts.sort((a, b) => {
                    const [nameA, netA] = a.split("|");
                    const [nameB, netB] = b.split("|");

                    if (nameA.toLowerCase() !== nameB.toLowerCase()) {
                        return nameA.localeCompare(nameB);
                    }

                    const numA = parseFloat(netA) || 0;
                    const numB = parseFloat(netB) || 0;
                    return numA - numB;
                });

                let totalTarget = 0, totalCurr = 0, totalPrev = 0, totalLastDay = 0;

                allProducts.forEach((key, idx) => {
                    const [name, netWeight] = key.split("|");
                    const curr = currentSales.find(p => p.name === name && p.netWeight === netWeight) || { sales: 0 };
                    const prev = previousSales.find(p => p.name === name && p.netWeight === netWeight) || { sales: 0 };
                    const lastDay = lastDaySales.find(p => p.name === name && p.netWeight === netWeight) || { sales: 0 };

                    const target = getTerritoryTarget(territoryName, name, netWeight);

                    const achievement = target ? ((curr.sales / target) * 100).toFixed(2) : "0.00";
                    const prevAchievement = target ? ((prev.sales / target) * 100).toFixed(2) : "0.00";
                    const growth = prev.sales ? (((curr.sales - prev.sales) / prev.sales) * 100).toFixed(2) : curr.sales ? 100 : "0.00";

                    totalTarget += target;
                    totalCurr += curr.sales;
                    totalPrev += prev.sales;
                    totalLastDay += lastDay.sales;

                    reportHTML += `
                        <tr>
                            <td style="border:1px solid #ccc; padding:4px; text-align:center;">${idx + 1}</td>
                            <td style="border:1px solid #ccc; padding:4px;">${name}</td>
                            <td style="border:1px solid #ccc; padding:4px; text-align:center;">${netWeight}</td>
                            <td style="border:1px solid #ccc; padding:4px; text-align:center;">${target}</td>
                            <td style="border:1px solid #ccc; padding:4px; text-align:center;">${curr.sales}</td>
                            <td style="border:1px solid #ccc; padding:4px; text-align:right;">${achievement}%</td>
                            <!-- <td style="border:1px solid #ccc; padding:4px; text-align:center;">${prev.sales}</td> -->
                            <!-- <td style="border:1px solid #ccc; padding:4px; text-align:right;">${prevAchievement}</td> -->
                            <td style="border:1px solid #ccc; padding:4px; text-align:right;">${growth}%</td>
                            <!-- <td style="border:1px solid #ccc; padding:4px; text-align:center;">${lastDay.sales}</td> -->
                        </tr>
                    `;
                });

                /* const totalAchievement = totalTarget ? ((totalCurr / totalTarget) * 100).toFixed(2) : 0;
                const totalPrevAchievement = totalTarget ? ((totalPrev / totalTarget) * 100).toFixed(2) : 0;
                const totalGrowth = totalPrev ? (((totalCurr - totalPrev) / totalPrev) * 100).toFixed(2) : totalCurr ? 100 : 0;

                reportHTML += `
                    <tr style="background:#f2f2f2; font-weight:bold;">
                        <td colspan="3" style="border:1px solid #ccc; padding:4px; text-align:right;">Total</td>
                        <td style="border:1px solid #ccc; padding:4px; text-align:center;">${totalTarget}</td>
                        <td style="border:1px solid #ccc; padding:4px; text-align:center;">${totalCurr}</td>
                        <td style="border:1px solid #ccc; padding:4px; text-align:right;">${totalAchievement}%</td>
                        <td style="border:1px solid #ccc; padding:4px; text-align:center;">${totalPrev}</td>
                        <td style="border:1px solid #ccc; padding:4px; text-align:right;">${totalPrevAchievement}%</td>
                        <td style="border:1px solid #ccc; padding:4px; text-align:right;">${totalGrowth}%</td>
                        <td style="border:1px solid #ccc; padding:4px; text-align:center;">${totalLastDay}</td>
                    </tr>
                `; */

                reportHTML += `</tbody></table>`;
            });
        });

        const htmlContent = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body>
                    ${companyHeader}
                    ${reportHTML}
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Product wise Target VS Sales Date from ${firstDate} to ${lastDate}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return handleDownloadExcel;
};

export default ProductWiseAchievementsExcel;