import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useOrders from "../../../../Hooks/useOrders";
import TerritoryWiseAchievementsExcel from "../TerritoryWiseAchievementsExcel/TerritoryWiseAchievementsExcel";
import TerritoryWiseAchievementsReport from "../TerritoryWiseAchievementsReport/TerritoryWiseAchievementsReport";

const TerritoryWiseAchievements = () => {
    const [orders] = useOrders();

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [territory, setTerritory] = useState('');
    const [parentTerritory, setParentTerritory] = useState('');

    const deliveredOrders = orders.filter(order => order.status !== 'pending');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    const filteredOrders = useMemo(() => {
        return deliveredOrders.filter(order => {
            const matchesTerritory = territory ? order.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
            const matchesParentTerritory = parentTerritory ? order.parentTerritory?.toLowerCase().includes(parentTerritory.toLowerCase()) : true;
            return matchesTerritory && matchesParentTerritory;
        });
    }, [deliveredOrders, territory, parentTerritory]);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

    const firstDate = fromDate ? new Date(fromDate).toLocaleDateString("en-GB").replace(/\//g, "-") : null;
    const lastDate = toDate ? new Date(toDate).toLocaleDateString("en-GB").replace(/\//g, "-") : null;

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
        filteredOrders,
        firstDate,
        lastDate
    });

    const handleDownloadExcel = TerritoryWiseAchievementsExcel({
        filteredOrders,
        firstDate,
        lastDate
    });

    return (
        <>
            <div>
                <PageTitle from={"Reports"} to={"Products summary"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Products summary reports</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4'>
                    {/* Filters Section */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-6 px-6">

                        {/* From Date */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                min={firstDay}
                                max={lastDay}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                min={firstDay}
                                max={lastDay}
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

                        {/* Area Filter */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Area</label>
                            <select
                                value={parentTerritory}
                                onChange={(e) => setParentTerritory(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select an Parent Territory</option>
                                {uniqueParentTerritory.map((pt) => (
                                    <option key={pt} value={pt}>
                                        {pt}
                                    </option>
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

export default TerritoryWiseAchievements;