import { useState } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { ImSearch } from 'react-icons/im';
import Loader from "../../../Components/Loader/Loader";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useDamagedProductsWh from "../../../Hooks/useDamagedProductsWh";
import useSingleUser from "../../../Hooks/useSingleUser";
import useWhProducts from "../../../Hooks/useWhProducts";
import CurrentWarehouseStockInvoice from "../../../Invoices/CurrentWarehouseStockInvoice";
import WarehouseProductCard from "../WarehouseProductCard/WarehouseProductCard";

const WhProductsList = () => {
    const [singleUser] = useSingleUser();
    const [whProducts, whProductsLoading, refetch] = useWhProducts();
    const [products] = useDamagedProductsWh();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [productsPerPage, setProductsPerPage] = useState(5);

    const invoiceWithAP = singleUser?.designation === "Managing Director" ? 1 : 0;

    const filteredProducts = whProducts.filter(product =>
        product?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);

    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const totalUnit = filteredProducts.reduce((sum, product) => sum + Number(product.totalQuantity), 0);
    const totalActualPrice = filteredProducts.reduce((sum, product) => sum + product.actualPrice * product.totalQuantity, 0);
    const totalTradePrice = filteredProducts.reduce((sum, product) => sum + product.tradePrice * product.totalQuantity, 0);

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleProductsPerPageChange = (e) => {
        setProductsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePrint = CurrentWarehouseStockInvoice({ invoiceWithAP, totalUnit, totalActualPrice, totalTradePrice, filteredProducts });

    return (
        <>
            <div>
                <PageTitle
                    from={"Warehouse"}
                    to={"Products list"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Warehouse products list</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                {
                    whProductsLoading
                        ?
                        <>
                            <Loader />
                        </>
                        :
                        <>
                            {/* Product Info */}
                            <div className="m-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md">
                                <p className="text-md text-gray-700 text-center mb-4 font-medium">Warehouse Summary</p>

                                <div className="bg-white p-3 rounded-md shadow-sm flex flex-col md:flex-row justify-around items-center text-gray-600 gap-2">
                                    <p className="text-sm">
                                        Total Products: <span className="font-medium text-blue-700">{filteredProducts.length}</span>
                                    </p>
                                    <p className="text-sm">
                                        Total Unit: <span className="font-medium text-blue-700">{totalUnit}</span>
                                    </p>
                                    <p className="text-sm">
                                        Total Trade Price: <span className="font-medium text-blue-700">{totalTradePrice.toLocaleString('en-IN')}/-</span>
                                    </p>
                                </div>

                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={handlePrint}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center gap-2 hover:scale-105"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V4h12v5M6 18h12v2H6v-2zM6 14h12v2H6v-2z" />
                                        </svg>
                                        Print Current Warehouse Stock
                                    </button>
                                </div>
                            </div>
                            <div className="px-6">
                                <div className="mb-5 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center">
                                    <div className="mt-5 md:mt-0">
                                        <label htmlFor="productsPerPage">Show</label>
                                        <select
                                            id="productsPerPage"
                                            value={productsPerPage}
                                            onChange={handleProductsPerPageChange}
                                            className="border border-gray-500 rounded p-1 pointer-cursor mx-2"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                        <label htmlFor="productsPerPage">products per page</label>
                                    </div>
                                    <div>
                                        {/* Search Input */}
                                        <div className="flex justify-center rounded-l-lg group">
                                            <div className='flex justify-center items-center border border-gray-500 border-r-0 p-3 rounded-l-full  text-black font-extrabold text-shadow-xl'>
                                                <ImSearch />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search products"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="border border-gray-500 border-l-0 px-3 py-1 rounded-r-full focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto mb-3">
                                    <table className="table">
                                        {/* head */}
                                        <thead>
                                            <tr>
                                                <th className="text-center">Sl. No.</th>
                                                <th>Name</th>
                                                <th>Pack Size</th>
                                                <th className='text-center'>Batch</th>
                                                <th className='text-center'>Exp.</th>
                                                <th className='text-center'>Quantity</th>
                                                <th className='text-right'>Price/Unit</th>
                                                <th className='text-right'>Total Price</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                currentProducts.map((product, idx) => (
                                                    <WarehouseProductCard
                                                        idx={startIndex + idx + 1}
                                                        key={product._id}
                                                        product={product}
                                                        refetch={refetch}
                                                        damagedProducts={products}
                                                    />
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
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
        </>
    );
};

export default WhProductsList;