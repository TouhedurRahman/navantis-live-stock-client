import { useState } from "react";
import { BsArrowLeftSquareFill, BsArrowRightSquareFill } from "react-icons/bs";
import { ImSearch } from 'react-icons/im';
import Loader from "../../../../Components/Loader/Loader";
import useOrders from "../../../../Hooks/useOrders";
import OutstandingPaymentCard from "../OutstandingPaymentCard";

const OutstandingPayment = () => {
    const [orders, loading, refetch] = useOrders();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordersPerPage, setOrdersPerPage] = useState(5);

    const outstandingPayments = orders.filter(order => order.status === "outstanding");

    const filteredOrders = outstandingPayments.filter(order =>
        order?.invoice?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length);

    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleOrdersPerPageChange = (e) => {
        setOrdersPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="bg-white mt-3 pb-1">
            {
                outstandingPayments.length > 0
                    ?
                    <>
                        {
                            loading
                                ?
                                <>
                                    <Loader />
                                </>
                                :
                                <>
                                    <div className="px-6">
                                        <div className="mb-5 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center">
                                            <div className="mt-5 md:mt-0">
                                                <label htmlFor="ordersPerPage">Show</label>
                                                <select
                                                    id="ordersPerPage"
                                                    value={ordersPerPage}
                                                    onChange={handleOrdersPerPageChange}
                                                    className="border border-gray-500 rounded p-1 pointer-cursor mx-2"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={15}>15</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                    <option value={250}>250</option>
                                                    <option value={500}>500</option>
                                                </select>
                                                <label htmlFor="ordersPerPage">orders per page</label>
                                            </div>
                                            <div>
                                                {/* Search Input */}
                                                <div className="flex justify-center rounded-l-lg group">
                                                    <div className='flex justify-center items-center border border-gray-500 border-r-0 p-3 rounded-l-full  text-black font-extrabold text-shadow-xl'>
                                                        <ImSearch />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Search invoice"
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
                                                        <th className="text-center">Invoice</th>
                                                        <th className="text-center">Order Date</th>
                                                        <th className='text-left'>Ordered by</th>
                                                        <th className='text-left'>Customer</th>
                                                        <th className='text-right'>Total Products</th>
                                                        <th className='text-right'>Total Unit</th>
                                                        <th className='text-right'>Total Paid</th>
                                                        <th className='text-right'>Total Due</th>
                                                        <th className="text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        currentOrders.map((order, idx) => (
                                                            <OutstandingPaymentCard
                                                                idx={startIndex + idx + 1}
                                                                key={order._id}
                                                                order={order}
                                                                refetch={refetch}
                                                            />
                                                        ))
                                                    }
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
                    </>
                    :
                    <>
                        <p className="text-gray-600 font-mono font-extrabold">
                            No outstanding order(s) found.
                        </p>
                    </>
            }
        </div>
    );
};

export default OutstandingPayment;