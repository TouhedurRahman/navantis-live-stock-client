import React, { useMemo, useState } from 'react';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useOrders from '../../../Hooks/useOrders';

const DeliveryReport = () => {
    const [orders, loading] = useOrders();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [orderedBy, setOrderedBy] = useState('');
    const [deliveryMan, setDeliveryMan] = useState('');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    // Filtered products based on filters
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            const matchesYear = year ? orderDate.getFullYear() === parseInt(year) : true;
            const matchesMonth = month ? orderDate.getMonth() + 1 === parseInt(month) : true;
            const matchesDateRange = fromDate && toDate
                ? orderDate >= new Date(fromDate) && orderDate <= new Date(toDate)
                : true;
            const matchesOrderedBy = orderedBy ? order.orderedBy?.toLowerCase().includes(orderedBy.toLowerCase()) : true;
            const matchesDeliveryMan = deliveryMan ? order.deliveryMan?.toLowerCase().includes(deliveryMan.toLowerCase()) : true;

            return matchesYear && matchesMonth && matchesDateRange && matchesOrderedBy && matchesDeliveryMan;
        });
    }, [orders, year, month, fromDate, toDate, orderedBy, deliveryMan]);

    const findDateRange = (orders) => {
        if (!orders.length) {
            return { firstDate: null, lastDate: null };
        }

        const sortedDates = orders
            .map((order) => new Date(order.date))
            .sort((a, b) => a - b);

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
        setDeliveryMan('');
    };

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

                {/* Filters Section */}
                <div className="w-full md:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-6">
                    {/* Year Filter */}
                    <div>
                        <label htmlFor="year" className="block font-semibold text-gray-700 mb-1">Year</label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
                        >
                            <option value="">All Years</option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Filter */}
                    <div>
                        <label htmlFor="month" className="block font-semibold text-gray-700 mb-1">Month</label>
                        <select
                            id="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
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
                            className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
                        />
                    </div>

                    {/* To Date Filter */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
                        />
                    </div>

                    {/* Ordered By Filter */}
                    <div>
                        <label htmlFor="orderedBy" className="block font-semibold text-gray-700 mb-1">Ordered By</label>
                        <input
                            type="text"
                            id="orderedBy"
                            value={orderedBy}
                            onChange={(e) => setOrderedBy(e.target.value)}
                            placeholder="Ordered by..."
                            className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
                        />
                    </div>

                    {/* Delivery Man Filter */}
                    <div>
                        <label htmlFor="deliveryMan" className="block font-semibold text-gray-700 mb-1">Delivery Man</label>
                        <input
                            type="text"
                            id="deliveryMan"
                            value={deliveryMan}
                            onChange={(e) => setDeliveryMan(e.target.value)}
                            placeholder="Delivery man..."
                            className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
                        />
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        onClick={clearFilters}
                        className="col-span-1 md:col-span-2 mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 shadow-sm hover:bg-blue-600 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default DeliveryReport;