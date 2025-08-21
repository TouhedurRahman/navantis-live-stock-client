import { useEffect, useState } from "react";
import useCustomer from "../../../../Hooks/useCustomer";

const CustomerProductSummaryExcel = ({ reportType, filteredOrders = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [orders, setOrders] = useState(filteredOrders);
    const [customers] = useCustomer();

    useEffect(() => {
        const sortedOrders = [...filteredOrders].sort((a, b) => {
            const getPriority = (parentTerritory) => {
                if (parentTerritory === "Doctor") return 0;
                if (parentTerritory === "Institute") return 1;
                return 2;
            };

            const priorityDiff = getPriority(a.parentTerritory) - getPriority(b.parentTerritory);
            if (priorityDiff !== 0) return priorityDiff;

            return (a.parentTerritory || "").localeCompare(b.parentTerritory || "");
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
                ${reportType === "Customer wise Customer's Products Summary"
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

        const groupedByTerritory = {};
        let grandTotalQty = 0;
        let grandTotalPrice = 0;

        orders.forEach(order => {
            const pharmacyId = order?.pharmacyId || "Unknown ID";
            const parentTerritory = order?.parentTerritory || "Unknown Territory";
            const productDetails = order?.products || [];

            if (!groupedByTerritory[parentTerritory]) {
                groupedByTerritory[parentTerritory] = {};
            }

            if (!groupedByTerritory[parentTerritory][pharmacyId]) {
                groupedByTerritory[parentTerritory][pharmacyId] = {
                    products: {},
                    customerInfo: null
                };
            }

            productDetails.forEach(product => {
                if (product.name && product.netWeight && product.quantity && product.tradePrice) {
                    const productKey = `${product.name}_${product.netWeight}`;
                    const quantity = Number(product.quantity);
                    const totalPrice = quantity * Number(product.tradePrice);

                    grandTotalQty += quantity;
                    grandTotalPrice += totalPrice;

                    if (!groupedByTerritory[parentTerritory][pharmacyId].products[productKey]) {
                        groupedByTerritory[parentTerritory][pharmacyId].products[productKey] = {
                            productName: product.name,
                            netWeight: product.netWeight,
                            quantity: 0,
                            totalPrice: 0
                        };
                    }

                    groupedByTerritory[parentTerritory][pharmacyId].products[productKey].quantity += quantity;
                    groupedByTerritory[parentTerritory][pharmacyId].products[productKey].totalPrice += totalPrice;
                }
            });
        });

        Object.keys(groupedByTerritory).forEach(parentTerritory => {
            Object.keys(groupedByTerritory[parentTerritory]).forEach(pharmacyId => {
                const customer = customers.find(c => c.customerId === pharmacyId);
                if (customer) {
                    groupedByTerritory[parentTerritory][pharmacyId].customerInfo = {
                        name: customer.name,
                        address: customer.address,
                        mobile: customer.mobile
                    };
                } else {
                    groupedByTerritory[parentTerritory][pharmacyId].customerInfo = {
                        name: "Unknown Pharmacy",
                        address: "N/A",
                        mobile: "N/A"
                    };
                }
            });
        });

        const groupedHTML = Object.entries(groupedByTerritory).map(([territory, customerMap]) => {
            const customersHTML = Object.entries(customerMap).map(([pharmacyId, data]) => {
                const { name, address, mobile } = data.customerInfo;
                const productsArray = Object.values(data.products);

                let customerTotalQty = 0;
                let customerTotalPrice = 0;

                productsArray.forEach(product => {
                    customerTotalQty += product.quantity;
                    customerTotalPrice += product.totalPrice;
                });

                return `
                <div style="margin-bottom: 30px;">
                    <p style="text-align: center; margin: 5px 0 10px; font-size: 13px; line-height: 1.6;">
                        <span style="font-weight: bold;">
                            ${name} | ${pharmacyId}
                        </span><br>
                        ${address}<br>
                        ${mobile}
                    </p>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                        <thead>
                            <tr>
                                <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: left; width: 50%;">Product</th>
                                <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: center; width: 15%;">Pack Size</th>
                                <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 15%;">Quantity</th>
                                <th style="padding: 8px; border: 1px solid #aaa; background: #f0f0f0; text-align: right; width: 20%;">Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsArray.map(product => `
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #ccc;">${product.productName}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${product.netWeight}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${product.quantity}</td>
                                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">
                                        ${product.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td colspan="2" style="padding: 8px; border: 1px solid #aaa; font-weight: bold;">
                                    ${name} Total
                                </td>
                                <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                                    ${customerTotalQty.toLocaleString('en-IN')}
                                </td>
                                <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right;">
                                    ${customerTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            }).join('');

            return `
            <div>
                <h2 style="text-align: center; font-size: 18px; font-weight: bold;">
                    ${territory}
                </h2>
                ${customersHTML}
            </div>
        `;
        }).join('');

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tbody>
                    <tr />
                    <tr>
                        <td colspan="2" style="padding: 8px; border: 1px solid #aaa; font-weight: bold; width: 65%;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 15%;">
                            ${grandTotalQty.toLocaleString('en-IN')}
                        </td>
                        <td style="padding: 8px; border: 1px solid #aaa; font-weight: bold; text-align: right; width: 20%;">
                            ${grandTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    ${groupedHTML}
                    ${finalTotalHTML}
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

export default CustomerProductSummaryExcel;