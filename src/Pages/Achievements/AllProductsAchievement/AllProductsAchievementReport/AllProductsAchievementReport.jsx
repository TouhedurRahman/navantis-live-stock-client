import { useEffect, useState } from "react";
import useTerritories from "../../../../Hooks/useTerritories";

const AllProductsAchievementReport = ({
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

    const productWiseFiltered = productKey === '' ? false : true;

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

    const mergeAllProducts = () => {
        const mergedMap = new Map();

        const addProducts = (products, type) => {
            products.forEach(p => {
                const key = `${p.name}|${p.netWeight}`;
                if (!mergedMap.has(key)) {
                    mergedMap.set(key, { name: p.name, netWeight: p.netWeight, current: 0, previous: 0, twoMonthsAgo: 0, twelveMonthsAgo: 0, lastDay: 0, target: 0 });
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
                    mergedMap.set(key, { name: p.productName, netWeight: p.netWeight, current: 0, previous: 0, twoMonthsAgo: 0, twelveMonthsAgo: 0, lastDay: 0, target: 0 });
                }
                mergedMap.get(key).target += p.targetQuantity || 0;
            });
        });

        return Array.from(mergedMap.values());
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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>All Products Target VS Sales</u></h3>
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

        const allProducts = mergeAllProducts();
        let reportHTML = `
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="border:1px solid #aaa; padding:5px; text-align: center; width:5%;" rowspan="2">Sl. No.</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align: left;" rowspan="2">Product Name</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align: left;" rowspan="2">Pack Size</th>
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
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Achi (%)</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Sales</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Achi (%)</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Sales</th>
                        <th style="border:1px solid #aaa; padding:5px; text-align:center;">Achi (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let totalTarget = 0, totalCurrent = 0, totalPrevious = 0, totalTwoMonthsAgo = 0, totalTwelveMonthsAgo = 0, totalLastDay = 0;

        allProducts.forEach((p, idx) => {
            const currentAchi = p.target ? ((p.current / p.target) * 100).toFixed(2) : "0.00";
            const prevAchi = p.target ? ((p.previous / p.target) * 100).toFixed(2) : "0.00";
            const twoAgoAchi = p.target ? ((p.twoMonthsAgo / p.target) * 100).toFixed(2) : "0.00";
            const twelveAgoAchi = p.target ? ((p.twelveMonthsAgo / p.target) * 100) : "0.00";

            const lmGrowth = p.twoMonthsAgo ? (((p.previous - p.twoMonthsAgo) / p.twoMonthsAgo) * 100).toFixed(2) : "100";
            const mGrowth = p.previous ? (((p.current - p.previous) / p.previous) * 100).toFixed(2) : "100";
            const yGrowth = p.totalTwelveMonthsAgo ? (((p.current - p.totalTwelveMonthsAgo) / p.totalTwelveMonthsAgo) * 100).toFixed(2) : "100";

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

        reportHTML += `</tbody></table>`;

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map(
            (style) => style.outerHTML
        ).join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>All Products Target VS Sales generated on ${today}</title>
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
                                    ${reportHTML}
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

export default AllProductsAchievementReport;