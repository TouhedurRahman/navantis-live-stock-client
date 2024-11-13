import { useState, useMemo } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { ImSearch } from 'react-icons/im';
import { MdPrint } from 'react-icons/md';
import useStockInWh from "../../../Hooks/useStockInWh";
import PageTitle from "../../../Components/PageTitle/PageTitle";

const StockInList = () => {
    const [products, loading] = useStockInWh();
    const [searchTerm, setSearchTerm] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [productsPerPage, setProductsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtered products based on search and filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const productDate = new Date(product.date);
            const matchesYear = year ? productDate.getFullYear() === parseInt(year) : true;
            const matchesMonth = month ? productDate.getMonth() + 1 === parseInt(month) : true;
            const matchesDateRange = fromDate && toDate
                ? productDate >= new Date(fromDate) && productDate <= new Date(toDate)
                : true;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesYear && matchesMonth && matchesDateRange && matchesSearch;
        });
    }, [products, year, month, fromDate, toDate, searchTerm]);

    const totalProducts = filteredProducts.length;
    const totalQuantity = filteredProducts.reduce((sum, product) => sum + Number(product.quantity), 0);
    const totalPrice = filteredProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);

    // Pagination calculations
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // Pagination handlers
    const goToPage = (page) => setCurrentPage(page);
    const goToPreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    const goToNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));

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
    const handlePrint = () => {
        const printContent = document.getElementById("printable-section").innerHTML;
        const newWindow = window.open();
        newWindow.document.write(`<html><head><title>Invoice</title></head><body>${printContent}</body></html>`);
        newWindow.print();
        newWindow.close();
    };

    return (
        <div>
            <div>
                <PageTitle
                    from={"Warehouse"}
                    to={"Stock in"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">All stock in products list</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>

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
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
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
                            <p className="text-xl text-center font-medium mb-4">Invoice Summary</p>


                            <div className="grid grid-cols-2 gap-y-2">
                                {/* Total Products */}
                                <p className="font-semibold">Total Products</p>
                                <p className="text-right font-bold">{totalProducts}</p>

                                {/* Total Quantity */}
                                <p className="font-semibold">Total Quantity</p>
                                <p className="text-right font-bold">{totalQuantity}</p>

                                {/* Total Price */}
                                <p className="font-semibold">Total Price</p>
                                <p className="text-right font-bold">{totalPrice.toLocaleString('en-IN')}/-</p>
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
                                    <th className="text-center">Lot & Exp.</th>
                                    <th className="text-center">Quantity</th>
                                    <th className="text-right">Price/Unit</th>
                                    <th className="text-right">Total Price</th>
                                    <th className="text-center">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product, idx) => (
                                    <tr key={product._id} className="border-b">
                                        <th className="text-center">
                                            {
                                                `${idx + 1}`
                                            }
                                        </th>
                                        <td>{product.name}</td>
                                        <td className="text-center">{product.lot} <br /> {product.expire}</td>
                                        <td className="text-center">{product.quantity}</td>
                                        <td className="text-right">{(product.price).toLocaleString('en-IN')}/-</td>
                                        <td className="text-right">{(product.price * product.quantity).toLocaleString('en-IN')}/-</td>
                                        <td className="text-center">
                                            {new Date(product.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
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
            </div>
        </div>
    );
};

export default StockInList;