import React, { useState } from 'react';
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from 'react-icons/bs';
import { ImSearch } from 'react-icons/im';
import useAllUsers from '../../../Hooks/useAllUsers';
import useAuth from '../../../Hooks/useAuth';
import MyTeamCard from '../MyTeamCard/MyTeamCard';

const MyTeam = () => {
    const { user } = useAuth();
    const [allUsers, loading, refetch] = useAllUsers();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [usersPerPage, setUsersPerPage] = useState(5);

    const currentUserInfos = allUsers.find(allu => allu.email === user?.email);

    const myTeamMembers = allUsers.filter(allu =>
        allu.parentId === currentUserInfos._id
    );

    const filteredUsers = myTeamMembers.filter(teamMember =>
        teamMember?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, filteredUsers.length);

    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleUsersPerPageChange = (e) => {
        setUsersPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="bg-white mt-3 pb-1">
            {
                myTeamMembers.length > 0
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
                                                <label htmlFor="usersPerPage">Show</label>
                                                <select
                                                    id="usersPerPage"
                                                    value={usersPerPage}
                                                    onChange={handleUsersPerPageChange}
                                                    className="border border-gray-500 rounded p-1 pointer-cursor mx-2"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={15}>15</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                </select>
                                                <label htmlFor="usersPerPage">members per page</label>
                                            </div>
                                            <div>
                                                {/* Search Input */}
                                                <div className="flex justify-center rounded-l-lg group">
                                                    <div className='flex justify-center items-center border border-gray-500 border-r-0 p-3 rounded-l-full  text-black font-extrabold text-shadow-xl'>
                                                        <ImSearch />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Search member"
                                                        value={searchTerm}
                                                        onChange={handleSearch}
                                                        className="border border-gray-500 border-l-0 px-3 py-1 rounded-r-full focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            filteredUsers.length !== 0
                                                ?
                                                <>
                                                    <div className="overflow-x-auto mb-3">
                                                        <table className="table">
                                                            {/* head */}
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-center">Sl. No.</th>
                                                                    <th className="text-center">Name</th>
                                                                    <th>Designation</th>
                                                                    <th>Territory</th>
                                                                    <th className='text-center'>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    currentUsers.map((myUser, idx) => (
                                                                        <MyTeamCard
                                                                            idx={startIndex + idx + 1}
                                                                            key={myUser._id}
                                                                            myUser={myUser}
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
                        }
                    </>
                    :
                    <>
                        <p className="text-gray-600 font-mono font-extrabold">
                            No team member(s) found.
                        </p>
                    </>
            }
        </div>
    );
};

export default MyTeam;