import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import Select from "react-select";
import Loader from "../../../../Components/Loader/Loader";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useAllUsers from "../../../../Hooks/useAllUsers";
import useOrders from "../../../../Hooks/useOrders";
import useSingleUser from "../../../../Hooks/useSingleUser";
import TerritoryWiseAchievementsExcel from "../TerritoryWiseAchievementsExcel/TerritoryWiseAchievementsExcel";
import TerritoryWiseAchievementsReport from "../TerritoryWiseAchievementsReport/TerritoryWiseAchievementsReport";

const TerritoryWiseAchievements = () => {
    const [singleUser] = useSingleUser();
    const [orders, ordersLoading] = useOrders();
    const [users] = useAllUsers();

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [territory, setTerritory] = useState('');
    const [parentTerritory, setParentTerritory] = useState('');

    const territories = useMemo(() => {
        if (!singleUser || !users) return [];

        let t = singleUser?.territory ? [singleUser.territory] : [];

        const childUsers = users.filter(u => u.parentId === singleUser._id);
        const childTerritories = childUsers.map(u => u.territory);

        return [...new Set([...t, ...childTerritories])];
    }, [singleUser, users]);

    // const deliveredOrders = orders.filter(order => order.status !== 'pending');
    const deliveredOrders = orders.filter(order => {
        if (singleUser?.base !== "Field") {
            return order.status !== "pending";
        } else {
            return (
                order.status !== "pending" &&
                (
                    order.territory === singleUser?.territory ||
                    territories.includes(order.territory)
                )
            );
        }
    });

    const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date();

    const formatDate = (date) =>
        date.toLocaleDateString("en-GB").replace(/\//g, "-");

    const firstDate = fromDate ? parseDate(fromDate) : firstDay;
    const lastDate = toDate ? parseDate(toDate) : lastDay;

    const filteredOrders = useMemo(() => {
        return deliveredOrders.filter(order => {
            const matchesTerritory = territory ? order.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
            const matchesParentTerritory = parentTerritory ? order.parentTerritory?.toLowerCase().includes(parentTerritory.toLowerCase()) : true;
            return matchesTerritory && matchesParentTerritory;
        });
    }, [deliveredOrders, territory, parentTerritory]);

    const currentMonthsOrders = useMemo(() => {
        return filteredOrders.filter(order => {
            const orderDate = parseDate(order.date);
            return orderDate >= firstDate && orderDate <= lastDate;
        });
    }, [filteredOrders, firstDate, lastDate]);

    const previousMonthsOrders = useMemo(() => {
        const prevFirstDate = new Date(firstDate);
        prevFirstDate.setMonth(prevFirstDate.getMonth() - 1);

        const prevLastDate = new Date(lastDate);
        prevLastDate.setMonth(prevLastDate.getMonth() - 1);

        if (prevFirstDate.getDate() !== firstDate.getDate()) prevFirstDate.setDate(1);
        if (prevLastDate.getDate() !== lastDate.getDate()) prevLastDate.setDate(1);

        return filteredOrders.filter(order => {
            const orderDate = parseDate(order.date);
            return orderDate >= prevFirstDate && orderDate <= prevLastDate;
        });
    }, [filteredOrders, firstDate, lastDate]);

    const twoMonthsAgoOrders = useMemo(() => {
        const prevFirstDate = new Date(firstDate);
        prevFirstDate.setMonth(prevFirstDate.getMonth() - 2);

        const prevLastDate = new Date(lastDate);
        prevLastDate.setMonth(prevLastDate.getMonth() - 2);

        if (prevFirstDate.getDate() !== firstDate.getDate()) prevFirstDate.setDate(1);
        if (prevLastDate.getDate() !== lastDate.getDate()) prevLastDate.setDate(1);

        return filteredOrders.filter(order => {
            const orderDate = parseDate(order.date);
            return orderDate >= prevFirstDate && orderDate <= prevLastDate;
        });
    }, [filteredOrders, firstDate, lastDate]);

    const twelveMonthsAgoOrders = useMemo(() => {
        const prevFirstDate = new Date(firstDate);
        prevFirstDate.setMonth(prevFirstDate.getMonth() - 12);

        const prevLastDate = new Date(lastDate);
        prevLastDate.setMonth(prevLastDate.getMonth() - 12);

        if (prevFirstDate.getDate() !== firstDate.getDate()) prevFirstDate.setDate(1);
        if (prevLastDate.getDate() !== lastDate.getDate()) prevLastDate.setDate(1);

        return filteredOrders.filter(order => {
            const orderDate = parseDate(order.date);
            return orderDate >= prevFirstDate && orderDate <= prevLastDate;
        });
    }, [filteredOrders, firstDate, lastDate]);

    const isSameDate = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const lastDayOrders = filteredOrders.filter(order => {
        const orderDate = parseDate(order.date);
        return isSameDate(orderDate, lastDate);
    });

    const uniqueTerritory = useMemo(() => {
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
    }, [filteredOrders]);

    const clearFilters = () => {
        setFromDate('');
        setToDate('');
        setTerritory('');
        setParentTerritory('');
    };

    const handlePrint = TerritoryWiseAchievementsReport({
        currentMonthsOrders,
        previousMonthsOrders,
        twoMonthsAgoOrders,
        twelveMonthsAgoOrders,
        lastDayOrders,
        firstDate: formatDate(firstDate),
        lastDate: formatDate(lastDate)
    });

    const handleDownloadExcel = TerritoryWiseAchievementsExcel({
        currentMonthsOrders,
        previousMonthsOrders,
        twoMonthsAgoOrders,
        twelveMonthsAgoOrders,
        lastDayOrders,
        firstDate: formatDate(firstDate),
        lastDate: formatDate(lastDate)
    });

    return (
        <>
            <div>
                <PageTitle from={"Achievements"} to={"Territory wise achievements"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Territory wise achievements report</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                {
                    ordersLoading
                        ?
                        <>
                            <Loader />
                        </>
                        :
                        <>
                            <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4'>
                                {/* Filters Section */}
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-6 px-6">

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

                                    {/* Territory Filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Territory</label>
                                        <Select
                                            value={territory ? { value: territory, label: territory } : null}
                                            onChange={(e) => setTerritory(e?.value || '')}
                                            options={[{ value: '', label: "Select a Territory" }, ...uniqueTerritory.map(t => ({ value: t, label: t }))]}
                                            placeholder="Search or Select a Territory"
                                            isClearable
                                            isSearchable
                                        />
                                    </div>

                                    {/* Area Filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Area</label>
                                        <Select
                                            value={parentTerritory ? { value: parentTerritory, label: parentTerritory } : null}
                                            onChange={(e) => setParentTerritory(e?.value || '')}
                                            options={[{ value: '', label: "Select an Area" }, ...uniqueParentTerritory.map(pt => ({ value: pt, label: pt }))]}
                                            placeholder="Search or Select an Area"
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
                        </>
                }
            </div >
        </>
    );
};

export default TerritoryWiseAchievements;