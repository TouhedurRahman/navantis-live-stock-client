import { useMemo, useState } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { FaEye } from "react-icons/fa";
import { ImSearch } from 'react-icons/im';
import { MdPrint } from 'react-icons/md';
import { useLocation } from "react-router-dom";
import Loader from "../../../Components/Loader/Loader";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import WhSinDetailsModal from "../../../Components/WhSinDetailsModal/WhSinDetailsModal";
import findDateRange from "../../../Hooks/findDateRange";
import useStockInWh from "../../../Hooks/useStockInWh";

const StockInList = () => {
    const [products, loading] = useStockInWh();
    const [searchTerm, setSearchTerm] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [productsPerPage, setProductsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [isdetailsModalOpen, setdetailsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const location = useLocation();
    const adminPath = location.pathname.includes('/admin-warehouse-in');

    // Filtered products based on search and filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const productDate = new Date(product.date);
            const matchesYear = year ? productDate.getFullYear() === parseInt(year) : true;
            const matchesMonth = month ? productDate.getMonth() + 1 === parseInt(month) : true;
            const matchesDateRange = fromDate && toDate
                ? productDate >= new Date(fromDate) && productDate <= new Date(toDate)
                : true;
            const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
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
    const totalUnit = filteredProducts.reduce((sum, product) => sum + Number(product.totalQuantity), 0);
    const totalAP = filteredProducts.reduce((sum, product) => sum + product.actualPrice * product.totalQuantity, 0);
    const totalTP = filteredProducts.reduce((sum, product) => sum + product.tradePrice * product.totalQuantity, 0);

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

    const handlePrint = () => {
        const companyHeader = `
        <div>
            <div style="position: relative; text-align: center; margin-bottom: 20px;">
                <!-- Picture at the top left -->
                <img 
                    src="https://i.ibb.co.com/VSsxs33/NPL-Updated-Logo.png" 
                    alt="Company Logo" 
                    style="left: 0; width: 150px; height: auto;"
                />
                <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Navantis Pharma Limited</h1>
                <p style="margin: 0; font-size: 10px;">
                    Haque Villa, House No - 4, Block - C, Road No - 3, Section - 1, Kolwalapara, Mirpur - 1, Dhaka - 1216.
                </p>
                <p style="margin: 0; font-size: 10px;">Hotline: +880 1322-852183</p>
            </div>
            <div style="text-align: left; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;"><u>Warehouse Stock in List</u></h3>
                <p style="margin: 5px 0; font-size: 14px; text-align: center;">Date from <b>${firstDate}</b> to <b>${lastDate}</b></p>
            </div>
            <div style="margin-bottom: 20px; padding: 5px 15px; border: 1px solid #B2BEB5; border-radius: 3px;">
                <p style="font-size: 11px; font-weight: bold; text-align: center; text-transform: uppercase;">
                    Summary
                </p>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #B2BEB5;">
                    <span style="font-size: 11px; font-weight: 600;">Total Items</span>
                    <span style="font-size: 11px; font-weight: 700;">${totalUniqueProducts}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #B2BEB5;">
                    <span style="font-size: 11px; font-weight: 600;">Total Quantity</span>
                    <span style="font-size: 11px; font-weight: 700;">${totalUnit}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                    <span style="font-size: 11px; font-weight: 600;">Total Trade Price</span>
                    <span style="font-size: 11px; font-weight: 700;">${totalTP.toLocaleString('en-IN')}/-</span>
                </div>
            </div>
        </div>
    `;

        const filteredTableContent = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: center;">Sl.</th>
                        <th style="text-align: left;">Product Name</th>
                        <th style="text-align: center;">Batch</th>
                        <th style="text-align: center;">Exp.</th>
                        <th style="text-align: right;">Quantity</th>
                        <th style="text-align: right;">Price/Unit</th>
                        <th style="text-align: right;">Total Price</th>
                        <th style="text-align: center;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredProducts.map(
            (product, idx) => `
                            <tr>
                                <td style="text-align: center;">${idx + 1}</td>
                                <td>${product.productName}</td>
                                <td style="text-align: center;">${product.batch}</td>
                                <td style="text-align: center;">${product.expire}</td>
                                <td style="text-align: right;">${product.totalQuantity}</td>
                                <td style="text-align: right;">${product.tradePrice.toLocaleString('en-IN')}/-</td>
                                <td style="text-align: right;">${(product.tradePrice * product.totalQuantity).toLocaleString('en-IN')}/-</td>
                                <td style="text-align: center; white-space: nowrap;">${new Date(product.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                            </tr>
                        `
        ).join('')}
                </tbody>
                <tbody>
                    <tr>
                        <!-- Merged first four columns -->
                        <td colspan="4" style="text-align: center; font-weight: bold;">Total</td>
                        <td style="text-align: right;">${totalUnit}</td>
                        <td style="text-align: right;"></td>
                        <td style="text-align: right;">${totalTP.toLocaleString('en-IN')}/-</td>
                        <td style="text-align: center; white-space: nowrap;"></td>
                    </tr>
                </tbody>
            </table>
        `;

        const currentDateTime = new Date();
        const formattedDateTime = currentDateTime.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

        const formattedDateTimeWithAt = formattedDateTime.replace(', ', ', ');
        const finalFormattedDateTime = formattedDateTimeWithAt.replace(
            ", ",
            ", "
        );

        const newWindow = window.open();
        const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map(
            (style) => style.outerHTML
        ).join('');

        newWindow.document.write(`
            <html>
                <head>
                    <title>Invoice</title>
                    ${styles}
                    <style>
                        @media print {
                            @page {
                                size: A4;
                                margin: 5mm;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                font-family: Arial, sans-serif;
                                position: relative;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            th, td {
                                border: 1px solid black;
                                padding: 8px;
                                text-align: left;
                                vertical-align: middle;
                                font-size: 10px;
                            }
                            th {
                                background-color: #f0f0f0;
                            }
                            td.date-column {
                                white-space: nowrap;
                            }
                            /* Footer styles for all pages */
                            body::after {
                                content: "Printed on ${finalFormattedDateTime}";
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                width: 100%;
                                text-align: center;
                                font-size: 12px;
                                font-style: italic;
                                color: #555;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${companyHeader}
                    ${filteredTableContent}
                </body>
            </html>
        `);

        newWindow.document.close();
        newWindow.print();
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
                    <h1 className="px-6 py-3 font-bold">Warehouse stock in products list</h1>
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
                                                    {
                                                        adminPath
                                                        &&
                                                        <tr>
                                                            <td className="px-4 py-2 border border-gray-200">Actual Price (AP)</td>
                                                            <td className="px-4 py-2 border border-gray-200 text-right">{totalAP.toLocaleString('en-IN')}/-</td>
                                                        </tr>
                                                    }
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
                                <div className="overflow-x-auto mb-3">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="text-center">Sl. No.</th>
                                                <th className="text-left">Name</th>
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
                                                                        setdetailsModalOpen(true)
                                                                        setSelectedProduct(product)
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

            {/* Modals for different operations */}
            {isdetailsModalOpen && (
                <WhSinDetailsModal
                    isOpen={isdetailsModalOpen}
                    onClose={() => setdetailsModalOpen(false)}
                    product={selectedProduct}
                />
            )}
        </div>
    );
};

export default StockInList;