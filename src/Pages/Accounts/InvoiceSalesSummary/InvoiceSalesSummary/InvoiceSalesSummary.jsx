import { useMemo, useState } from 'react';
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import PageTitle from '../../../../Components/PageTitle/PageTitle';
import useCustomer from '../../../../Hooks/useCustomer';
import useOrders from '../../../../Hooks/useOrders';
import useReturns from '../../../../Hooks/useReturns';
import InvoiceSalesSummaryExcel from '../InvoiceSalesSummaryExcel/InvoiceSalesSummaryExcel';
import InvoiceSalesSummaryReport from '../InvoiceSalesSummaryReport/InvoiceSalesSummaryReport';

const InvoiceSalesSummary = () => {
    const [orders] = useOrders();
    const [returns] = useReturns();
    const [customers] = useCustomer();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [territory, setTerritory] = useState('');
    const [orderedBy, setOrderedBy] = useState('');
    const [areaManager, setAreaManager] = useState('');
    const [customer, setCustomer] = useState('');
    const [reportType, setReportType] = useState('Invoice Sales Summary');

    const deliveredOrders = orders.filter(order => order.status !== 'pending');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    const filteredOrders = useMemo(() => {
        return deliveredOrders.filter(order => {
            const orderDate = new Date(order.date);
            const matchesYear = year ? orderDate.getFullYear() === parseInt(year) : true;
            const matchesMonth = month ? orderDate.getMonth() + 1 === parseInt(month) : true;
            const matchesDateRange = fromDate && toDate
                ? orderDate >= new Date(fromDate) && orderDate <= new Date(toDate)
                : true;
            const matchesTerritory = territory ? order.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
            const matchesOrderedBy = orderedBy ? order.orderedBy?.toLowerCase().includes(orderedBy.toLowerCase()) : true;
            const matchesAreaManager = areaManager ? order.areaManager?.toLowerCase().includes(areaManager.toLowerCase()) : true;
            const matchesCustomer = customer ? order.pharmacyId?.toLowerCase().includes(customer.toLowerCase()) : true;

            return matchesYear && matchesMonth && matchesDateRange && matchesTerritory && matchesOrderedBy && matchesAreaManager && matchesCustomer;
        });
    }, [orders, year, month, fromDate, toDate, territory, orderedBy, areaManager, customer]);

    const orderReturns = useMemo(() => {
        return returns.filter(ret => {
            const returnDate = new Date(ret.date);
            const matchesDateRange = fromDate && toDate
                ? returnDate >= new Date(fromDate) && returnDate <= new Date(toDate)
                : true;

            return matchesDateRange;
        })
    }, [returns, fromDate, toDate]);

    const findDateRange = (orders, returns) => {
        if (!orders.length && !returns.length) return { firstDate: null, lastDate: null };

        const deliveryDates = orders
            .map(order => new Date(order.date))
            .filter(date => !isNaN(date));

        const returnDates = returns
            .map(order => new Date(order.date))
            .filter(date => !isNaN(date));

        const firstDateObj = deliveryDates.length ? deliveryDates.sort((a, b) => a - b)[0] : null;

        const latestDeliveryDate = deliveryDates.length ? deliveryDates.sort((a, b) => a - b).at(-1) : null;
        const latestReturnDate = returnDates.length ? returnDates.sort((a, b) => a - b).at(-1) : null;

        let lastDateObj;
        if (latestDeliveryDate && latestReturnDate) {
            lastDateObj = latestDeliveryDate > latestReturnDate ? latestDeliveryDate : latestReturnDate;
        } else {
            lastDateObj = latestDeliveryDate || latestReturnDate;
        }

        const firstDate = firstDateObj ? firstDateObj.toLocaleDateString('en-GB').replace(/\//g, '-') : null;
        const lastDate = lastDateObj ? lastDateObj.toLocaleDateString('en-GB').replace(/\//g, '-') : null;

        return { firstDate, lastDate };
    };

    const { firstDate, lastDate } = findDateRange(filteredOrders, returns);

    const uniqueTerritory = useMemo(() => {
        const territoryMap = new Map();

        filteredOrders.forEach(order => {
            if (order.territory) {
                territoryMap.set(order.territory.trim(), true);
            }
        });

        return Array.from(territoryMap.keys());
    }, [filteredOrders]);

    const uniqueOrderedBy = useMemo(() => {
        const orderByMap = new Map();

        filteredOrders.forEach(order => {
            if (order.orderedBy && order.email) {
                orderByMap.set(order.orderedBy.trim(), order.email.trim());
            }
        });

        return Array.from(orderByMap.entries()).map(([orderedBy, email]) => ({
            orderedBy,
            email,
        }));
    }, [filteredOrders]);

    const uniqueAreaManager = useMemo(() => {
        const amMap = new Map();
        let vacantAdded = false;

        filteredOrders.forEach(order => {
            if (order.areaManager) {
                const areaManager = order.areaManager.trim();
                const amEmail = order.amEmail ? order.amEmail.trim() : null;

                if (areaManager === "Vacant" && !vacantAdded) {
                    amMap.set(areaManager, null);
                    vacantAdded = true;
                } else if (areaManager !== "Vacant") {
                    amMap.set(areaManager, amEmail);
                }
            }
        });

        return Array.from(amMap.entries()).map(([areaManager, amEmail]) => ({
            areaManager,
            amEmail
        }));
    }, [filteredOrders]);

    const uniquePharmacies = useMemo(() => {
        const pharmacyMap = new Map();

        filteredOrders.forEach(order => {
            if (order.pharmacyId && order.pharmacy) {
                pharmacyMap.set(order.pharmacyId.trim(), order.pharmacy.trim());
            }
        });

        return Array.from(pharmacyMap.entries()).map(([pharmacyId, pharmacy]) => ({
            pharmacyId,
            pharmacy,
        }));
    }, [filteredOrders]);

    const orderWithPharmacyId = filteredOrders.find(order => order.pharmacyId);
    const selectedCustomerCode = orderWithPharmacyId ? orderWithPharmacyId.pharmacyId : null;

    const customerDetails = customers.find(singleCus => singleCus.customerId === selectedCustomerCode);

    const customerCode = customerDetails?.customerId || '';
    const customerName = customerDetails?.name || '';
    const customerAddress = customerDetails?.address || '';
    const customerMobile = customerDetails?.mobile || '';

    const clearFilters = () => {
        setYear('');
        setMonth('');
        setFromDate('');
        setToDate('');
        setTerritory('');
        setOrderedBy('');
        setAreaManager('');
        setCustomer('');
        setReportType('Invoice Sales Summary');
    };

    const handlePrint = InvoiceSalesSummaryReport({
        reportType,
        filteredOrders,
        orderReturns,
        firstDate,
        lastDate,
        customerCode,
        customerName,
        customerAddress,
        customerMobile
    });

    const handleDownloadExcel = InvoiceSalesSummaryExcel({
        reportType,
        filteredOrders,
        orderReturns,
        firstDate,
        lastDate,
        customerCode,
        customerName,
        customerAddress,
        customerMobile
    });

    return (
        <>
            <div>
                <PageTitle from={"Reports"} to={"Invoice wise sales"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Invoice wise sales summary report</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4'>
                    {/* Filters Section */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-6 px-6">
                        {/* Year Filter */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">All Years</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">All Months</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* From Date Filter */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            />
                        </div>

                        {/* To Date Filter */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            />
                        </div>

                        {/* Territory Filter */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Territory</label>
                            <select
                                value={territory}
                                onChange={(e) => setTerritory(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select a territory</option>
                                {uniqueTerritory.map((territory) => (
                                    <option key={territory} value={territory}>
                                        {territory}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ordered By Filter */}
                        {/* <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Ordered By</label>
                            <select
                                value={orderedBy}
                                onChange={(e) => setOrderedBy(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select a person</option>
                                {uniqueOrderedBy.map(({ orderedBy, email }) => (
                                    <option key={email} value={orderedBy}>
                                        {orderedBy} - {email}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        {/* Area Manager Filter */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Area Manager</label>
                            <select
                                value={areaManager}
                                onChange={(e) => setAreaManager(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select an Area Manager</option>
                                {uniqueAreaManager.map(({ areaManager, amEmail }) => (
                                    <option key={areaManager} value={areaManager}>
                                        {areaManager} {amEmail && `- ${amEmail}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Customer Filter */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Customer</label>
                            <select
                                value={customer}
                                onChange={(e) => setCustomer(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select a Customer</option>
                                {uniquePharmacies.map(({ pharmacy, pharmacyId }) => (
                                    <option key={pharmacyId} value={pharmacyId}>
                                        {pharmacy} - {pharmacyId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Report Filter */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="Invoice Sales Summary">Invoice Sales Summary</option>
                                {
                                    orderedBy !== ''
                                    &&
                                    < option value="MPO wise Invoice Sales Summary">MPO wise Invoice Sales Summary</option>
                                }
                                {
                                    areaManager !== ''
                                    &&
                                    < option value="Area Manager wise Invoice Sales Summary">Area Manager wise Invoice Sales Summary</option>
                                }
                                {
                                    customer !== ''
                                    &&
                                    <option value="Customer wise Invoice Sales Summary">Customer wise Invoice Sales Summary</option>
                                }
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        <button
                            onClick={clearFilters}
                            className="col-span-1 md:col-span-2 mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 shadow-sm hover:bg-blue-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>

                    {/* button section */}
                    <div className="w-full flex flex-col gap-4 px-6 mt-4">
                        {/* print pdf button */}
                        <button
                            onClick={handlePrint}
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                        >
                            <span className='flex justify-center items-center'>
                                <FaFilePdf className='mr-2' /> Print PDF
                            </span>
                        </button>

                        {/* download excel file button */}
                        <button
                            onClick={handleDownloadExcel}
                            className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                        >
                            <span className='flex justify-center items-center'>
                                <FaFileExcel className='mr-2' /> Download Excel
                            </span>
                        </button>
                    </div>
                </div >
            </div >
        </>
    );
};

export default InvoiceSalesSummary;