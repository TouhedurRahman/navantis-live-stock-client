import { useEffect, useState } from "react";

const AllProductsSummaryExcel = ({ reportType, filteredOrders = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [orders, setOrders] = useState(filteredOrders);

    useEffect(() => {
        const sortedOrders = [...filteredOrders].sort((a, b) => {
            const getPriority = (territory) => {
                if (territory === "Doctor") return 0;
                if (territory === "Institute") return 1;
                return 2;
            };

            return getPriority(a.territory) - getPriority(b.territory);
        });

        setOrders(sortedOrders);
    }, [filteredOrders]);

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
                ${reportType === "Customer wise Products Summary All"
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

        const allProductsSummary = {};
        let totalQty = 0;
        let totalPrice = 0;

        orders.forEach(order => {
            order.products.forEach(product => {
                if (!product.name || !product.netWeight) return;

                const key = `${product.name} | ${product.netWeight}`;
                const qty = Number(product.quantity);
                const price = qty * Number(product.tradePrice);

                totalQty += qty;
                totalPrice += price;

                if (!allProductsSummary[key]) {
                    allProductsSummary[key] = {
                        productCode: product.productCode,
                        productName: product.name,
                        netWeight: product.netWeight,
                        quantity: 0,
                        totalPrice: 0
                    };
                }

                allProductsSummary[key].quantity += qty;
                allProductsSummary[key].totalPrice += price;
            });
        });

        const sortedProducts = Object.values(allProductsSummary).sort((a, b) =>
            a.productName.localeCompare(b.productName)
        );

        const summaryHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: center; width: 5%;">SL</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 12%;">Product Code</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 45%;">Product Name</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: center; width: 10%;">Pack Size</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 12%;">Quantity</th>
                        <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 16%;">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedProducts.map((product, index) => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${index + 1}</td>
                            <td style="padding: 8px; border: 1px solid #ccc;">${product.productCode}</td>
                            <td style="padding: 8px; border: 1px solid #ccc;">${product.productName}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${product.netWeight}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${product.quantity}</td>
                            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                ${product.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="4" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                            ${totalQty.toLocaleString('en-IN')}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                            ${totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        const htmlContent = `
            <html>
                <head><meta charset="UTF-8"></head>
                <body>
                    ${companyHeader}
                    ${summaryHTML}
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

export default AllProductsSummaryExcel;