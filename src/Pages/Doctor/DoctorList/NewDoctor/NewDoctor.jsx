import { useState } from "react";
import { BsArrowLeftSquareFill, BsArrowRightSquareFill } from "react-icons/bs";
import { ImSearch } from "react-icons/im";
import useDoctors from "../../../../Hooks/useDoctors";
import useSingleUser from "../../../../Hooks/useSingleUser";
import DoctorCard from "../DoctorCard/DoctorCard";

const NewDoctor = () => {
    const [singleUser] = useSingleUser();
    const [doctors, loading, refetch] = useDoctors();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorsPerPage, setDoctorsPerPage] = useState(5);

    const myDoctors = doctors.filter(doctor =>
        ["pending", "denied"].includes(doctor.status)
        &&
        (
            doctor.territory === singleUser.territory
            ||
            doctor.parentTerritory === singleUser?.territory
            ||
            doctor.parentId == singleUser?._id
            ||
            doctor.grandParentId == singleUser?._id
        )
    );

    const filteredDoctors = myDoctors.filter(doctor =>
        doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

    const startIndex = (currentPage - 1) * doctorsPerPage;
    const endIndex = Math.min(startIndex + doctorsPerPage, filteredDoctors.length);

    const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleOrdersPerPageChange = (e) => {
        setDoctorsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="bg-white mt-3 pb-1">
            {
                myDoctors.length > 0
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
                                    <div className="p-6">
                                        <div className="mb-5 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center">
                                            <div className="mt-5 md:mt-0">
                                                <label htmlFor="doctorsPerPage">Show</label>
                                                <select
                                                    id="doctorsPerPage"
                                                    value={doctorsPerPage}
                                                    onChange={handleOrdersPerPageChange}
                                                    className="border border-gray-500 rounded p-1 pointer-cursor mx-2"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={15}>15</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                </select>
                                                <label htmlFor="doctorsPerPage">doctors per page</label>
                                            </div>
                                            <div>
                                                {/* Search Input */}
                                                <div className="flex justify-center rounded-l-lg group">
                                                    <div className='flex justify-center items-center border border-gray-500 border-r-0 p-3 rounded-l-full  text-black font-extrabold text-shadow-xl'>
                                                        <ImSearch />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Search doctors"
                                                        value={searchTerm}
                                                        onChange={handleSearch}
                                                        className="border border-gray-500 border-l-0 px-3 py-1 rounded-r-full focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            filteredDoctors.length !== 0
                                                ?
                                                <>
                                                    <div className="overflow-x-auto mb-3">
                                                        <table className="table">
                                                            {/* head */}
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-center">Sl. No.</th>
                                                                    <th className="text-center">Doctor ID</th>
                                                                    <th>Doctor Name</th>
                                                                    <th>Visiting Address</th>
                                                                    <th className='text-center'>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    currentDoctors.map((doctor, idx) => (
                                                                        <DoctorCard
                                                                            idx={startIndex + idx + 1}
                                                                            key={doctor._id}
                                                                            doctor={doctor}
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
                                                :
                                                <>
                                                    <p className="text-gray-600 font-mono font-extrabold text-center mb-6">
                                                        No result found.
                                                    </p>
                                                </>
                                        }
                                    </div>
                                </>
                        }
                    </>
                    :
                    <>
                        <p className="text-gray-600 font-mono font-extrabold">
                            No customer(s) found.
                        </p>
                    </>
            }
        </div>
    );
};

export default NewDoctor;