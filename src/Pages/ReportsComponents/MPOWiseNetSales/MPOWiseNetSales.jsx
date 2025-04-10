import React, { useMemo, useState } from 'react';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useOrders from '../../../Hooks/useOrders';
import useReturns from '../../../Hooks/useReturns';
import MPOWiseNetSalesReport from '../../../Reports/MPOWiseNetSalesReport';

const MPOWiseNetSales = () => {
    const [orders] = useOrders();
    const [returns] = useReturns();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [orderedBy, setOrderedBy] = useState('');
    const [areaManager, setAreaManager] = useState('');

    const deliveredOrders = orders.filter(order => order.status !== 'pending');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    const uniqueOrderedBy = useMemo(() => {
        const names = new Set();
        deliveredOrders.forEach(order => {
            if (order.orderedBy) {
                names.add(order.orderedBy.trim());
            }
        });
        return Array.from(names);
    }, [deliveredOrders]);

    const uniqueAreaManager = useMemo(() => {
        const names = new Set();
        deliveredOrders.forEach(order => {
            if (order.areaManager) {
                names.add(order.areaManager.trim());
            }
        });
        return Array.from(names);
    }, [deliveredOrders]);

    const filteredOrders = useMemo(() => {
        return deliveredOrders.filter(order => {
            const orderDate = new Date(order.date);
            const matchesYear = year ? orderDate.getFullYear() === parseInt(year) : true;
            const matchesMonth = month ? orderDate.getMonth() + 1 === parseInt(month) : true;
            const matchesDateRange = fromDate && toDate
                ? orderDate >= new Date(fromDate) && orderDate <= new Date(toDate)
                : true;
            const matchesOrderedBy = orderedBy ? order.orderedBy?.toLowerCase().includes(orderedBy.toLowerCase()) : true;
            const matchesAreaManager = areaManager ? order.areaManager?.toLowerCase().includes(areaManager.toLowerCase()) : true;

            return matchesYear && matchesMonth && matchesDateRange && matchesOrderedBy && matchesAreaManager;
        });
    }, [orders, year, month, fromDate, toDate, orderedBy, areaManager]);

    const orderReturns = useMemo(() => {
        return returns.filter(ret => {
            const returnDate = new Date(ret.date);
            const matchesDateRange = fromDate && toDate
                ? returnDate >= new Date(fromDate) && returnDate <= new Date(toDate)
                : true;

            return matchesDateRange;
        })
    }, [returns, fromDate, toDate]);

    const findDateRange = (orders) => {
        if (!orders.length) return { firstDate: null, lastDate: null };

        const sortedDates = orders.map(order => new Date(order.date)).sort((a, b) => a - b);
        const firstDate = sortedDates[0].toLocaleDateString('en-GB').replace(/\//g, '-');
        const lastDate = sortedDates[sortedDates.length - 1].toLocaleDateString('en-GB').replace(/\//g, '-');

        return { firstDate, lastDate };
    };

    const { firstDate, lastDate } = findDateRange(filteredOrders);

    const clearFilters = () => {
        setYear('');
        setMonth('');
        setFromDate('');
        setToDate('');
        setOrderedBy('');
        setAreaManager('');
    };

    const handlePrint = MPOWiseNetSalesReport({
        filteredOrders,
        orderReturns,
        firstDate,
        lastDate
    });

    return (
        <>
            <div>
                <PageTitle from={"Depot"} to={"Delivery report"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Depot delivery report</h1>
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

                        {/* Ordered By Filter */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Ordered By</label>
                            <select
                                value={orderedBy}
                                onChange={(e) => setOrderedBy(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select a person</option>
                                {uniqueOrderedBy.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Delivery Man Filter */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Area Manager</label>
                            <select
                                value={areaManager}
                                onChange={(e) => setAreaManager(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select Area Manager</option>
                                {uniqueAreaManager.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
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
                        <button
                            onClick={handlePrint}
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                        >
                            🖨️ MPO Wise Net Sales
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MPOWiseNetSales;