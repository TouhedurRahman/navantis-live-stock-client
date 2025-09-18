import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import Select from "react-select";
import Loader from "../../../Components/Loader/Loader";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../Hooks/useCustomer";
import useReturns from "../../../Hooks/useReturns";
import ProductsSalesReturnsReport from "../../../Reports/ProductsSalesReturnsReport";
import ProductsSalesReturnsReportExcel from "../../../Reports/ProductsSalesReturnsReportExcel";

const ProductsSalesReturn = () => {
    const [salesReturns, returnsLoading] = useReturns();
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

    /* const uniqueOrderedBy = useMemo(() => {
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
    }, [filteredReturns]); */

    const uniqueTerritory = useMemo(() => {
        const territoryMap = new Map();

        filteredReturns.forEach(salesReturn => {
            if (salesReturn.territory) {
                territoryMap.set(salesReturn.territory.trim(), true);
            }
        });

        return Array.from(territoryMap.keys());
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
                {
                    returnsLoading
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

                                    {/* Product Filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Product</label>
                                        <Select
                                            value={
                                                productKey
                                                    ? {
                                                        value: productKey,
                                                        label: (() => {
                                                            const p = uniqueProducts.find(
                                                                p =>
                                                                    `${p.name}|${p.netWeight}`.toLowerCase() ===
                                                                    productKey.toLowerCase()
                                                            );
                                                            return p ? `${p.name} - ${p.netWeight}` : '';
                                                        })()
                                                    }
                                                    : null
                                            }
                                            onChange={(selected) => setProductKey(selected?.value || '')}
                                            options={[
                                                { value: '', label: 'Select a Product' },
                                                ...uniqueProducts.map(p => ({
                                                    value: `${p.name}|${p.netWeight}`,
                                                    label: `${p.name} - ${p.netWeight}`
                                                }))
                                            ]}
                                            placeholder="Search or Select a Product"
                                            isClearable
                                            isSearchable
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

                                    {/* OrderedBy Filter */}
                                    {/* <div className="col-span-1 md:col-span-2">
                                        <label className="block font-semibold text-gray-700 mb-1">Ordered By</label>
                                        <Select
                                            value={orderedBy ? { value: orderedBy, label: `${orderedBy} - ${uniqueOrderedBy.find(u => u.orderedBy === orderedBy)?.email || ''}` } : null}
                                            onChange={(e) => setOrderedBy(e?.value || '')}
                                            options={[{ value: '', label: "Select a person" }, ...uniqueOrderedBy.map(({ orderedBy, email }) => ({
                                                value: orderedBy,
                                                label: `${orderedBy} - ${email}`
                                            }))]}
                                            placeholder="Search or Select a Person"
                                            isClearable
                                            isSearchable
                                        />
                                    </div> */}

                                    {/* Area Manager Filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Area Manager</label>
                                        <Select
                                            value={areaManager ? { value: areaManager, label: areaManager } : null}
                                            onChange={(e) => setAreaManager(e?.value || '')}
                                            options={[{ value: '', label: "Select an Area Manager" }, ...uniqueAreaManager.map(am => ({
                                                value: am.areaManager,
                                                label: am.amEmail ? `${am.areaManager} - ${am.amEmail}` : am.areaManager
                                            }))]}
                                            placeholder="Search or Select an Area Manager"
                                            isClearable
                                            isSearchable
                                        />
                                    </div>

                                    {/* Customer Filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Customer</label>
                                        <Select
                                            value={
                                                customer
                                                    ? (() => {
                                                        const selected = uniquePharmacies.find(p => p.pharmacyId === customer);
                                                        return {
                                                            value: customer,
                                                            label: `${selected?.pharmacy || ''} - ${customer}`
                                                        };
                                                    })()
                                                    : null
                                            }
                                            onChange={(e) => setCustomer(e?.value || '')}
                                            options={uniquePharmacies.map(c => {
                                                const customerInfo = customers.find(cus => cus.customerId === c.pharmacyId);
                                                return {
                                                    value: c.pharmacyId,
                                                    label: `${c.pharmacy} - ${c.pharmacyId}`,
                                                    address: customerInfo?.address || 'No Address'
                                                };
                                            })}
                                            placeholder="Search or Select a Customer"
                                            isClearable
                                            isSearchable
                                            formatOptionLabel={(option, { context }) => {
                                                if (context === "menu") {
                                                    return (
                                                        <div>
                                                            <div className="font-medium">{option.label}</div>
                                                            <div className="text-sm text-gray-500">{option.address}</div>
                                                        </div>
                                                    );
                                                }
                                                return option.label;
                                            }}
                                        />
                                    </div>

                                    {/* Report Filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Report Type</label>
                                        <Select
                                            value={reportType ? { value: reportType, label: reportType } : null}
                                            onChange={(e) => setReportType(e?.value || 'Products Sales Returns Summary')}
                                            options={[
                                                { value: "Products Sales Returns Summary", label: "Products Sales Returns Summary" },
                                                ...(productKey ? [{ value: "Product wise Products Sales Returns Summary", label: "Product wise Products Sales Returns Summary" }] : []),
                                                ...(orderedBy ? [{ value: "MPO wise Products Sales Returns Summary", label: "MPO wise Products Sales Returns Summary" }] : []),
                                                ...(territory ? [{ value: "Territory wise Products Sales Returns Summary", label: "Territory wise Products Sales Returns Summary" }] : []),
                                                ...(areaManager ? [{ value: "Area Manager wise Products Sales Returns Summary", label: "Area Manager wise Products Sales Returns Summary" }] : []),
                                                ...(customer ? [{ value: "Customer wise Products Sales Returns Summary", label: "Customer wise Products Sales Returns Summary" }] : [])
                                            ]}
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

export default ProductsSalesReturn;