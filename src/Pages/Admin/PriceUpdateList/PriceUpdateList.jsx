import { useMemo, useState } from "react";
import { BsArrowLeftSquareFill, BsArrowRightSquareFill } from "react-icons/bs";
import { ImSearch } from 'react-icons/im';
import { MdPrint } from 'react-icons/md';
import Loader from "../../../Components/Loader/Loader";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import findDateRange from "../../../Hooks/findDateRange";
import useSingleUser from "../../../Hooks/useSingleUser";
import useUpdatePrice from "../../../Hooks/useUpdatePrice";
import AdminPriceUpdateInvoice from "../../../Invoices/AdminPriceUpdateInvoice";

const PriceUpdateList = () => {
    const [singleUser] = useSingleUser();

    const invoiceWithAP = 1;

    const [products, updatePricesLoading] = useUpdatePrice();
    const [searchTerm, setSearchTerm] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [productsPerPage, setProductsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    // Filtered products based on search and filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const productDate = new Date(product.date);
            const matchesYear = year ? productDate.getFullYear() === parseInt(year) : true;
            const matchesMonth = month ? productDate.getMonth() + 1 === parseInt(month) : true;
            const matchesDateRange = fromDate && toDate
                ? productDate >= new Date(fromDate) && productDate <= new Date(toDate)
                : true;
            const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesYear && matchesMonth && matchesDateRange && matchesSearch;
        });
    }, [products, year, month, fromDate, toDate, searchTerm]);

    const { firstDate, lastDate } = findDateRange(filteredProducts);

    const uniqueProducts = filteredProducts.filter((product, index, self) =>
        index === self.findIndex((p) =>
            p.productName === product.productName
            /* &&
            p.price === product.price
            &&
            p.lot === product.lot
            &&
            p.expire === product.expire */
        )
    );
    const totalUniqueProducts = uniqueProducts.length;

    // Pagination calculations
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);

    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const changePage = (page) => {
        setCurrentPage(page);
    };

    // Clear filter inputs
    const clearFilters = () => {
        setSearchTerm('');
        setYear('');
        setMonth('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    // Print filtered product list
    /* const handlePrint = () => {
        const printContent = document.getElementById("printable-section").innerHTML;
        const newWindow = window.open();
        newWindow.document.write(`<html><head><title>Invoice</title></head><body>${printContent}</body></html>`);
        newWindow.print();
        newWindow.close();
    }; */

    const handlePrintWithAP = AdminPriceUpdateInvoice({ invoiceWithAP, firstDate, lastDate, totalUniqueProducts, filteredProducts });

    const handlePrint = AdminPriceUpdateInvoice({ firstDate, lastDate, totalUniqueProducts, filteredProducts });

    return (
        <div>
            <div>
                <PageTitle
                    from={"Admin"}
                    to={"Price update"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Updated price list</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                {
                    updatePricesLoading
                        ?
                        <Loader />
                        :
                        <>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                                    {/* Filters Section */}
                                    <div className="w-full md:w-[60%] grid grid-cols-1 md:grid-cols-3 gap-1 mb-6">
                                        {/* Name Search */}
                                        <div>
                                            <label htmlFor="search" className="block font-semibold text-gray-700 mb-1">Search by name</label>
                                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm">
                                                <ImSearch className="text-gray-400 mr-2" />
                                                <input
                                                    type="text"
                                                    id="search"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Search products..."
                                                    className="w-full focus:outline-none"
                                                />
                                            </div>
                                        </div>

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

                                        {/* Date Range Filter */}
                                        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-semibold text-gray-700 mb-1">From date</label>
                                                <input
                                                    type="date"
                                                    value={fromDate}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                    className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold text-gray-700 mb-1">To date</label>
                                                <input
                                                    type="date"
                                                    value={toDate}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                    className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Clear Filter Button */}
                                        <button
                                            onClick={clearFilters}
                                            className="col-span-1 md:col-span-3 mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 shadow-sm hover:bg-blue-600 transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>

                                    {/* Invoice Summary Section */}
                                    <div className="w-full md:w-[40%] h-full mt-6 md:mt-0 md:ml-6 p-4 bg-green-100 text-black rounded-lg shadow-sm">
                                        <p className="text-xl text-center font-extrabold">Invoice Summary</p>
                                        <div className="flex justify-center items-center py-4 px-6 rounded-lg">
                                            {/* Total Products */}
                                            <div className="flex flex-col justify-center items-center text-center">
                                                <p className="font-semibold text-gray-800 mt-2">Total Products</p>
                                                <p className="font-extrabold text-xl text-green-600">{totalUniqueProducts}</p>
                                            </div>
                                        </div>

                                        {/* Print Button */}
                                        <div className="flex justify-center items-center">
                                            {
                                                singleUser?.designation === 'Managing Director'
                                                    ?
                                                    <>
                                                        <div className="flex justify-around items-center space-x-2">
                                                            <button
                                                                onClick={handlePrintWithAP}
                                                                className="col-span-1 md:col-span-3 mt-4 bg-green-500 text-white rounded-lg px-4 py-2 flex items-center justify-center shadow-sm hover:bg-green-600 transition-colors"
                                                            >
                                                                <MdPrint className="mr-2" /> Invoice (With AP)
                                                            </button>
                                                            <button
                                                                onClick={handlePrint}
                                                                className="col-span-1 md:col-span-3 mt-4 bg-green-500 text-white rounded-lg px-4 py-2 flex items-center justify-center shadow-sm hover:bg-green-600 transition-colors"
                                                            >
                                                                <MdPrint className="mr-2" /> Invoice (Without AP)
                                                            </button>
                                                        </div>
                                                    </>
                                                    :
                                                    <>
                                                        <button
                                                            onClick={handlePrint}
                                                            className="col-span-1 md:col-span-3 mt-4 bg-green-500 text-white rounded-lg px-4 py-2 flex items-center justify-center shadow-sm hover:bg-green-600 transition-colors"
                                                        >
                                                            <MdPrint className="mr-2" /> Print Invoice
                                                        </button>
                                                    </>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Products Per Page Selector */}
                                <div className="my-4 flex items-center justify-between">
                                    <div>
                                        <label htmlFor="productsPerPage">Show</label>
                                        <select
                                            value={productsPerPage}
                                            onChange={(e) => {
                                                setProductsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="border border-gray-500 rounded p-1 pointer-cursor mx-2"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={20}>20</option>
                                        </select>
                                        <label htmlFor="productsPerPage">products per page</label>
                                    </div>

                                    {/* Page Indicator */}
                                    <div className="text-gray-700 font-semibold">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                </div>

                                {/* Product Table */}
                                <div id="printable-section" className="overflow-x-auto mb-3">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="text-center">Sl. No.</th>
                                                <th className="text-left">Name</th>
                                                <th className="text-left">Pack Size</th>
                                                <th className="text-center">
                                                    New <br />
                                                    Quantity
                                                </th>
                                                <th className="text-center">
                                                    Previous <br />
                                                    Quantity
                                                </th>
                                                <th className="text-center">
                                                    Price <br />
                                                    Type
                                                </th>
                                                <th className="text-right">
                                                    New <br />
                                                    Price
                                                </th>
                                                <th className="text-right">
                                                    Previous <br />
                                                    Price
                                                </th>
                                                <th className="text-right">
                                                    Updated <br />
                                                    Price
                                                </th>
                                                <th className="text-center">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentProducts.map((product, idx) => (
                                                <tr key={product._id} className="border-b">
                                                    <th className="text-center">
                                                        {
                                                            `${startIndex + idx + 1}`
                                                        }
                                                    </th>
                                                    <td>{product.productName}</td>
                                                    <td>{product.netWeight}</td>
                                                    <td className="text-center">{product.newQuantity}</td>
                                                    <td className="text-center">{product.initialQuantity}</td>
                                                    <td className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <p>
                                                                AP
                                                            </p>
                                                            <div className="w-full border-t my-2"></div>
                                                            <p>
                                                                TP
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="text-right">
                                                        <div className="flex flex-col justify-center items-end">
                                                            <p>
                                                                {(product.actualPrice).toLocaleString('en-IN')}/-
                                                            </p>
                                                            <div className="w-full border-t my-2"></div>
                                                            <p>
                                                                {(product.tradePrice).toLocaleString('en-IN')}/-
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="text-right">
                                                        <div className="flex flex-col justify-center items-end">
                                                            <p>
                                                                {(product.initialActualPrice).toLocaleString('en-IN')}/-
                                                            </p>
                                                            <div className="w-full border-t my-2"></div>
                                                            <p>
                                                                {(product.initialTradePrice).toLocaleString('en-IN')}/-
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="text-right">
                                                        <div className="flex flex-col justify-center items-end">
                                                            {/* Actual Price */}
                                                            <p>
                                                                {Math.abs(product.actualPrice - product.initialActualPrice).toLocaleString('en-IN')} /-
                                                                {product.actualPrice > product.initialActualPrice ? " (Inc)" : " (Dec)"}
                                                            </p>

                                                            <div className="w-full border-t my-2"></div>

                                                            {/* Trade Price */}
                                                            <p>
                                                                {Math.abs(product.tradePrice - product.initialTradePrice).toLocaleString('en-IN')} /-
                                                                {product.tradePrice > product.initialTradePrice ? " (Inc)" : " (Dec)"}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="text-center">
                                                        {new Date(product.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {
                                    totalPages > 0 && (
                                        <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
                                            {/* Prev */}
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => changePage(currentPage - 1)}
                                                className="disabled:opacity-50 hover:text-blue-700 transition-all"
                                            >
                                                <BsArrowLeftSquareFill className='w-6 h-6' />
                                            </button>

                                            {/* Pages with dots */}
                                            {
                                                Array.from({ length: totalPages }, (_, i) => i + 1)
                                                    .filter(page =>
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(currentPage - page) <= 1
                                                    )
                                                    .reduce((acc, page, index, array) => {
                                                        if (index > 0 && page - array[index - 1] > 1) {
                                                            acc.push('...');
                                                        }
                                                        acc.push(page);
                                                        return acc;
                                                    }, [])
                                                    .map((page, index) => (
                                                        <button
                                                            key={index}
                                                            disabled={page === '...'}
                                                            onClick={() => page !== '...' && changePage(page)}
                                                            className={`
                                                                    mx-1 
                                                                    h-6 
                                                                    flex items-center justify-center 
                                                                    text-xs font-bold border
                                                                    ${currentPage === page
                                                                    ? 'bg-[#3B82F6] text-white border-green-900'
                                                                    : 'border-gray-400 hover:bg-blue-100'
                                                                }
                                                                ${page === '...'
                                                                    ? 'cursor-default text-gray-500 border-none'
                                                                    : ''
                                                                }
                                                                ${String(page).length === 1 ? 'w-6 px-2 rounded-md' : 'px-2 rounded-md'}
                                                            `}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))
                                            }

                                            {/* Next */}
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => changePage(currentPage + 1)}
                                                className="disabled:opacity-50 hover:text-blue-700 transition-all"
                                            >
                                                <BsArrowRightSquareFill className='w-6 h-6' />
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        </>
                }
            </div>
        </div>
    );
};

export default PriceUpdateList;