import { useMemo, useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import Select from "react-select";
import Loader from "../../../../Components/Loader/Loader";
import PageTitle from "../../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../../Hooks/useCustomer";
import CusInvSalesExcel from "../CusInvSalesExcel/CusInvSalesExcel";
import CusInvSalesReport from "../CusInvSalesReport/CusInvSalesReport";

const CusInvSales = () => {
    const [customers, customersLoading] = useCustomer();
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedTerritory, setSelectedTerritory] = useState('');
    const [reportType, setReportType] = useState('Customer Invoice Sales');

    // const approvedCustomers = customers.filter(customer => customer.status === "approved");

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const matchParent = selectedParent ? c.parentTerritory === selectedParent : true;
            const matchTerritory = selectedTerritory ? c.territory === selectedTerritory : true;
            return matchParent && matchTerritory;
        });
    }, [customers, selectedParent, selectedTerritory]);

    const parentTerritories = useMemo(() => {
        const parents = filteredCustomers.map(c => c.parentTerritory).filter(Boolean);
        return [...new Set(parents)];
    }, [filteredCustomers]);

    const territories = useMemo(() => {
        const terr = filteredCustomers
            .filter(c => (selectedParent ? c.parentTerritory === selectedParent : true))
            .map(c => c.territory)
            .filter(Boolean);
        return [...new Set(terr)];
    }, [filteredCustomers, selectedParent]);

    const clearFilters = () => {
        setSelectedParent('');
        setSelectedTerritory('');
        setReportType('Customer Invoice Sales');
    };

    const handlePrint = CusInvSalesReport({ filteredCustomers, reportType });
    const handleDownloadExcel = CusInvSalesExcel({ filteredCustomers, reportType });

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
                {
                    customersLoading
                        ?
                        <>
                            <Loader />
                        </>
                        :
                        <>
                            <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-4'>
                                {/* Filters Section */}
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-6 px-6">
                                    {/* Parent Territory (Area) */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block font-semibold text-gray-700 mb-1">Area</label>
                                        <Select
                                            options={parentTerritories.map(parent => ({
                                                value: parent,
                                                label: parent,
                                            }))}
                                            value={
                                                selectedParent
                                                    ? { value: selectedParent, label: selectedParent }
                                                    : null
                                            }
                                            onChange={option => {
                                                setSelectedParent(option ? option.value : "");
                                                setSelectedTerritory("");
                                            }}
                                            placeholder="Select Area"
                                            isClearable
                                            isSearchable
                                        />
                                    </div>

                                    {/* Territory */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block font-semibold text-gray-700 mb-1">Territory</label>
                                        <Select
                                            options={territories.map(territory => ({
                                                value: territory,
                                                label: territory,
                                            }))}
                                            value={
                                                selectedTerritory
                                                    ? { value: selectedTerritory, label: selectedTerritory }
                                                    : null
                                            }
                                            onChange={option => setSelectedTerritory(option ? option.value : "")}
                                            placeholder="Select Territory"
                                            isClearable
                                            isSearchable
                                        />
                                    </div>

                                    {/* Report Filter */}
                                    <div className='col-span-1 md:col-span-2'>
                                        <label className="block font-semibold text-gray-700 mb-1">Report Type</label>
                                        <Select
                                            value={reportType ? { value: reportType, label: reportType } : null}
                                            onChange={(e) => setReportType(e?.value || 'Customer Invoice Sales')}
                                            options={[
                                                { value: "Customer Invoice Sales", label: "Customer Invoice Sales" },
                                                ...(selectedTerritory ? [{ value: "Territory wise Customer Invoice Sales", label: "Territory wise Customer Invoice Sales" }] : []),
                                                ...(selectedParent ? [{ value: "Area Manager wise Customer Invoice Sales", label: "Area Manager wise Customer Invoice Sales" }] : [])
                                            ]}
                                            isClearable
                                            isSearchable
                                        />
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
                                        onClick={handleDownloadExcel}
                                        className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-all"
                                    >
                                        <span className='flex justify-center items-center'>
                                            <FaFileExcel className='mr-2' /> Download Excel
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </>
                }
            </div>
        </>
    );
};

export default CusInvSales;