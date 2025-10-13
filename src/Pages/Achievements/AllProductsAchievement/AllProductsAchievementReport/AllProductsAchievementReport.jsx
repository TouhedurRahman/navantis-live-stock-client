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

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

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
    }

    return handlePrint;
};

export default AllProductsAchievementReport;