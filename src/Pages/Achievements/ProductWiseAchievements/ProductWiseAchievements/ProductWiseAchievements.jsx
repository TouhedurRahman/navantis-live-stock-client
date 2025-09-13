import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useOrders from "../../../../Hooks/useOrders";
import useSingleUser from "../../../../Hooks/useSingleUser";
import ProductWiseAchievementsExcel from "../ProductWiseAchievementsExcel/ProductWiseAchievementsExcel";
import ProductWiseAchievementsReport from "../ProductWiseAchievementsReport/ProductWiseAchievementsReport";

const ProductWiseAchievements = () => {
    const [singleUser] = useSingleUser();
    const [orders] = useOrders();

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [productKey, setProductKey] = useState('');
    const [territory, setTerritory] = useState('');
    const [parentTerritory, setParentTerritory] = useState('');

    // const deliveredOrders = orders.filter(order => order.status !== 'pending');
    const deliveredOrders = orders.filter(order => {
        if (singleUser?.base !== "Field") {
            return order.status !== "pending";
        } else {
            return (
                order.status !== "pending" &&
                (
                    order.territory === singleUser?.territory ||
                    order.parentTerritory === singleUser?.territory ||
                    order.email === singleUser?.email ||
                    order.amEmail === singleUser?.email ||
                    order.zmEmail === singleUser?.email
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
        return deliveredOrders
            .map(order => {
                const matchesTerritory = territory ? order.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
                const matchesParentTerritory = parentTerritory ? order.parentTerritory?.toLowerCase().includes(parentTerritory.toLowerCase()) : true;
                if (!(matchesTerritory && matchesParentTerritory)) {
                    return null;
                }

                let filteredProducts = order.products;
                if (productKey) {
                    const [filterName, filterWeight] = productKey.toLowerCase().split('|').map(s => s.trim());
                    filteredProducts = order.products?.filter(p => {
                        const name = p.name?.trim().toLowerCase() || '';
                        const weight = p.netWeight?.trim().toLowerCase() || '';
                        return name === filterName && weight === filterWeight;
                    });
                }

                if (filteredProducts?.length === 0) return null;

                return {
                    ...order,
                    products: filteredProducts
                };
            })
            .filter(Boolean);
    }, [deliveredOrders, productKey, territory, parentTerritory]);

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

    const uniqueProducts = useMemo(() => {
        const productMap = new Map();

        filteredOrders.forEach(order => {
            order.products?.forEach(product => {
                const name = product.name?.trim().toLowerCase() || '';
                const netWeight = product.netWeight?.trim().toLowerCase() || '';
                const key = `${name}|${netWeight}`;

                if (!productMap.has(key)) {
                    productMap.set(key, {
                        name: product.name?.trim() || '',
                        netWeight: product.netWeight?.trim() || '',
                    });
                }
            });
        });

        return Array.from(productMap.values());
    }, [filteredOrders]);

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

    const handlePrint = ProductWiseAchievementsReport({
        currentMonthsOrders,
        previousMonthsOrders,
        twoMonthsAgoOrders,
        twelveMonthsAgoOrders,
        lastDayOrders,
        firstDate: formatDate(firstDate),
        lastDate: formatDate(lastDate)
    });

    const handleDownloadExcel = ProductWiseAchievementsExcel({
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
                <PageTitle from={"Achievements"} to={"Product wise achievements"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Product wise achievements report</h1>
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
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            />
                        </div>

                        {/* Product Filter */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Product</label>
                            <select
                                value={productKey}
                                onChange={(e) => setProductKey(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select a Product</option>
                                {uniqueProducts.map((p) => {
                                    const name = p.name?.trim().toLowerCase() || '';
                                    const weight = p.netWeight?.trim().toLowerCase() || '';
                                    const key = `${name}|${weight}`;

                                    return (
                                        <option key={key} value={key}>
                                            {p.name} - {p.netWeight}
                                        </option>
                                    );
                                })}
                            </select>
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
                                <option value="">Select a Parent Territory</option>
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

export default ProductWiseAchievements;