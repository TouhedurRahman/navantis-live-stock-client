import { useState } from 'react';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { ImSearch } from 'react-icons/im';
import { useLocation } from 'react-router-dom';
import useCustomer from '../../../Hooks/useCustomer';
import useSingleUser from '../../../Hooks/useSingleUser';
import CustomerCard from '../CustomerCard/CustomerCard';

const MyCustomer = () => {
    const [singleUser] = useSingleUser();
    const [customers, loading, refetch] = useCustomer();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [customersPerPage, setCustomersPerPage] = useState(5);
    const [payModeFilter, setPayModeFilter] = useState('All');

    const location = useLocation();

    const myCustomers = customers.filter(customer =>
        (
            location.pathname.includes('/customer-admin')
            &&
            customer.status === "approved"
        )
        ||
        (
            location.pathname.includes('/institute-list')
            &&
            customer.territory === "Institute"
            &&
            customer.status === "approved"
        )
        ||
        (
            customer.status === "approved"
            && (
                customer.territory === singleUser.territory
                ||
                customer.parentTerritory === singleUser?.territory
                ||
                customer.parentId == singleUser?._id
                ||
                customer.grandParentId == singleUser?._id
            )
        )
    );

    const filteredCustomers = myCustomers.filter(customer =>
        customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (
            payModeFilter === 'All' ||
            (payModeFilter === 'Cash' && customer?.payMode?.includes('Cash') && customer?.payMode?.length === 1) ||
            (payModeFilter === 'STC' && customer?.payMode?.includes('STC')) ||
            (payModeFilter === 'Credit' && customer?.payMode?.includes('Credit'))
        )
    );

    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
    const startIndex = (currentPage - 1) * customersPerPage;
    const endIndex = Math.min(startIndex + customersPerPage, filteredCustomers.length);
    const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCustomersPerPageChange = (e) => {
        setCustomersPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="bg-white mt-3 pb-6">
            {
                myCustomers.length > 0
                    ?
                    <>
                        {
                            loading ? <Loader /> : (
                                <>
                                    {/* Controls */}
                                    <div className="mb-5 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center gap-4">
                                        {/* Per Page */}
                                        <div>
                                            <label htmlFor="customersPerPage">Show</label>
                                            <select
                                                id="customersPerPage"
                                                value={customersPerPage}
                                                onChange={handleCustomersPerPageChange}
                                                className="border border-gray-500 rounded p-1 mx-2"
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={15}>15</option>
                                                <option value={20}>20</option>
                                                <option value={100}>100</option>
                                                <option value={500}>500</option>
                                            </select>
                                            <label>customers per page</label>
                                        </div>

                                        {/* Search */}
                                        <div className="flex items-center border border-gray-500 rounded-full overflow-hidden">
                                            <div className="p-3 text-black font-extrabold">
                                                <ImSearch />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search customers"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="px-3 py-1 w-full focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* PayMode Filter Buttons */}
                                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                                        {['All', 'Cash', 'STC', 'Credit'].map(mode => (
                                            <button
                                                key={mode}
                                                className={`px-4 py-1 rounded-full border text-sm font-semibold 
                                                    ${payModeFilter === mode
                                                        ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                                                        : 'bg-white text-gray-800 border-gray-400 hover:bg-blue-100'
                                                    }`}
                                                onClick={() => {
                                                    setPayModeFilter(mode);
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Table */}
                                    {
                                        filteredCustomers.length !== 0 ? (
                                            <>
                                                <div className="overflow-x-auto mb-3">
                                                    <table className="table w-full">
                                                        <thead>
                                                            <tr>
                                                                <th className="text-center">Sl. No.</th>
                                                                <th className="text-center">Customer ID</th>
                                                                <th>Customer Name</th>
                                                                <th>Address</th>
                                                                <th className='text-center'>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                currentCustomers.map((customer, idx) => (
                                                                    <CustomerCard
                                                                        idx={startIndex + idx + 1}
                                                                        key={customer._id}
                                                                        customer={customer}
                                                                        refetch={refetch}
                                                                    />
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Pagination */}
                                                {
                                                    totalPages > 1 && (
                                                        <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
                                                            {/* Prev */}
                                                            <button
                                                                disabled={currentPage === 1}
                                                                onClick={() => changePage(currentPage - 1)}
                                                                className="disabled:opacity-50 hover:text-blue-700 transition-all"
                                                            >
                                                                <BsArrowLeftCircleFill className='h-6 w-6' />
                                                            </button>

                                                            {/* Pages */}
                                                            {Array.from({ length: totalPages }, (_, index) => (
                                                                <button
                                                                    key={index}
                                                                    className={`mx-1 flex justify-center items-center w-6 h-6 border border-black rounded-full ${currentPage === index + 1 ? 'bg-[#3B82F6] text-white font-mono font-extrabold border-2 border-green-900' : ''
                                                                        }`}
                                                                    onClick={() => changePage(index + 1)}
                                                                >
                                                                    {index + 1}
                                                                </button>
                                                            ))}

                                                            {/* Next */}
                                                            <button
                                                                disabled={currentPage === totalPages}
                                                                onClick={() => changePage(currentPage + 1)}
                                                                className="disabled:opacity-50 hover:text-blue-700 transition-all"
                                                            >
                                                                <BsArrowRightCircleFill className='h-6 w-6' />
                                                            </button>
                                                        </div>
                                                    )
                                                }
                                            </>
                                        )
                                            :
                                            <p className="text-gray-600 font-mono font-extrabold text-center mb-6">
                                                No result found.
                                            </p>
                                    }
                                </>
                            )
                        }
                    </>
                    :
                    <p className="text-gray-600 font-mono font-extrabold text-center">
                        No customer(s) found.
                    </p>
            }
        </div>
    );
};

export default MyCustomer;