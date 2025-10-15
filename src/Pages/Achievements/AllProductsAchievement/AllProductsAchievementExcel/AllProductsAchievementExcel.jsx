import { useEffect, useState } from "react";
import useTerritories from "../../../../Hooks/useTerritories";

const AllProductsAchievementExcel = ({
    currentMonthsOrders = [],
    previousMonthsOrders = [],
    twoMonthsAgoOrders = [],
    twelveMonthsAgoOrders = [],
    lastDayOrders = [],
    productKey,
    firstDate,
    lastDate
}) => {
    const [currentMosOrders, setCurrentMosOrders] = useState(currentMonthsOrders);
    const [previousMosOrders, setPreviousMosOrders] = useState(previousMonthsOrders);
    const [twoMosAgoOrders, setTwoMosAgoOrders] = useState(twoMonthsAgoOrders);
    const [twelveMosAgoOrders, setTwelveMosAgoOrders] = useState(twelveMonthsAgoOrders);
    const [todayOrders, setTodayOrders] = useState(lastDayOrders);
    const [territories] = useTerritories();

    useEffect(() => {
        setCurrentMosOrders(currentMonthsOrders);
    }, [currentMonthsOrders]);

    useEffect(() => {
        setPreviousMosOrders(previousMonthsOrders);
    }, [previousMonthsOrders]);

    useEffect(() => {
        setTwoMosAgoOrders(twoMonthsAgoOrders);
    }, [twoMonthsAgoOrders]);

    useEffect(() => {
        setTwelveMosAgoOrders(twelveMonthsAgoOrders);
    }, [twelveMonthsAgoOrders]);

    useEffect(() => {
        setTodayOrders(lastDayOrders);
    }, [lastDayOrders]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const calculateAllProductsSales = (orders) => {
        const productMap = new Map();
        orders.forEach(order => {
            order.products?.forEach(p => {
                const name = p.name?.trim() || "";
                const netWeight = p.netWeight?.trim() || "";
                const productCode = p.productCode;
                const key = `${name}|${netWeight}`;
                const qty = p.quantity || 0;
                if (!productMap.has(key)) {
                    productMap.set(key, { name, netWeight, productCode, sales: 0 });
                }
                productMap.get(key).sales += qty;
            });
        });
        return Array.from(productMap.values());
    };

    const mergeAllProducts = () => {
        const mergedMap = new Map();

        const addProducts = (products, type) => {
            products.forEach(p => {
                const key = `${p.name}|${p.netWeight}`;
                if (!mergedMap.has(key)) {
                    mergedMap.set(key, {
                        name: p.name,
                        netWeight: p.netWeight,
                        productCode: p.productCode,
                        current: 0,
                        previous: 0,
                        twoMonthsAgo: 0,
                        twelveMonthsAgo: 0,
                        lastDay: 0,
                        target: 0
                    });
                }
                mergedMap.get(key)[type] += p.sales || 0;
            });
        };

        addProducts(calculateAllProductsSales(currentMosOrders), "current");
        addProducts(calculateAllProductsSales(previousMosOrders), "previous");
        addProducts(calculateAllProductsSales(twoMosAgoOrders), "twoMonthsAgo");
        addProducts(calculateAllProductsSales(twelveMosAgoOrders), "twelveMonthsAgo");
        addProducts(calculateAllProductsSales(todayOrders), "lastDay");

        territories.forEach(t => {
            t.target?.forEach(p => {
                const key = `${p.productName}|${p.netWeight}`;
                if (!mergedMap.has(key)) {
                    mergedMap.set(key, {
                        name: p.productName,
                        netWeight: p.netWeight,
                        productCode: p.productCode,
                        current: 0,
                        previous: 0,
                        twoMonthsAgo: 0,
                        twelveMonthsAgo: 0,
                        lastDay: 0,
                        target: 0
                    });
                }
                mergedMap.get(key).target += p.targetQuantity || 0;
            });
        });

        return Array.from(mergedMap.values());
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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>All Products Target VS Sales</u></h3>
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

        let allProducts = mergeAllProducts();

        if (productKey) {
            const [filterName, filterWeight] = productKey.toLowerCase().split('|').map(s => s.trim());
            allProducts = allProducts.filter(p =>
                p.name?.toLowerCase() === filterName &&
                p.netWeight?.toLowerCase() === filterWeight
            );
        }

        allProducts.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();

            if (nameA !== nameB) return nameA.localeCompare(nameB);

            const numA = parseFloat(a.netWeight) || 0;
            const numB = parseFloat(b.netWeight) || 0;
            return numA - numB;
        });

        let totalTarget = 0, totalCurrent = 0, totalPrevious = 0,
            totalTwoMonthsAgo = 0, totalTwelveMonthsAgo = 0, totalLastDay = 0;

        let reportHTML = `
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="border:1px solid #aaa; padding:5px; text-align: center; width:5%;" rowspan="2">Sl. No.</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align: left;" rowspan="2">Product Name</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align: center;" rowspan="2">Pack Size</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align: center; width:7%;" rowspan="2">Total Target</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;" colspan="2">Current Month</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;" colspan="2">Previous Month</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;" colspan="2">Two Months Ago</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;" rowspan="2">LM<br/>Growth<br/>(%)</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;" rowspan="2">M<br/>Growth<br/>(%)</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;" rowspan="2">Y<br/>Growth<br/>(%)</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;" rowspan="2">Last Day<br/>Sales</th>
                    </tr>
                    <tr>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Sales</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Achi(%)</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Sales</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Achi(%)</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Sales</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Achi(%)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        allProducts.forEach((p, idx) => {
            const currentAchi = p.target ? ((p.current / p.target) * 100).toFixed(2) : "0.00";
            const prevAchi = p.target ? ((p.previous / p.target) * 100).toFixed(2) : "0.00";
            const twoAgoAchi = p.target ? ((p.twoMonthsAgo / p.target) * 100).toFixed(2) : "0.00";

            const lmGrowth = p.twoMonthsAgo ? (((p.previous - p.twoMonthsAgo) / p.twoMonthsAgo) * 100).toFixed(2) : "100";
            const mGrowth = p.previous ? (((p.current - p.previous) / p.previous) * 100).toFixed(2) : "100";
            const yGrowth = p.twelveMonthsAgo ? (((p.current - p.twelveMonthsAgo) / p.twelveMonthsAgo) * 100).toFixed(2) : "100";

            totalTarget += p.target;
            totalCurrent += p.current;
            totalPrevious += p.previous;
            totalTwoMonthsAgo += p.twoMonthsAgo;
            totalTwelveMonthsAgo += p.twelveMonthsAgo;
            totalLastDay += p.lastDay;

            reportHTML += `
                <tr>
                    <td style="border:1px solid #ccc; padding:4px; text-align:center;">${idx + 1}</td>
                    <td style="border:1px solid #ccc; padding:4px;">${p.name}</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:center;">${p.netWeight}</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:center;">${p.target}</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:center;">${p.current}</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:right;">${currentAchi}%</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:center;">${p.previous}</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:right;">${prevAchi}%</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:center;">${p.twoMonthsAgo}</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:right;">${twoAgoAchi}%</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:right;">${lmGrowth}%</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:right;">${mGrowth}%</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:right;">${yGrowth}%</td>
                    <td style="border:1px solid #ccc; padding:4px; text-align:center;">${p.lastDay}</td>
                </tr>
            `;
        });

        const totalCurrentAchi = totalTarget ? ((totalCurrent / totalTarget) * 100).toFixed(2) : "0.00";
        const totalPrevAchi = totalTarget ? ((totalPrevious / totalTarget) * 100).toFixed(2) : "0.00";
        const totalTwoAgoAchi = totalTarget ? ((totalTwoMonthsAgo / totalTarget) * 100).toFixed(2) : "0.00";

        const totalLmGrowth = totalTwoMonthsAgo ? (((totalPrevious - totalTwoMonthsAgo) / totalTwoMonthsAgo) * 100).toFixed(2) : "100";
        const totalMGrowth = totalPrevious ? (((totalCurrent - totalPrevious) / totalPrevious) * 100).toFixed(2) : "100";
        const totalYGrowth = totalTwelveMonthsAgo ? (((totalCurrent - totalTwelveMonthsAgo) / totalTwelveMonthsAgo) * 100).toFixed(2) : "100";

        reportHTML += `
            <tr style="font-weight:bold; background-color:#f2f2f2;">
                <td colspan="3" style="border:1px solid #aaa; padding:5px; text-align:center;">Total</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:center;">${totalTarget}</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:center;">${totalCurrent}</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:right;">${totalCurrentAchi}%</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:center;">${totalPrevious}</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:right;">${totalPrevAchi}%</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:center;">${totalTwoMonthsAgo}</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:right;">${totalTwoAgoAchi}%</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:right;">${totalLmGrowth}%</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:right;">${totalMGrowth}%</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:right;">${totalYGrowth}%</td>
                <td style="border:1px solid #aaa; padding:5px; text-align:center;">${totalLastDay}</td>
            </tr>
        `;

        reportHTML += `</tbody></table>`;

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
        link.download = `All Products Target VS Sales Date from ${firstDate} to ${lastDate}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return handleDownloadExcel;
};

export default AllProductsAchievementExcel;