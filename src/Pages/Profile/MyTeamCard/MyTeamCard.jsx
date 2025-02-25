import React, { useState } from 'react';
import { FaEye, FaTimes } from 'react-icons/fa';

const MyTeamCard = ({ idx, teamMember, refetch }) => {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td className='text-center'>
                    {teamMember.name}
                </td>
                <td>
                    {teamMember.designation}
                </td>
                <td>
                    {teamMember.territory}
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={() => setModalOpen(true)}
                            title="Customer Details"
                            className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                        >
                            <FaEye className="text-orange-500" />
                        </button>
                    </div>
                </th>
            </tr>

            {/* Modal */}
            {isModalOpen && teamMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-4/5 flex flex-col"
                        style={{ maxHeight: '90%' }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Member Details</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                aria-label="Close modal"
                                className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-5 rounded-lg shadow-sm flex-1 overflow-y-auto">
                            <table className="w-full border-collapse rounded-lg overflow-hidden">
                                <tbody>
                                    {teamMember.name && (
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Name</td>
                                            <td className="px-4 py-3 text-gray-800">{teamMember.name}</td>
                                        </tr>
                                    )}
                                    {teamMember.designation && (
                                        <tr className="border-b bg-gray-50">
                                            <td className="px-4 py-3 font-semibold text-gray-700">Designation</td>
                                            <td className="px-4 py-3 text-gray-800">{teamMember.designation}</td>
                                        </tr>
                                    )}
                                    {teamMember.territory && (
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Territory</td>
                                            <td className="px-4 py-3 text-gray-800">{teamMember.territory}</td>
                                        </tr>
                                    )}
                                    {teamMember.mobile && (
                                        <tr className="border-b bg-gray-50">
                                            <td className="px-4 py-3 font-semibold text-gray-700">Mobile</td>
                                            <td className="px-4 py-3 text-gray-800">{teamMember?.mobile ? `+880 ${teamMember.mobile.slice(-10, -6)}-${teamMember.mobile.slice(-6)}` : "Not updated yet."}</td>
                                        </tr>
                                    )}
                                    {teamMember.email && (
                                        <tr className="border-b">
                                            <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-200">Email</td>
                                            <td className="px-4 py-3 text-gray-800">{teamMember.email}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end px-5 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyTeamCard;