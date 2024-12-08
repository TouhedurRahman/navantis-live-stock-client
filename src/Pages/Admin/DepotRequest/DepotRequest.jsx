import { useState } from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { ImSearch } from 'react-icons/im';
import Loader from "../../../Components/Loader/Loader";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useDepotRequest from "../../../Hooks/useDepotRequest";
import DepotReqProductCard from "../DepotReqProductCard/DepotReqProductCard";

const DepotRequest = () => {
    const [depotReqProducts, dptReqLoading, dptReqRefetch] = useDepotRequest();
    // const [whProducts, whProductsLoading] = useWhProducts();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [productsPerPage, setProductsPerPage] = useState(5);

    const requestedProducts = depotReqProducts.filter(product => product.status === "requested");

    const filteredProducts = requestedProducts.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);

    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    /* const totalUnit = filteredProducts.reduce((sum, product) => sum + Number(product.totalQuantity), 0);
    const totalActualPrice = filteredProducts.reduce((sum, product) => sum + product.actualPrice * product.totalQuantity, 0);
    const totalTradePrice = filteredProducts.reduce((sum, product) => sum + product.tradePrice * product.totalQuantity, 0); */

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

    return (
        <>
            <div>
                <PageTitle
                    from={"Admin"}
                    to={"Depot request"}
                />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Depot request list</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                {
                    dptReqLoading
                        ?
                        <>
                            <Loader />
                        </>
                        :
                        <>
                            {/* Product Info */}
                            {/* <div className="m-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md">
                                <p className="text-md text-gray-700 text-center mb-4 font-medium">Warehouse Request Summary</p>

                                <div className="bg-white p-3 rounded-md rounded-b-none shadow-sm flex flex-col md:flex-row justify-around items-center text-gray-600">
                                    <p className="text-sm">
                                        Total Products: <span className="font-medium text-blue-700">{filteredProducts.length}</span>
                                    </p>
                                    <p className="text-sm">
                                        Total Unit: <span className="font-medium text-blue-700">{totalUnit}</span>
                                    </p>
                                </div>

                                <div className="bg-white p-3 rounded-md rounded-t-none shadow-sm flex flex-col md:flex-row justify-around items-center text-gray-600">
                                    <p className="text-sm">
                                        Total Actual Price: <span className="font-medium text-blue-700">{totalActualPrice.toLocaleString('en-IN')}/-</span>
                                    </p>
                                    <p className="text-sm">
                                        Total Trade Price: <span className="font-medium text-blue-700">{totalTradePrice.toLocaleString('en-IN')}/-</span>
                                    </p>
                                </div>
                            </div> */}
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
                                                <th className='text-center'>Warehouse Quantity</th>
                                                <th className='text-center'>Depot Quantity</th>
                                                <th className='text-center'>Requested Quantity</th>
                                                <th className="text-center">Details</th>
                                                <th className="text-center">Approve</th>
                                                <th className="text-center">Deny</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                currentProducts.map((product, idx) => (
                                                    <DepotReqProductCard
                                                        idx={startIndex + idx + 1}
                                                        key={product._id}
                                                        product={product}
                                                        refetch={dptReqRefetch}
                                                    // whProducts={whProducts}
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

export default DepotRequest;