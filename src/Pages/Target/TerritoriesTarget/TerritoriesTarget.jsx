import { useMemo, useState } from "react";
import { BsArrowLeftSquareFill, BsArrowRightSquareFill } from "react-icons/bs";
import { ImSearch } from "react-icons/im";
import Loader from "../../../Components/Loader/Loader";
import TerritoriesTargetCard from "../territoriesTargetCard/territoriesTargetCard";

const TerritoriesTarget = ({ territoriesList = [], loading, refetch }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [territoriesPerPage, setTerritoriesPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleTerritoriesPerPageChange = (e) => {
        setTerritoriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const filteredTerritories = useMemo(() => {
        return territoriesList.filter((t) =>
            t.territory?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [territoriesList, searchTerm]);

    const totalPages = Math.ceil(filteredTerritories.length / territoriesPerPage);
    const startIndex = (currentPage - 1) * territoriesPerPage;
    const currentTerritories = filteredTerritories.slice(startIndex, startIndex + territoriesPerPage);

    const changePage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="bg-white pb-4">
            {loading ? (
                <Loader />
            ) : (
                <div className="px-6">
                    {/* === Controls: Search + Per Page === */}
                    <div className="mb-5 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center">
                        {/* Per page selector */}
                        <div className="mt-5 md:mt-0 flex items-center">
                            <label htmlFor="territoriesPerPage">Show</label>
                            <select
                                id="territoriesPerPage"
                                value={territoriesPerPage}
                                onChange={handleTerritoriesPerPageChange}
                                className="border border-gray-500 rounded p-1 mx-2 cursor-pointer"
                            >
                                {[5, 10, 15, 20, 50].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                            <label htmlFor="territoriesPerPage">territories per page</label>
                        </div>

                        {/* Search */}
                        <div>
                            <div className="flex justify-center rounded-l-lg group">
                                <div className="flex justify-center items-center border border-gray-500 border-r-0 p-3 rounded-l-full text-black font-extrabold">
                                    <ImSearch />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search Territory"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="border border-gray-500 border-l-0 px-3 py-1 rounded-r-full focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* === Table === */}
                    <div className="overflow-x-auto mb-3">
                        <table className="table w-full border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-center">Sl. No.</th>
                                    <th>Territory</th>
                                    <th>Area Manager</th>
                                    <th>Zonal Manager</th>
                                    <th className="text-center">Set Target</th>
                                    <th className="text-right">Total Target</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTerritories.length > 0 ? (
                                    currentTerritories.map((territory, idx) => (
                                        <TerritoriesTargetCard
                                            key={territory._id}
                                            idx={startIndex + idx + 1}
                                            territory={territory}
                                            refetch={refetch}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
                                            No territories found.
                                        </td>
                                    </tr>
                                )}
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
            )}
        </div>
    );
};

export default TerritoriesTarget;