import React, { useState } from 'react';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { ImSearch } from 'react-icons/im';
import { useLocation } from 'react-router-dom';
import Loader from '../../../Components/Loader/Loader';
import PageTitle from '../../../Components/PageTitle/PageTitle';
import useExpiredReturnes from '../../../Hooks/useExpiredReturnes';
import useSingleUser from '../../../Hooks/useSingleUser';
import ExReturnReqCard from '../ExReturnReqCard/ExReturnReqCard';

const ExReturnReq = () => {
    const [singleUser] = useSingleUser();
    const [expiredReturns, loading, refetch] = useExpiredReturnes();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [expiredReturnsPerPage, setExpiredReturnsPerPage] = useState(5);

    const location = useLocation();

    const pendingExpiredReturns = expiredReturns.filter(
        eReturn =>
            eReturn.status === 'pending'
    );

    const filteredExpiredReturns = pendingExpiredReturns.filter(eReturn =>
        eReturn?.pharmacy?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredExpiredReturns.length / expiredReturnsPerPage);

    const startIndex = (currentPage - 1) * expiredReturnsPerPage;
    const endIndex = Math.min(startIndex + expiredReturnsPerPage, filteredExpiredReturns.length);

    const currentExpiredReturns = filteredExpiredReturns.slice(startIndex, endIndex);

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleExpiredReturnsPerPageChange = (e) => {
        setExpiredReturnsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div>
            <div>
                {
                    !location.pathname.includes('/customer-admin')
                    &&
                    <PageTitle
                        from={"Admin"}
                        to={"Expired return request"}
                    />
                }
            </div>
            <div className="bg-white pb-1">
                {
                    !location.pathname.includes('/customer-admin')
                    &&
                    <div>
                        <h1 className="px-6 py-3 font-bold">Request to approve expired return(s)</h1>
                        <hr className='text-center border border-gray-500 mb-5' />
                    </div>
                }
                {
                    loading
                        ?
                        <>
                            <Loader />
                        </>
                        :
                        <>
                            {
                                pendingExpiredReturns.length > 0
                                    ?
                                    <>
                                        <div className="px-6">
                                            <div className="mb-5 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center">
                                                <div className="mt-5 md:mt-0">
                                                    <label htmlFor="expiredReturnsPerPage">Show</label>
                                                    <select
                                                        id="expiredReturnsPerPage"
                                                        value={expiredReturnsPerPage}
                                                        onChange={handleExpiredReturnsPerPageChange}
                                                        className="border border-gray-500 rounded p-1 pointer-cursor mx-2"
                                                    >
                                                        <option value={5}>5</option>
                                                        <option value={10}>10</option>
                                                        <option value={15}>15</option>
                                                        <option value={20}>20</option>
                                                        <option value={50}>50</option>
                                                    </select>
                                                    <label htmlFor="expiredReturnsPerPage">requests per page</label>
                                                </div>
                                                <div>
                                                    {/* Search Input */}
                                                    <div className="flex justify-center rounded-l-lg group">
                                                        <div className='flex justify-center items-center border border-gray-500 border-r-0 p-3 rounded-l-full  text-black font-extrabold text-shadow-xl'>
                                                            <ImSearch />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Search pharmacy"
                                                            value={searchTerm}
                                                            onChange={handleSearch}
                                                            className="border border-gray-500 border-l-0 px-3 py-1 rounded-r-full focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {
                                                filteredExpiredReturns.length !== 0
                                                    ?
                                                    <>
                                                        <div className="overflow-x-auto mb-3">
                                                            <table className="table">
                                                                {/* head */}
                                                                <thead>
                                                                    <tr>
                                                                        <th className="text-center">Sl. No.</th>
                                                                        <th>Customer Name & ID</th>
                                                                        <th>Territory</th>
                                                                        <th>Product</th>
                                                                        <th className='text-center'>Quantity</th>
                                                                        <th className='text-center'>Added Date</th>
                                                                        <th className='text-center'>
                                                                            View & Approve
                                                                        </th>
                                                                        <th className="text-center">Deny</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {
                                                                        currentExpiredReturns.map((returnReq, idx) => (
                                                                            <ExReturnReqCard
                                                                                idx={startIndex + idx + 1}
                                                                                key={returnReq._id}
                                                                                returnReq={returnReq}
                                                                                refetch={refetch}
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
                                                    </>
                                                    :
                                                    <>
                                                        <p className="text-gray-600 font-mono font-extrabold text-center mb-6">
                                                            No result found.
                                                        </p>
                                                    </>
                                            }
                                        </div>
                                    </>
                                    :
                                    <>
                                        <p className="text-gray-600 font-mono font-extrabold text-center mb-6">
                                            No expired request added yet.
                                        </p>
                                    </>
                            }
                        </>
                }
            </div>
        </div>
    );
};

export default ExReturnReq;