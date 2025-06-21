import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../Hooks/useCustomer";
import useExpiredReturnes from "../../../Hooks/useExpiredReturnes";
import ExpireReturnsReport from "../../../Reports/ExpireReturnsReport";

const ExpireReturns = () => {
    const [exReturns] = useExpiredReturnes();
    const [customers] = useCustomer();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [productKey, setProductKey] = useState('');
    const [territory, setTerritory] = useState('');
    const [returnedBy, setReturnedBy] = useState('');
    const [areaManager, setAreaManager] = useState('');
    const [customer, setCustomer] = useState('');
    const [reportType, setReportType] = useState('Expire Returns');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    const expireReturns = exReturns.filter(
        exReturn => ["approved", "adjusted"].includes(exReturn.status)
    );

    const filteredExReturns = useMemo(() => {
        return expireReturns
            .filter(exReturn => {
                const returnDate = new Date(exReturn.date);
                const matchesYear = year ? returnDate.getFullYear() === parseInt(year) : true;
                const matchesMonth = month ? returnDate.getMonth() + 1 === parseInt(month) : true;
                const matchesDateRange = fromDate && toDate ? returnDate >= new Date(fromDate) && returnDate <= new Date(toDate) : true;
                const matchesTerritory = territory ? exReturn.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
                const matchesReturnedBy = returnedBy ? exReturn.returnedBy?.toLowerCase().includes(returnedBy.toLowerCase()) : true;
                const matchesAreaManager = areaManager ? exReturn.areaManager?.toLowerCase().includes(areaManager.toLowerCase()) : true;
                const matchesCustomer = customer ? exReturn.pharmacyId?.toLowerCase().includes(customer.toLowerCase()) : true;

                return matchesYear && matchesMonth && matchesDateRange && matchesTerritory && matchesReturnedBy && matchesAreaManager && matchesCustomer;
            })
            .map(exReturn => {
                if (!productKey) return exReturn;

                const [filterName, filterWeight] = productKey.toLowerCase().split('|').map(s => s.trim());

                const name = exReturn.productName?.toLowerCase() || '';
                const weight = exReturn.netWeight?.toLowerCase() || '';

                const matchesProduct = name === filterName && weight === filterWeight;

                return matchesProduct ? exReturn : null;
            })
            .filter(Boolean);
    }, [expireReturns, year, month, fromDate, toDate, productKey, territory, returnedBy, areaManager, customer]);

    const findDateRange = (returns) => {
        if (!returns.length) return { firstDate: null, lastDate: null };

        const sortedDates = returns.map(exReturn => new Date(exReturn.date)).sort((a, b) => a - b);
        const firstDate = sortedDates[0].toLocaleDateString('en-GB').replace(/\//g, '-');
        const lastDate = sortedDates[sortedDates.length - 1].toLocaleDateString('en-GB').replace(/\//g, '-');

        return { firstDate, lastDate };
    };

    const { firstDate, lastDate } = findDateRange(filteredExReturns);

    const uniqueProducts = useMemo(() => {
        const productMap = new Map();

        filteredExReturns.forEach(exReturn => {
            const name = exReturn.productName?.trim().toLowerCase() || '';
            const netWeight = exReturn.netWeight?.trim().toLowerCase() || '';
            const key = `${name}|${netWeight}`;

            if (!productMap.has(key)) {
                productMap.set(key, {
                    name: exReturn.productName?.trim() || '',
                    netWeight: exReturn.netWeight?.trim() || '',
                });
            }
        });

        return Array.from(productMap.values());
    }, [filteredExReturns]);

    const uniqueTerritory = useMemo(() => {
        const territoryMap = new Map();

        filteredExReturns.forEach(exReturn => {
            if (exReturn.territory) {
                territoryMap.set(exReturn.territory.trim(), true);
            }
        });

        return Array.from(territoryMap.keys());
    }, [filteredExReturns]);

    const uniqueReturnedBy = useMemo(() => {
        const orderByMap = new Map();

        filteredExReturns.forEach(exReturn => {
            if (exReturn.returnedBy) {
                orderByMap.set(exReturn.returnedBy.trim());
            }
        });

        return Array.from(orderByMap.entries()).map(([returnedBy]) => ({
            returnedBy
        }));
    }, [filteredExReturns]);

    const uniqueAreaManager = useMemo(() => {
        const amMap = new Map();
        let vacantAdded = false;

        filteredExReturns.forEach(exReturn => {
            if (exReturn.areaManager) {
                const areaManager = exReturn.areaManager.trim();
                const amEmail = exReturn.amEmail ? exReturn.amEmail.trim() : null;

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
    }, [filteredExReturns]);

    const uniquePharmacies = useMemo(() => {
        const pharmacyMap = new Map();

        filteredExReturns.forEach(exReturn => {
            if (exReturn.pharmacyId && exReturn.pharmacy) {
                pharmacyMap.set(exReturn.pharmacyId.trim(), exReturn.pharmacy.trim());
            }
        });

        return Array.from(pharmacyMap.entries()).map(([pharmacyId, pharmacy]) => ({
            pharmacyId,
            pharmacy,
        }));
    }, [filteredExReturns]);

    const orderWithPharmacyId = filteredExReturns.find(exReturn => exReturn.pharmacyId);
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
        setProductKey('');
        setTerritory('');
        setReturnedBy('');
        setAreaManager('');
        setCustomer('');
        setReportType('Expire Returns');
    };

    const handlePrint = ExpireReturnsReport({
        reportType,
        filteredExReturns,
        firstDate,
        lastDate,
        customerCode,
        customerName,
        customerAddress,
        customerMobile
    });

    const handleDownloadExcel = ExpireReturnsReport({
        reportType,
        filteredExReturns,
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
                <PageTitle from={"Reports"} to={"Expire returns"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Expire returns report</h1>
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

                        {/* Ordered By Filter */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Ordered By</label>
                            <select
                                value={returnedBy}
                                onChange={(e) => setReturnedBy(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select a person</option>
                                {uniqueReturnedBy.map(({ returnedBy }) => (
                                    <option key={returnedBy} value={returnedBy}>
                                        {returnedBy}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                <option value="Expire Returns">Expire Returns</option>
                                {
                                    productKey !== ''
                                    &&
                                    < option value="Product wise Expire Returns">Product wise Expire Returns</option>
                                }
                                {
                                    territory !== ''
                                    &&
                                    < option value="Territory wise Expire Returns">Territory wise Expire Returns</option>
                                }
                                {
                                    returnedBy !== ''
                                    &&
                                    < option value="MPO wise Expire Returns">MPO wise Expire Returns</option>
                                }
                                {
                                    areaManager !== ''
                                    &&
                                    < option value="Area Manager wise Expire Returns">Area Manager wise Expire Returns</option>
                                }
                                {
                                    customer !== ''
                                    &&
                                    <option value="Customer wise Expire Returns">Customer wise Expire Returns</option>
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

export default ExpireReturns;