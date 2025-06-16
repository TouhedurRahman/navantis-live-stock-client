import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../Hooks/useCustomer";
import useReturns from "../../../Hooks/useReturns";
import ProductsSalesReturnsReport from "../../../Reports/ProductsSalesReturnsReport";
import ProductsSalesReturnsReportExcel from "../../../Reports/ProductsSalesReturnsReportExcel";

const ProductsSalesReturn = () => {
    const [salesReturns] = useReturns();
    const [customers] = useCustomer();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [productKey, setProductKey] = useState('');
    const [territory, setTerritory] = useState('');
    const [orderedBy, setOrderedBy] = useState('');
    const [areaManager, setAreaManager] = useState('');
    const [customer, setCustomer] = useState('');
    const [reportType, setReportType] = useState('Products Sales Returns Summary');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    const filteredReturns = useMemo(() => {
        return salesReturns
            .map(salesReturn => {
                const orderDate = new Date(salesReturn.date);
                const matchesYear = year ? orderDate.getFullYear() === parseInt(year) : true;
                const matchesMonth = month ? orderDate.getMonth() + 1 === parseInt(month) : true;
                const matchesDateRange = fromDate && toDate
                    ? orderDate >= new Date(fromDate) && orderDate <= new Date(toDate)
                    : true;
                const matchesTerritory = territory ? salesReturn.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
                const matchesOrderedBy = orderedBy ? salesReturn.orderedBy?.toLowerCase().includes(orderedBy.toLowerCase()) : true;
                const matchesAreaManager = areaManager ? salesReturn.areaManager?.toLowerCase().includes(areaManager.toLowerCase()) : true;
                const matchesCustomer = customer ? salesReturn.pharmacyId?.toLowerCase().includes(customer.toLowerCase()) : true;

                if (!(matchesYear && matchesMonth && matchesDateRange && matchesTerritory && matchesOrderedBy && matchesAreaManager && matchesCustomer)) {
                    return null;
                }

                let filteredProducts = salesReturn.products;
                if (productKey) {
                    const [filterName, filterWeight] = productKey.toLowerCase().split('|').map(s => s.trim());
                    filteredProducts = salesReturn.products?.filter(p => {
                        const name = p.name?.trim().toLowerCase() || '';
                        const weight = p.netWeight?.trim().toLowerCase() || '';
                        return name === filterName && weight === filterWeight;
                    });
                }

                if (filteredProducts?.length === 0) return null;

                return {
                    ...salesReturn,
                    products: filteredProducts
                };
            })
            .filter(Boolean);
    }, [salesReturns, year, month, fromDate, toDate, productKey, territory, orderedBy, areaManager, customer]);

    const findDateRange = (returns) => {
        if (!returns.length) return { firstDate: null, lastDate: null };

        const sortedDates = returns.map(salesReturn => new Date(salesReturn.date)).sort((a, b) => a - b);
        const firstDate = sortedDates[0].toLocaleDateString('en-GB').replace(/\//g, '-');
        const lastDate = sortedDates[sortedDates.length - 1].toLocaleDateString('en-GB').replace(/\//g, '-');

        return { firstDate, lastDate };
    };

    const { firstDate, lastDate } = findDateRange(filteredReturns);

    const uniqueProducts = useMemo(() => {
        const productMap = new Map();

        filteredReturns.forEach(salesReturn => {
            salesReturn.products?.forEach(product => {
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
    }, [filteredReturns]);

    const uniqueTerritory = useMemo(() => {
        const territoryMap = new Map();

        filteredReturns.forEach(salesReturn => {
            if (salesReturn.territory) {
                territoryMap.set(salesReturn.territory.trim(), true);
            }
        });

        return Array.from(territoryMap.keys());
    }, [filteredReturns]);

    const uniqueOrderedBy = useMemo(() => {
        const orderByMap = new Map();

        filteredReturns.forEach(salesReturn => {
            if (salesReturn.orderedBy && salesReturn.email) {
                orderByMap.set(salesReturn.orderedBy.trim(), salesReturn.email.trim());
            }
        });

        return Array.from(orderByMap.entries()).map(([orderedBy, email]) => ({
            orderedBy,
            email,
        }));
    }, [filteredReturns]);

    const uniqueAreaManager = useMemo(() => {
        const amMap = new Map();
        let vacantAdded = false;

        filteredReturns.forEach(salesReturn => {
            if (salesReturn.areaManager) {
                const areaManager = salesReturn.areaManager.trim();
                const amEmail = salesReturn.amEmail ? salesReturn.amEmail.trim() : null;

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
    }, [filteredReturns]);

    const uniquePharmacies = useMemo(() => {
        const pharmacyMap = new Map();

        filteredReturns.forEach(salesReturn => {
            if (salesReturn.pharmacyId && salesReturn.pharmacy) {
                pharmacyMap.set(salesReturn.pharmacyId.trim(), salesReturn.pharmacy.trim());
            }
        });

        return Array.from(pharmacyMap.entries()).map(([pharmacyId, pharmacy]) => ({
            pharmacyId,
            pharmacy,
        }));
    }, [filteredReturns]);

    const orderWithPharmacyId = filteredReturns.find(salesReturn => salesReturn.pharmacyId);
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
        setOrderedBy('');
        setAreaManager('');
        setCustomer('');
        setReportType('Products Sales Returns Summary');
    };

    const handlePrint = ProductsSalesReturnsReport({
        reportType,
        filteredReturns,
        firstDate,
        lastDate,
        customerCode,
        customerName,
        customerAddress,
        customerMobile
    });

    const handleDownloadExcel = ProductsSalesReturnsReportExcel({
        reportType,
        filteredReturns,
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
                <PageTitle from={"Reports"} to={"Products sales returns"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Products sales returns report</h1>
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
                                <option value="Products Sales Returns Summary">Products Sales Returns Summary</option>
                                {
                                    productKey !== ''
                                    &&
                                    < option value="Product wise Products Sales Returns Summary">Product wise Products Sales Returns Summary</option>
                                }
                                {
                                    territory !== ''
                                    &&
                                    < option value="Territory wise Products Sales Returns Summary">Territory wise Products Sales Returns Summary</option>
                                }
                                {
                                    orderedBy !== ''
                                    &&
                                    < option value="MPO wise Products Sales Returns Summary">MPO wise Products Sales Returns Summary</option>
                                }
                                {
                                    areaManager !== ''
                                    &&
                                    < option value="Area Manager wise Products Sales Returns Summary">Area Manager wise Products Sales Returns Summary</option>
                                }
                                {
                                    customer !== ''
                                    &&
                                    <option value="Customer wise Products Sales Returns Summary">Customer wise Products Sales Returns Summary</option>
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

export default ProductsSalesReturn;