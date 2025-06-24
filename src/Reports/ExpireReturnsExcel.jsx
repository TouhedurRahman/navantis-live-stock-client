import { useEffect, useState } from "react";
import useCustomer from "../Hooks/useCustomer";

const ExpireReturnsExcel = ({ reportType, filteredExReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [expireReturns, setReturns] = useState(filteredExReturns);
    const [customers] = useCustomer();

    useEffect(() => {
        setReturns(filteredExReturns);
    }, [filteredExReturns]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

    const handleDownloadExcel = () => {
        const companyHeader = `
            <div>
                <div style="position: relative; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.</p>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">Hotline: +880 1322-852183</p>
                </div>
                <div style="text-align: left; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>${reportType}</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                    <p style="margin: 5px 0; font-size: 10px; text-align: center;">
                        Downloaded on ${now}
                    </p>
                </div>
                ${reportType === "Customer wise Expire Returns"
                ?
                `
                    <div style="font-weight: bold;">
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Customer Code: ${customerCode}
                        </p>
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Customer Name: ${customerName}
                        </p>
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Customer Address: ${customerAddress}
                        </p>
                        <p style="margin: 5px 0; font-size: 11px; text-align: left;">
                            Mobile: +880 ${customerMobile.slice(-10, -6)}-${customerMobile.slice(-6)}
                        </p>
                    </div>
                `
                :
                ""
            }
            </div>
        `;

        const groupedReturns = {};

        expireReturns.forEach((order) => {
            const areaManager = order?.areaManager || "Unknown Area Manager";
            const mpo = order?.returnedBy || "Unknown MPO";
            const pharmacyId = order?.pharmacyId || "Unknown Pharmacy ID";
            const pharmacyName = order?.pharmacy || "Unknown Pharmacy Name";
            const totalQuantity = Number(order?.totalQuantity || 0);
            const totalPrice = Number(order?.totalPrice || 0);

            if (!groupedReturns[areaManager]) {
                groupedReturns[areaManager] = {};
            }

            if (!groupedReturns[areaManager][mpo]) {
                groupedReturns[areaManager][mpo] = [];
            }

            const existing = groupedReturns[areaManager][mpo].find(p => p.pharmacyId === pharmacyId);

            if (existing) {
                existing.totalQuantity += totalQuantity;
                existing.totalPrice += totalPrice;
            } else {
                groupedReturns[areaManager][mpo].push({
                    pharmacyId,
                    pharmacyName,
                    totalQuantity,
                    totalPrice
                });
            }
        });

        let grandQuantity = 0;
        let grandPrice = 0;

        const groupedHTML = Object.entries(groupedReturns).map(([areaManager, mpoData]) => {
            let areaQuantity = 0;
            let areaPrice = 0;

            const mpoSections = Object.entries(mpoData).map(([mpoName, pharmacies]) => {
                const mpoTerritory = expireReturns.find(order => order.returnedBy === mpoName && order.areaManager === areaManager)?.territory || "Unknown Territory";

                let mpoQuantity = 0;
                let mpoPrice = 0;

                const rows = pharmacies.map(pharmacy => {
                    mpoQuantity += pharmacy.totalQuantity;
                    mpoPrice += pharmacy.totalPrice;

                    return `
                        <tr>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${pharmacy.pharmacyId}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${pharmacy.pharmacyName}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${customers.find(c => c.customerId === pharmacy.pharmacyId)?.address || "N/A"}</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${pharmacy.totalQuantity}</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${pharmacy.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `;
                }).join("");

                areaQuantity += mpoQuantity;
                areaPrice += mpoPrice;

                return `
                <div style="margin-bottom: 20px;">
                    <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">
                    MPO/SCC/ASE: ${mpoName} | Territory: ${mpoTerritory}
                    </p>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: center; width: 8%;">Cus. ID</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 27%;">Customer Name</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left;">Customer Address</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%;">Total Quantity</th>
                            <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                        <tr style="font-weight: bold; background-color: #fafafa;">
                        <td colspan="3" style="padding: 8px; border: 1px solid #ccc;">MPO/SCC/ASE Total</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${mpoQuantity}</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${mpoPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr />
                    </tbody>
                    </table>
                </div>
                `;
            }).join("");

            grandQuantity += areaQuantity;
            grandPrice += areaPrice;

            const parentTerritory = expireReturns.find(order => order.areaManager === areaManager)?.parentTerritory || "Unknown Territory";

            return `
                <div style="margin-bottom: 30px;">
                <p style="margin-bottom: 5px; text-align: center; font-weight: bold; font-size: 12px;">
                    Sr. AM/AM: ${areaManager} | Territory: ${parentTerritory}
                </p>
                ${mpoSections}
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tbody>
                    <tr style="font-weight: bold; background-color: #eee;">
                        <td colspan="3" style="padding: 8px; border: 1px solid #ccc;">Area Manager Total</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%; width: 12%;">${areaQuantity}</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: right; width: 12%; width: 12%;">${areaPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr />
                    </tbody>
                </table>
                </div>
            `;
        }).join("");

        const grandTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tbody>
                <tr style="font-weight: bold; background-color: #ccc;">
                    <td colspan="3" style="padding: 10px; border: 1px solid #000;">Grand Total</td>
                    <td style="padding: 10px; border: 1px solid #000; text-align: right; width: 12%;">${grandQuantity}</td>
                    <td style="padding: 10px; border: 1px solid #000; text-align: right; width: 12%;">${grandPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
                </tbody>
            </table>
        `;

        const htmlContent = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body>
                    ${companyHeader}
                    ${groupedHTML}
                    ${grandTotalHTML}
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType} Date from ${firstDate} to ${lastDate}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return handleDownloadExcel;
};

export default ExpireReturnsExcel;