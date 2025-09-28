import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { AiFillPrinter } from 'react-icons/ai';
import { BsArrowLeftSquareFill, BsArrowRightSquareFill } from 'react-icons/bs';
import { ImSearch } from 'react-icons/im';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loader from '../../../Components/Loader/Loader';
import useApiConfig from '../../../Hooks/useApiConfig';
import useCustomer from '../../../Hooks/useCustomer';
import useSingleUser from '../../../Hooks/useSingleUser';
import CustomerCard from '../CustomerCard/CustomerCard';
import PrintCustomerDetails from '../PrintCustomerDetails/PrintCustomerDetails';

const MyCustomer = () => {
    const [singleUser] = useSingleUser();
    const [customers, loading, refetch] = useCustomer();
    const baseUrl = useApiConfig();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [customersPerPage, setCustomersPerPage] = useState(5);
    const [payModeFilter, setPayModeFilter] = useState('All');
    const [territoryFilter, setTerritoryFilter] = useState('All');
    const [parentTerritoryFilter, setParentTerritoryFilter] = useState('All');

    const location = useLocation();
    const navigate = useNavigate();

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
                customer.territory === singleUser.territory ||
                // customer.parentTerritory === singleUser?.territory ||
                customer.parentId == singleUser?._id ||
                customer.grandParentId == singleUser?._id
            )
        )
    );

    const filteredCustomers = myCustomers.filter(customer => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchName = customer?.name?.toLowerCase().includes(lowerSearch);
        const matchId = customer?.customerId?.toLowerCase().includes(lowerSearch);

        const matchesSearch = matchName || matchId;

        const matchesPayMode =
            payModeFilter === 'All' ||
            (payModeFilter === 'Cash' && customer?.payMode?.includes('Cash') && customer?.payMode?.length === 1) ||
            (payModeFilter === 'STC' && customer?.payMode?.includes('STC')) ||
            (payModeFilter === 'Credit' && customer?.payMode?.includes('Credit')) ||
            (payModeFilter === 'SpIC' && customer?.payMode?.includes('SpIC'));

        const matchesTerritory =
            territoryFilter === 'All' || customer.territory === territoryFilter;

        const matchesParentTerritory =
            parentTerritoryFilter === 'All' || customer.parentTerritory === parentTerritoryFilter;

        return matchesSearch && matchesPayMode && matchesTerritory && matchesParentTerritory;
    });

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

    const updateCustomerMutation = useMutation({
        mutationFn: async (data) => {
            const { id, ...customerData } = data;

            const updatedCustomer = {
                ...customerData,
                parentTerritory: singleUser?.parentTerritory,
                parentId: singleUser?.parentId || null,
                grandParentId: singleUser?.grandParentId || null,
                addedBy: data.addedby,
                addedEmail: data.addedemail
            };
            const response = await axios.patch(`${baseUrl}/customer/${id}`, updatedCustomer);
            return response.data;
        },
        onError: (error) => {
            console.error("Error adding customer", error);
        },
    });

    const updateCustomer = async () => {
        const matchedCustomers = customers.filter(
            customer => customer.territory === singleUser?.territory
        );

        if (matchedCustomers.length === 0) {
            Swal.fire({
                position: "center",
                icon: "info",
                title: "No matching customers to update.",
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        try {
            await Promise.all(
                matchedCustomers.map(customer => {
                    const updated = {
                        id: customer._id,
                        name: customer.name,
                        territory: customer.territory,
                        tradeLicense: customer.tradeLicense,
                        drugLicense: customer.drugLicense,
                        address: customer.address,
                        mobile: customer.mobile,
                        email: customer.email,
                        contactPerson: customer.contactPerson,
                        discount: customer.discount,
                        payMode: customer.payMode,
                        crLimit: customer.crLimit,
                        dayLimit: customer.dayLimit,
                        addedby: singleUser?.name,
                        addedemail: singleUser?.email,
                        status: customer.status,
                        date: customer.date
                    };

                    return updateCustomerMutation.mutateAsync(updated);
                })
            );

            refetch();
            navigate('/customer-list');

            Swal.fire({
                position: "center",
                icon: "success",
                // title: `${matchedCustomers.length} customer(s) successfully updated.`,
                title: "You're up to date.",
                showConfirmButton: false,
                timer: 2000
            });

        } catch (error) {
            console.log(error);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Failed to update customers",
                text: "Something went wrong.",
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    const handlePrint = PrintCustomerDetails({ filteredCustomers });

    return (
        <div className="bg-white mt-3 pb-6">
            {
                myCustomers.length > 0
                    ?
                    <>
                        {
                            loading
                                ?
                                <Loader />
                                :
                                (
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
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                    <option value={250}>250</option>
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
                                                    placeholder="Name or Customer ID"
                                                    value={searchTerm}
                                                    onChange={handleSearch}
                                                    className="px-3 py-1 w-full focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Filters & Print/Refresh Buttons */}
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-3">

                                            {/* Filter Buttons */}
                                            <div className="flex flex-wrap gap-3 justify-center">
                                                {/* Pay Mode Filter */}
                                                {['All', 'Cash', 'STC', 'Credit', 'SpIC'].map(mode => (
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

                                                {/* Territory Filter */}
                                                <select
                                                    value={territoryFilter}
                                                    onChange={(e) => {
                                                        setTerritoryFilter(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    className="border border-gray-400 rounded px-3 py-1 text-sm font-semibold rounded-full"
                                                >
                                                    <option value="All">Territory</option>
                                                    {[...new Set(myCustomers.map(c => c.territory))].sort().map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>

                                                {/* ParentTerritory Filter */}
                                                <select
                                                    value={parentTerritoryFilter}
                                                    onChange={(e) => {
                                                        setParentTerritoryFilter(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    className="border border-gray-400 rounded px-3 py-1 text-sm font-semibold rounded-full"
                                                >
                                                    <option value="All">Area</option>
                                                    {[...new Set(myCustomers.map(c => c.parentTerritory).filter(Boolean))].sort().map(pt => (
                                                        <option key={pt} value={pt}>{pt}</option>
                                                    ))}
                                                </select>

                                                {/* Clear Button */}
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setPayModeFilter('All');
                                                        setTerritoryFilter('All');
                                                        setParentTerritoryFilter('All');
                                                        setCurrentPage(1);
                                                    }}
                                                    className="px-4 py-1 rounded-full border text-sm font-semibold bg-white text-gray-800 border-gray-400 hover:bg-blue-100"
                                                >
                                                    Clear Filters
                                                </button>
                                            </div>

                                            {/* Print / Refresh Buttons */}
                                            <div className='flex justify-center items-center'>
                                                {singleUser?.base !== 'Field' ? (
                                                    <button
                                                        onClick={handlePrint}
                                                        className="flex justify-center items-center px-4 py-1 rounded-full border text-sm font-semibold bg-white text-gray-800 border-gray-400 hover:bg-blue-100"
                                                    >
                                                        <AiFillPrinter className='me-2' /> Print Details
                                                    </button>
                                                ) : (
                                                    !["Zonal Manager", "Area Manager", "Sr. Area Manager"].includes(singleUser?.designation)
                                                    &&
                                                    <button
                                                        onClick={updateCustomer}
                                                        className="px-4 py-1 rounded-full border text-sm font-semibold bg-white text-gray-800 border-gray-400 hover:bg-blue-100"
                                                    >
                                                        ↻ Refresh
                                                    </button>
                                                )}
                                            </div>
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
                                                </>
                                            )
                                                :
                                                <p className="text-gray-600 font-mono font-extrabold text-center mt-12 mb-6">
                                                    No customer(s) found.
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