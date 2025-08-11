import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../../Hooks/useCustomer";
import CusInvSalesReport from "../CusInvSalesReport/CusInvSalesReport";

const CusInvSales = () => {
    const [customers] = useCustomer();
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedTerritory, setSelectedTerritory] = useState('');

    const parentTerritories = useMemo(() => {
        const parents = customers.map(c => c.parentTerritory).filter(Boolean);
        return [...new Set(parents)];
    }, [customers]);

    const territories = useMemo(() => {
        const terr = customers
            .filter(c => (selectedParent ? c.parentTerritory === selectedParent : true))
            .map(c => c.territory)
            .filter(Boolean);
        return [...new Set(terr)];
    }, [customers, selectedParent]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const matchParent = selectedParent ? c.parentTerritory === selectedParent : true;
            const matchTerritory = selectedTerritory ? c.territory === selectedTerritory : true;
            return matchParent && matchTerritory;
        });
    }, [customers, selectedParent, selectedTerritory]);

    const clearFilters = () => {
        setSelectedParent('');
        setSelectedTerritory('');
    };

    const handlePrint = CusInvSalesReport({ filteredCustomers });

    return (
        <>
            <div>
                <PageTitle from={"Reports"} to={"Customer invoice & sales"} />
            </div>
            <div className="bg-white pb-1">
                <div>
                    <h1 className="px-6 py-3 font-bold">Customer invoice & sales report</h1>
                    <hr className='text-center border border-gray-500 mb-5' />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4'>
                    {/* Filters Section */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-6 px-6">
                        {/* Parent Territory */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Area</label>
                            <select
                                value={selectedParent}
                                onChange={e => {
                                    setSelectedParent(e.target.value);
                                    setSelectedTerritory("");
                                }}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select Area</option>
                                {parentTerritories.map((parent, idx) => (
                                    <option key={idx} value={parent}>
                                        {parent}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Territory */}
                        <div className='col-span-1 md:col-span-2'>
                            <label className="block font-semibold text-gray-700 mb-1">Territory</label>
                            <select
                                value={selectedTerritory}
                                onChange={e => setSelectedTerritory(e.target.value)}
                                className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none bg-white shadow-sm cursor-pointer"
                            >
                                <option value="">Select Territory</option>
                                {territories.map((territory, idx) => (
                                    <option key={idx} value={territory}>
                                        {territory}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Clear Filters Button */}
                        <button
                            onClick={clearFilters}
                            className="col-span-1 md:col-span-2 mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 shadow-sm hover:bg-blue-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>

                    {/* button section */}
                    <div className="w-full flex flex-col gap-4 px-6 mt-4">
                        {/* print pdf button */}
                        <button
                            onClick={handlePrint}
                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                        >
                            <span className='flex justify-center items-center'>
                                <FaFilePdf className='mr-2' /> Print PDF
                            </span>
                        </button>

                        {/* download excel file button */}
                        <button
                            // onClick={handleDownloadExcel}
                            className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                        >
                            <span className='flex justify-center items-center'>
                                <FaFileExcel className='mr-2' /> Download Excel
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CusInvSales;