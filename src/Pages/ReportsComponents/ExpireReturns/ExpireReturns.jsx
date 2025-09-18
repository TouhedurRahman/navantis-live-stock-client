import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import Select from "react-select";
import Loader from "../../../Components/Loader/Loader";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../Hooks/useCustomer";
import useExpiredReturnes from "../../../Hooks/useExpiredReturnes";
import ExpireReturnsExcel from "../../../Reports/ExpireReturnsExcel";
import ExpireReturnsReport from "../../../Reports/ExpireReturnsReport";

const ExpireReturns = () => {
    const [exReturns, exReturnsLoading] = useExpiredReturnes();
    const [customers] = useCustomer();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [exRetStatus, setExRetStatus] = useState('adjusted');
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
                const matchesStatus = exRetStatus ? exReturn.status?.toLowerCase().includes(exRetStatus.toLowerCase()) : true;
                const matchesTerritory = territory ? exReturn.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
                const matchesReturnedBy = returnedBy ? exReturn.returnedBy?.toLowerCase().includes(returnedBy.toLowerCase()) : true;
                const matchesAreaManager = areaManager ? exReturn.areaManager?.toLowerCase().includes(areaManager.toLowerCase()) : true;
                const matchesCustomer = customer ? exReturn.pharmacyId?.toLowerCase().includes(customer.toLowerCase()) : true;

                return matchesYear && matchesMonth && matchesDateRange && matchesStatus && matchesTerritory && matchesReturnedBy && matchesAreaManager && matchesCustomer;
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
    }, [expireReturns, year, month, fromDate, toDate, exRetStatus, productKey, territory, returnedBy, areaManager, customer]);

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
        setExRetStatus('adjusted');
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

    const handleDownloadExcel = ExpireReturnsExcel({
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
                {
                    exReturnsLoading
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

                                    {/* Status filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Status</label>
                                        <select
                                            value={exRetStatus}
                                            onChange={(e) => setExRetStatus(e.target.value)}
                                            className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none bg-white cursor-pointer"
                                        >
                                            <option value="adjusted">Adjusted</option>
                                            < option value="approved">Approved</option>
                                        </select>
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
                                            onChange={(e) => setReportType(e?.value || 'Expire Returns')}
                                            options={[
                                                { value: "Expire Returns", label: "Expire Returns" },
                                                ...(productKey ? [{ value: "Product wise Expire Returns", label: "Product wise Expire Returns" }] : []),
                                                ...(returnedBy ? [{ value: "MPO wise Expire Returns", label: "MPO wise Expire Returns" }] : []),
                                                ...(territory ? [{ value: "Territory wise Expire Returns", label: "Territory wise Expire Returns" }] : []),
                                                ...(areaManager ? [{ value: "Area Manager wise Expire Returns", label: "Area Manager wise Expire Returns" }] : []),
                                                ...(customer ? [{ value: "Customer wise Expire Returns", label: "Customer wise Expire Returns" }] : [])
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

export default ExpireReturns;