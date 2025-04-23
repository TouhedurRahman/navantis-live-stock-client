import { useMemo, useState } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { FaEye, FaTimes } from "react-icons/fa";
import { ImSearch } from 'react-icons/im';
import { MdPrint } from 'react-icons/md';
import Loader from "../../../../Components/Loader/Loader";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import findDateRange from "../../../../Hooks/findDateRange";
import useExpiredReturnes from "../../../../Hooks/useExpiredReturnes";
import ExpiredReturnsInvoice from "../../../../Invoices/ExpiredReturnsInvoice";

const ExpiredReturns = () => {
    const [expiredReturnes, loading] = useExpiredReturnes();
    const [searchTerm, setSearchTerm] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [productsPerPage, setProductsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    const adjustedExReturns = expiredReturnes.filter(eReturn => eReturn.status === "adjusted");

    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    const filteredExReturns = useMemo(() => {
        return adjustedExReturns.filter(exReturn => {
            const returnDate = new Date(exReturn.date);
            const matchesYear = year ? returnDate.getFullYear() === parseInt(year) : true;
            const matchesMonth = month ? returnDate.getMonth() + 1 === parseInt(month) : true;
            const matchesDateRange = fromDate && toDate
                ? returnDate >= new Date(fromDate) && returnDate <= new Date(toDate)
                : true;
            const matchesSearch = exReturn.productName?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesYear && matchesMonth && matchesDateRange && matchesSearch;
        });
    }, [adjustedExReturns, year, month, fromDate, toDate, searchTerm]);

    const { firstDate, lastDate } = findDateRange(filteredExReturns);

    const uniqueProducts = filteredExReturns.filter((product, index, self) =>
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
    const totalUnit = filteredExReturns.reduce((sum, product) => sum + Number(product.totalQuantity), 0);
    const totalTP = filteredExReturns.reduce((sum, product) => sum + product.tradePrice * product.totalQuantity, 0);

    // Pagination calculations
    const totalPages = Math.ceil(filteredExReturns.length / productsPerPage);

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, filteredExReturns.length);

    const currentProducts = filteredExReturns.slice(startIndex, endIndex);

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

    const handlePrint = ExpiredReturnsInvoice({ firstDate, lastDate, totalUniqueProducts, totalUnit, totalTP, filteredExReturns });

    return (
        <div>
            <div>
                <PageTitle
                    from={"Depot"}
                    to={"Expired returns"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Expired returns products list</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                {
                    loading
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
                                        <div className="flex justify-between items-center py-4 px-6 rounded-lg">
                                            {/* Total Products */}
                                            <div className="flex flex-col justify-center items-center text-center">
                                                <p className="font-semibold text-gray-800 mt-2">Total Products</p>
                                                <p className="font-extrabold text-xl text-green-600">{totalUniqueProducts}</p>
                                            </div>

                                            {/* Total Quantity */}
                                            <div className="flex flex-col justify-center items-center text-center">
                                                <p className="font-semibold text-gray-800 mt-2">Total Unit</p>
                                                <p className="font-extrabold text-xl text-blue-600">{totalUnit}</p>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto text-sm">
                                            <table className="table-auto w-full text-left border border-gray-200">
                                                <thead>
                                                    <tr className="bg-blue-100">
                                                        <th className="px-4 py-2 border border-gray-200">Price Type</th>
                                                        <th className="px-4 py-2 border border-gray-200 text-right">Total Price (৳)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="px-4 py-2 border border-gray-200">Trade Price (TP)</td>
                                                        <td className="px-4 py-2 border border-gray-200 text-right">{totalTP.toLocaleString('en-IN')}/-</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Print Button */}
                                        <div className="flex justify-center items-center">
                                            <button
                                                onClick={handlePrint}
                                                className="col-span-1 md:col-span-3 mt-4 bg-green-500 text-white rounded-lg px-4 py-2 flex items-center justify-center shadow-sm hover:bg-green-600 transition-colors"
                                            >
                                                <MdPrint className="mr-2" /> Print Invoice
                                            </button>
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
                                                <th className="text-center">Batch</th>
                                                <th className="text-center">Exp.</th>
                                                <th className="text-center">Quantity</th>
                                                <th className="text-right">Price/Unit</th>
                                                <th className="text-right">Total Price</th>
                                                <th className="text-center">Date</th>
                                                <th className="text-center">Action</th>
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
                                                    <td className="text-center">{product.batch}</td>
                                                    <td className="text-center">{product.expire}</td>
                                                    <td className="text-center">{product.totalQuantity}</td>
                                                    <td className="text-right">{(product.tradePrice).toLocaleString('en-IN')}/-</td>
                                                    <td className="text-right">{(product.tradePrice * product.totalQuantity).toLocaleString('en-IN')}/-</td>
                                                    <td className="text-center">
                                                        {new Date(product.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                                    </td>
                                                    <td>
                                                        <div className="flex justify-center items-center space-x-4 text-md">
                                                            <button
                                                                onClick={
                                                                    () => {
                                                                        setModalOpen(true)
                                                                        setSelectedReturn(product)
                                                                    }
                                                                }
                                                                title="Details"
                                                                className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                                                            >
                                                                <FaEye className="text-orange-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex justify-center items-center mb-10">
                                    <div
                                        className={`mx-1 px-3 py-1 rounded-lg flex justify-center items-center ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        onClick={currentPage !== 1 ? () => changePage(currentPage - 1) : null}
                                        aria-disabled={currentPage === 1}
                                    >
                                        <span className='flex justify-between items-center text-black'>
                                            <BsArrowLeftCircleFill className='h-6 w-6' />
                                        </span>
                                    </div>
                                    <div className='flex justify-center items-center'>
                                        {
                                            Array.from({ length: totalPages }, (_, index) => (
                                                <button
                                                    key={index}
                                                    className={`mx-1 flex justify-center items-center w-6 h-6 border border-black rounded-full ${currentPage === index + 1 ? 'bg-[#3B82F6] text-white font-mono font-extrabold border-2 border-green-900' : ''
                                                        }`}
                                                    onClick={() => changePage(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))
                                        }
                                    </div>
                                    <div
                                        className={`mx-1 px-3 py-1 rounded-[4px] flex justify-center items-center ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        onClick={currentPage !== totalPages ? () => changePage(currentPage + 1) : null}
                                        aria-disabled={currentPage === totalPages}
                                    >
                                        <span className='flex justify-between items-center text-black'>
                                            <BsArrowRightCircleFill className='h-6 w-6' />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                }
            </div>

            {/* Modal */}
            {isModalOpen && selectedReturn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg h-4/5 flex flex-col"
                        style={{ maxHeight: '90%' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Return Details</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                aria-label="Close modal"
                                className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-5 rounded-lg shadow-sm flex-1 overflow-y-auto">
                            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Name</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.productName}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Batch</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.batch}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Expire</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.expire}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Quantity</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.totalQuantity}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">TP</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.tradePrice}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Total Price</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.totalPrice}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Return By</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.returnedBy}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Pharmacy</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.pharmacy} - {selectedReturn.pharmacyId}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Territory</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.territory}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Area Manager</td>
                                        <td className="px-4 py-3 text-gray-800">{selectedReturn.areaManager}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Date</td>
                                        <td className="px-4 py-3 text-gray-800">{new Date(selectedReturn.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                                    </tr>
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">Status</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full shadow-md 
                                                            ${((selectedReturn.status === "adjusted")) ? "bg-green-500 text-white" : ((selectedReturn.status === "approved")) ? "bg-yellow-500 text-white" : ((selectedReturn.status === "pending")) ? "bg-orange-500 text-white" : "bg-red-500 text-white"}`}>
                                                {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpiredReturns;