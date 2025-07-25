import { useEffect, useState } from "react";

const InvoiceSalesSummaryReport = ({ reportType, filteredOrders = [], orderReturns = [], firstDate, lastDate, customerCode, customerName, customerAddress, customerMobile }) => {
    const [orders, setOrders] = useState(filteredOrders);
    const [returns, setReturns] = useState(orderReturns);

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

    useEffect(() => {
        setReturns(orderReturns);
    }, [orderReturns]);

    const now = new Date().toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
    });

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
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>${reportType}</u></h3>
                    <p style="margin: 5px 0; font-size: 14px; text-align: center;">
                        ${(firstDate !== lastDate)
                ? `Date from <b>${firstDate}</b> to <b>${lastDate}</b>`
                : `Date <b>${firstDate}</b>`}
                    </p>
                </div>
                <div class="mb-1 text-sm text-gray-400 text-right italic">
                    <h3 class="">Printed on ${now}</h3>
                </div>
                ${reportType === "Customer wise Invoice Sales Summary"
                ?
                `
                <div style="display: flex; flex-direction: column; gap: 2px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">
                    <div class="grid grid-cols-[max-content_15px_auto] text-[11px] gap-y-1">
                        <span class="font-bold">Customer Code</span>
                        <span class="font-bold">:</span>
                        <span>${customerCode}</span>

                        <span class="font-bold">Customer Name</span>
                        <span class="font-bold">:</span>
                        <span>${customerName}</span>

                        <span class="font-bold">Customer Address</span>
                        <span class="font-bold">:</span>
                        <span>${customerAddress}</span>

                        <span class="font-bold">Mobile</span>
                        <span class="font-bold">:</span>
                        <span>+880 ${customerMobile.slice(-10, -6)}-${customerMobile.slice(-6)}</span>
                    </div>
                </div>
                `
                :
                ""
            }
            </div>
        `;

        const groupedInvoices = {};
        let grandSold = 0, grandReturn = 0, grandPayable = 0, grandPaid = 0, grandDue = 0;

        orders.forEach(order => {
            const { areaManager = "Unknown AM", parentTerritory = "Unknown Territory", orderedBy = "Unknown MPO" } = order;
            const invoice = order.invoice;
            if (!invoice) return;

            if (!groupedInvoices[areaManager]) groupedInvoices[areaManager] = {};
            if (!groupedInvoices[areaManager][parentTerritory]) groupedInvoices[areaManager][parentTerritory] = {};
            if (!groupedInvoices[areaManager][parentTerritory][orderedBy]) groupedInvoices[areaManager][parentTerritory][orderedBy] = {};
            if (!groupedInvoices[areaManager][parentTerritory][orderedBy][invoice]) {
                groupedInvoices[areaManager][parentTerritory][orderedBy][invoice] = {
                    orderDate: order.date,
                    soldAmount: order.soldAmount || order.totalPrice,
                    totalPayable: order.totalPayable || 0,
                    paid: (order.totalPayable || 0) - (order.due || 0),
                    due: order.due || 0,
                    returnAmount: 0,
                    mpoTerritory: order.territory,
                    payments: order.payments || []
                };
            }
        });

        returns.forEach(ret => {
            const invoice = ret.invoice;
            if (!invoice) return;

            for (const am in groupedInvoices) {
                for (const terr in groupedInvoices[am]) {
                    for (const mpo in groupedInvoices[am][terr]) {
                        if (groupedInvoices[am][terr][mpo][invoice]) {
                            const totalReturn = ret.products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
                            groupedInvoices[am][terr][mpo][invoice].returnAmount += totalReturn;
                        }
                    }
                }
            }
        });

        const groupedHTML = Object.entries(groupedInvoices).map(([areaManager, territories]) => {
            let areaManagerSold = 0, areaManagerReturn = 0, areaManagerPayable = 0, areaManagerPaid = 0, areaManagerDue = 0;

            const territoryHTML = Object.entries(territories).map(([parentTerritory, mpoList]) => {
                let territorySold = 0, territoryReturn = 0, territoryPayable = 0, territoryPaid = 0, territoryDue = 0;

                const mpoHTML = Object.entries(mpoList).map(([mpoName, invoiceList]) => {
                    let mpoSold = 0, mpoReturn = 0, mpoPayable = 0, mpoPaid = 0, mpoDue = 0;

                    const firstInvoice = Object.values(invoiceList)[0];
                    const mpoTerritory = firstInvoice?.mpoTerritory;

                    const invoiceRows = Object.entries(invoiceList).map(([invoice, data]) => {
                        mpoSold += data.soldAmount;
                        mpoReturn += data.returnAmount;
                        mpoPayable += data.totalPayable;
                        mpoPaid += data.paid;
                        mpoDue += data.due;

                        grandSold += data.soldAmount;
                        grandReturn += data.returnAmount;
                        grandPayable += data.totalPayable;
                        grandPaid += data.paid;
                        grandDue += data.due;

                        return `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${invoice}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                    ${new Date(data.orderDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                </td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                                ${data.payments && data.payments.length > 0
                                ? new Date(Math.max(...data.payments.map(p => new Date(p.paidDate).getTime())))
                                    .toLocaleDateString('en-GB')
                                    .replace(/\//g, '-')
                                : '-'
                            }
                                </td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.soldAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <!-- <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td> -->
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${data.due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
                                    ${data.due === 0
                                ? 0
                                : Math.floor((new Date() - new Date(data.orderDate)) / (1000 * 60 * 60 * 24))
                            }
                                </td>
                            </tr>
                            `;
                    }).join("");

                    territorySold += mpoSold;
                    territoryReturn += mpoReturn;
                    territoryPayable += mpoPayable;
                    territoryPaid += mpoPaid;
                    territoryDue += mpoDue;

                    return `
                        ${!["Institute", "Doctor"].includes(mpoTerritory)
                            ?
                            `
                                <p style="margin: 5px 0; font-weight: bold; font-size: 12px;">
                                    MPO/SCC/ASE: ${mpoName} | Territory: ${mpoTerritory}
                                </p>
                            `
                            :
                            ""
                        }
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                            <thead>
                                <tr style="background-color: #f0f0f0;">
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: center;">Invoice No.</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: center;">Sales Date</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: center;">Payment Date</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">Sales Amount</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">Return Amount</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">Rec. Amount</th>
                                    <!-- <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">Paid</th> -->
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">Balance</th>
                                    <th style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 10%;">Pen. Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoiceRows}
                                <tr style="font-weight: bold; background-color: #fcfcfc;">
                                    <td colspan="3" style="padding: 8px; border: 1px solid #aaa;">
                                        ${mpoTerritory === "Institute"
                            ?
                            "Institute Total"
                            :
                            mpoTerritory === "Doctor"
                                ?
                                "Doctor Requisition Total"
                                :
                                `${mpoTerritory} Territory Total`
                        }
                                    </td>
                                    <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${mpoSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${mpoReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${mpoPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <!-- <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${mpoPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td> -->
                                    <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${mpoDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 10%;"></td>
                                </tr>
                            </tbody>
                        </table>
                    `;
                }).join("");

                areaManagerSold += territorySold;
                areaManagerReturn += territoryReturn;
                areaManagerPayable += territoryPayable;
                areaManagerPaid += territoryPaid;
                areaManagerDue += territoryDue;

                return `
                    <div style="margin-bottom: 20px;">
                        <p style="margin-bottom: 5px; text-align: center; font-weight: bold; font-size: 12px;">
                            ${parentTerritory === "Institute"
                        ? "Institute"
                        : parentTerritory === "Doctor"
                            ? "Doctor Requisition"
                            : `Sr. AM/AM: ${areaManager} | Territory: ${parentTerritory}`}
                        </p>
                        ${mpoHTML}
                        <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                        <tbody>
                        ${["Institute", "Doctor"].includes(parentTerritory)
                        ?
                        ""
                        :
                        `
                            <tr style="font-weight: bold; background-color: #eef;">
                                <td colspan="3" style="padding: 8px; border: 1px solid #aaa;">${parentTerritory} Area Total</td>
                                <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${territorySold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${territoryReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${territoryPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <!-- <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${territoryPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td> -->
                                <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${territoryDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 10%;"></td>
                            </tr>
                        `
                    }
                            </tbody>
                        </table>
                    </div>
                `;
            }).join("");

            return `
                <div style="margin: 30px 0;">
                    ${territoryHTML}
                </div>
            `;
        }).join("");

        const finalTotalHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tbody>
                    <tr style="background-color: #d9edf7; font-weight: bold;">
                        <td colspan="3" style="padding: 8px; border: 1px solid #aaa;">Grand Total</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${grandSold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${grandReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${grandPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <!-- <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${grandPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td> -->
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 13%;">${grandDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 8px; border: 1px solid #aaa; text-align: right; width: 10%;"></td>
                    </tr>
                </tbody>
            </table>
        `;

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map(
            (style) => style.outerHTML
        ).join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>Invoice Sales Summary</title>
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
                                    ${groupedHTML}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="100%">
                                    ${finalTotalHTML}
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

export default InvoiceSalesSummaryReport;