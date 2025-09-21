import { useMemo, useState } from 'react';
import Select from "react-select";
import Swal from 'sweetalert2';
import Loader from '../../../Components/Loader/Loader';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useOrders from '../../../Hooks/useOrders';
import MPOWiseInvSummary from '../../../Reports/MPOWiseInvSummary';
import MPOWiseProductSummary from '../../../Reports/MPOWiseProductSummary';
import OrderDespatchSheet from '../../../Reports/OrderDespatchSheet';
import ProductSummary from '../../../Reports/ProductSummary';

const DeliveryReport = () => {
    const [orders, loading] = useOrders();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [orderedBy, setOrderedBy] = useState('');
    /* const [territory, setTerritory] = useState('');
    const [parentTerritory, setParentTerritory] = useState(''); */
    const [deliveryMan, setDeliveryMan] = useState('');

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
            const matchesOrderedBy = orderedBy ? order.orderedBy?.toLowerCase().includes(orderedBy.toLowerCase()) : true;
            const matchesDeliveryMan = deliveryMan ? order.deliveryMan?.toLowerCase().includes(deliveryMan.toLowerCase()) : true;

            return matchesYear && matchesMonth && matchesDateRange && matchesOrderedBy && matchesDeliveryMan;
        });
    }, [orders, year, month, fromDate, toDate, orderedBy, deliveryMan]);

    const findDateRange = (orders) => {
        if (!orders.length) return { firstDate: null, lastDate: null };

        const sortedDates = orders.map(order => new Date(order.date)).sort((a, b) => a - b);
        const firstDate = sortedDates[0].toLocaleDateString('en-GB').replace(/\//g, '-');
        const lastDate = sortedDates[sortedDates.length - 1].toLocaleDateString('en-GB').replace(/\//g, '-');

        return { firstDate, lastDate };
    };

    const { firstDate, lastDate } = findDateRange(filteredOrders);

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

    /* const uniqueTerritory = useMemo(() => {
        const territoryMap = new Map();
        filteredOrders.forEach(order => {
            if (order.territory) {
                territoryMap.set(order.territory.trim(), true);
            }
        });
        return Array.from(territoryMap.keys());
    }, [filteredOrders]);

    const uniqueParentTerritory = useMemo(() => {
        const parentTerritoryMap = new Map();
        filteredOrders.forEach(order => {
            if (order.parentTerritory) {
                parentTerritoryMap.set(order.parentTerritory.trim(), true);
            }
        });
        return Array.from(parentTerritoryMap.keys());
    }, [filteredOrders]); */

    const uniqueDeliveryMen = useMemo(() => {
        const names = new Set();
        filteredOrders.forEach(order => {
            if (order.deliveryMan) {
                names.add(order.deliveryMan.trim());
            }
        });
        return Array.from(names);
    }, [filteredOrders]);

    const clearFilters = () => {
        setYear('');
        setMonth('');
        setFromDate('');
        setToDate('');
        setOrderedBy('');
        setDeliveryMan('');
    };

    const handleDespatchSheetPrint = OrderDespatchSheet({
        filteredOrders,
        firstDate,
        lastDate
    });

    const handleProductSummaryPrint = ProductSummary({
        filteredOrders,
        firstDate,
        lastDate
    });

    const handleMpoInvPrint = MPOWiseInvSummary({
        filteredOrders,
        firstDate,
        lastDate
    });

    const handleMpoProductPrint = MPOWiseProductSummary({
        filteredOrders,
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
                {
                    loading
                        ?
                        <>
                            <Loader />
                        </>
                        :
                        <>
                            <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4'>
                                {/* Filters Section */}
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-6 px-6">
                                    {/* Year Filter */}
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Year</label>
                                        <Select
                                            value={year ? { value: year, label: year } : null}
                                            onChange={(e) => setYear(e?.value || '')}
                                            options={[{ value: '', label: "All Years" }, ...years.map(y => ({ value: y, label: y }))]}
                                            placeholder="Year"
                                            isClearable
                                            isSearchable
                                        />
                                    </div>

                                    {/* Month Filter */}
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Month</label>
                                        <Select
                                            value={month ? { value: month, label: new Date(0, month - 1).toLocaleString('default', { month: 'long' }) } : null}
                                            onChange={(e) => setMonth(e?.value || '')}
                                            options={[{ value: '', label: "All Months" }, ...Array.from({ length: 12 }, (_, i) => ({
                                                value: i + 1,
                                                label: new Date(0, i).toLocaleString('default', { month: 'long' })
                                            }))]}
                                            placeholder="Month"
                                            isClearable
                                            isSearchable
                                        />
                                    </div>

                                    {/* From Date Filter */}
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none bg-white cursor-pointer"
                                        />
                                    </div>

                                    {/* To Date Filter */}
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none bg-white cursor-pointer"
                                        />
                                    </div>

                                    {/* OrderedBy Filter */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block font-semibold text-gray-700 mb-1">Ordered By</label>
                                        <Select
                                            value={orderedBy ? { value: orderedBy, label: `${orderedBy} - ${uniqueOrderedBy.find(u => u.orderedBy === orderedBy)?.email || ''}` } : null}
                                            onChange={(e) => setOrderedBy(e?.value || '')}
                                            options={[{ value: '', label: "Select a Person" }, ...uniqueOrderedBy.map(({ orderedBy, email }) => ({
                                                value: orderedBy,
                                                label: `${orderedBy} - ${email}`
                                            }))]}
                                            placeholder="Search or Select a Person"
                                            isClearable
                                            isSearchable
                                        />
                                    </div>

                                    {/* Territory Filter */}
                                    {/* <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Territory</label>
                                        <Select
                                            value={territory ? { value: territory, label: territory } : null}
                                            onChange={(e) => setTerritory(e?.value || '')}
                                            options={[{ value: '', label: "Select a Territory" }, ...uniqueTerritory.map(t => ({ value: t, label: t }))]}
                                            placeholder="Search or Select a Territory"
                                            isClearable
                                            isSearchable
                                        />
                                    </div> */}

                                    {/* Area Filter */}
                                    {/* <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Area</label>
                                        <Select
                                            value={parentTerritory ? { value: parentTerritory, label: parentTerritory } : null}
                                            onChange={(e) => setParentTerritory(e?.value || '')}
                                            options={[{ value: '', label: "Select an Area" }, ...uniqueParentTerritory.map(pt => ({ value: pt, label: pt }))]}
                                            placeholder="Search or Select an Area"
                                            isClearable
                                            isSearchable
                                        />
                                    </div> */}

                                    {/* Delivery Man Filter */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block font-semibold text-gray-700 mb-1">Delivery Man</label>
                                        <Select
                                            value={
                                                deliveryMan
                                                    ? { value: deliveryMan, label: deliveryMan }
                                                    : null
                                            }
                                            onChange={(e) => setDeliveryMan(e?.value || "")}
                                            options={[
                                                { value: "", label: "Select a Delivery Man" },
                                                ...uniqueDeliveryMen.map(name => ({
                                                    value: name,
                                                    label: name
                                                }))
                                            ]}
                                            placeholder="Search or Select a Delivery Man"
                                            isClearable
                                            isSearchable
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

                                {/* button section */}
                                <div className="w-full flex flex-col gap-4 px-6 mt-4">
                                    {/* Generate Report Button */}
                                    <button
                                        onClick={() =>
                                            !orderedBy
                                                ?
                                                handleDespatchSheetPrint()
                                                :
                                                Swal.fire({
                                                    icon: "error",
                                                    title: "Oops...",
                                                    text: "Please clear MPO name!",
                                                })
                                        }
                                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                                    >
                                        🖨️ Despatch Sheet
                                    </button>

                                    {/* Export to PDF Button */}
                                    <button
                                        onClick={() =>
                                            !orderedBy
                                                ?
                                                handleProductSummaryPrint()
                                                :
                                                Swal.fire({
                                                    icon: "error",
                                                    title: "Oops...",
                                                    text: "Please clear MPO name!",
                                                })
                                        }
                                        className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                                    >
                                        🖨️ Product Summary
                                    </button>

                                    {/* Export to Excel Button */}
                                    <button
                                        onClick={() =>
                                            orderedBy
                                                ?
                                                handleMpoInvPrint()
                                                :
                                                Swal.fire({
                                                    icon: "error",
                                                    title: "Oops...",
                                                    text: "Please select an MPO name!",
                                                })
                                        }
                                        className="bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                                    >
                                        🖨️ MPO Wise Invoice Summary
                                    </button>

                                    {/* Print Report Button */}
                                    <button
                                        onClick={() =>
                                            orderedBy
                                                ?
                                                handleMpoProductPrint()
                                                :
                                                Swal.fire({
                                                    icon: "error",
                                                    title: "Oops...",
                                                    text: "Please select an MPO name!",
                                                })
                                        }
                                        className="bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                                    >
                                        🖨️ MPO Wise Product Summary
                                    </button>
                                </div>
                            </div>
                        </>
                }
            </div>
        </>
    );
};

export default DeliveryReport;