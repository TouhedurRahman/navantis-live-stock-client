import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import Select from "react-select";
import Loader from "../../../../Components/Loader/Loader";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useAllUsers from "../../../../Hooks/useAllUsers";
import useCustomer from "../../../../Hooks/useCustomer";
import useOrders from "../../../../Hooks/useOrders";
import useSingleUser from "../../../../Hooks/useSingleUser";
import DueListReport from "../DueListReport/DueListReport";
import DueListReportExcel from "../DueListReportExcel/DueListReportExcel";

const DueList = () => {
    const [singleUser] = useSingleUser();
    const [users] = useAllUsers();
    const [orders, ordersLoading] = useOrders();
    const [customers] = useCustomer();

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [territory, setTerritory] = useState('');
    const [orderedBy, setOrderedBy] = useState('');
    const [areaManager, setAreaManager] = useState('');
    const [customer, setCustomer] = useState('');
    const [reportType, setReportType] = useState('Due Payments');

    const territories = useMemo(() => {
        if (!singleUser || !users) return [];

        let t = singleUser?.territory ? [singleUser.territory] : [];

        const childUsers = users.filter(u => u.parentId === singleUser._id);
        const childTerritories = childUsers.map(u => u.territory);

        return [...new Set([...t, ...childTerritories])];
    }, [singleUser, users]);

    // const deliveredOrders = orders.filter(order => order.status !== 'pending');
    const deliveredOrders = orders.filter(order => {
        if (singleUser?.base !== "Field" && singleUser?.designation !== "Zonal Manager") {
            return order.status !== "pending";
        } else if (singleUser?.designation === "Zonal Manager") {
            return (
                order.status !== "pending" &&
                !["Doctor", "Institute"].includes(order?.territory)
            )
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
            const matchesTerritory = territory ? order.territory?.toLowerCase().includes(territory.toLowerCase()) : true;
            const matchesOrderedBy = orderedBy ? order.orderedBy?.toLowerCase().includes(orderedBy.toLowerCase()) : true;
            const matchesAreaManager = areaManager ? order.areaManager?.toLowerCase().includes(areaManager.toLowerCase()) : true;
            const matchesCustomer = customer ? order.pharmacyId?.toLowerCase().includes(customer.toLowerCase()) : true;

            return matchesYear && matchesMonth && matchesDateRange && matchesTerritory && matchesOrderedBy && matchesAreaManager && matchesCustomer;
        });
    }, [orders, year, month, fromDate, toDate, territory, orderedBy, areaManager, customer]);

    const findDateRange = (orders) => {
        if (!orders.length) return { firstDate: null, lastDate: null };

        const sortedDates = orders.map(order => new Date(order.date)).sort((a, b) => a - b);
        const firstDate = sortedDates[0].toLocaleDateString('en-GB').replace(/\//g, '-');
        const lastDate = sortedDates[sortedDates.length - 1].toLocaleDateString('en-GB').replace(/\//g, '-');

        return { firstDate, lastDate };
    };

    const { firstDate, lastDate } = findDateRange(filteredOrders);

    /* const uniqueOrderedBy = useMemo(() => {
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
    }, [filteredOrders]); */

    const uniqueTerritory = useMemo(() => {
        const territoryMap = new Map();

        filteredOrders.forEach(order => {
            if (order.territory) {
                territoryMap.set(order.territory.trim(), true);
            }
        });

        return Array.from(territoryMap.keys());
    }, [filteredOrders]);

    const uniqueAreaManager = useMemo(() => {
        const amMap = new Map();
        let vacantAdded = false;

        filteredOrders.forEach(order => {
            if (order.areaManager) {
                const areaManager = order.areaManager.trim();
                const amEmail = order.amEmail ? order.amEmail.trim() : null;

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
    }, [filteredOrders]);

    const uniquePharmacies = useMemo(() => {
        const pharmacyMap = new Map();

        filteredOrders.forEach(order => {
            if (order.pharmacyId && order.pharmacy) {
                pharmacyMap.set(order.pharmacyId.trim(), order.pharmacy.trim());
            }
        });

        return Array.from(pharmacyMap.entries()).map(([pharmacyId, pharmacy]) => ({
            pharmacyId,
            pharmacy,
        }));
    }, [filteredOrders]);

    const orderWithPharmacyId = filteredOrders.find(order => order.pharmacyId);
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
        setTerritory('');
        setOrderedBy('');
        setAreaManager('');
        setCustomer('');
        setReportType('Due Payments');
    };

    const handlePrint = DueListReport({
        reportType,
        filteredOrders,
        firstDate,
        lastDate,
        customerCode,
        customerName,
        customerAddress,
        customerMobile
    });

    const handleDownloadExcel = DueListReportExcel({
        reportType,
        filteredOrders,
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
                <PageTitle from={"Accounts"} to={"Due payments"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Due payments report</h1>
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
                                            onChange={(e) => setReportType(e?.value || 'Due Payments')}
                                            options={[
                                                { value: "Due Payments", label: "Due Payments" },
                                                ...(orderedBy ? [{ value: "MPO wise Due Payments", label: "MPO wise Due Payments" }] : []),
                                                ...(territory ? [{ value: "Territory wise Due Payments", label: "Territory wise Due Payments" }] : []),
                                                ...(areaManager ? [{ value: "Area Manager wise Due Payments", label: "Area Manager wise Due Payments" }] : []),
                                                ...(customer ? [{ value: "Customer wise Due Payments", label: "Customer wise Due Payments" }] : [])
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

export default DueList;