import { useMemo, useState } from "react";
import { BsArrowLeftSquareFill, BsArrowRightSquareFill } from "react-icons/bs";
import { FaBullseye, FaEye } from "react-icons/fa";
import { ImSearch } from "react-icons/im";
import Loader from "../../../Components/Loader/Loader";

const AreasTarget = ({ territories = [], loading }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [areasPerPage, setAreasPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");

    const areaTerritories = useMemo(
        () => territories.filter(t => t.territory !== t.parentTerritory),
        [territories]
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleAreasPerPageChange = (e) => {
        setAreasPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const groupedAreas = useMemo(() => {
        const grouped = {};

        areaTerritories.forEach((item) => {
            const key = `${item.parentTerritory}-${item.areaManager}-${item.zonalManager}`;

            if (!grouped[key]) {
                grouped[key] = {
                    parentTerritory: item.parentTerritory,
                    areaManager: item.areaManager,
                    zonalManager: item.zonalManager,
                    products: item.target || [],
                    totalTarget: item.totalTarget || 0,
                };
            } else {
                grouped[key].totalTarget += item.totalTarget || 0;
                grouped[key].products = [...grouped[key].products, ...(item.target || [])];
            }
        });

        return Object.values(grouped).filter(
            (a) =>
                a.parentTerritory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.areaManager?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (a.zonalManager?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [areaTerritories, searchTerm]);

    const totalPages = Math.ceil(groupedAreas.length / areasPerPage);
    const startIndex = (currentPage - 1) * areasPerPage;
    const currentAreas = groupedAreas.slice(startIndex, startIndex + areasPerPage);

    const changePage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    const openModal = (area) => {
        const productMap = {};

        area.products.forEach((p) => {
            const key = `${p.productName}-${p.netWeight}`;
            if (!productMap[key]) {
                productMap[key] = {
                    productName: p.productName,
                    productCode: p.productCode,
                    netWeight: p.netWeight,
                    total: p.targetQuantity || 0,
                };
            } else {
                productMap[key].total += p.targetQuantity || 0;
            }
        });

        setSelectedProducts(Object.values(productMap));
        setModalTitle(area.parentTerritory);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedProducts([]);
        setModalTitle("");
    };

    return (
        <div className="bg-white pb-4">
            {
                loading
                    ?
                    <>
                        <Loader />
                    </>
                    :
                    <>
                        <div>
                            {/* Top controls */}
                            <div className="mb-5 flex flex-col-reverse md:flex-row justify-center md:justify-between items-center">
                                <div className="mt-5 md:mt-0 flex items-center">
                                    <label htmlFor="areasPerPage">Show</label>
                                    <select
                                        id="areasPerPage"
                                        value={areasPerPage}
                                        onChange={handleAreasPerPageChange}
                                        className="border border-gray-500 rounded p-1 mx-2 cursor-pointer"
                                    >
                                        {[5, 10, 15, 20, 50].map((num) => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                    <label htmlFor="areasPerPage">areas per page</label>
                                </div>

                                <div>
                                    <div className="flex justify-center rounded-l-lg group">
                                        <div className="flex justify-center items-center border border-gray-500 border-r-0 p-3 rounded-l-full text-black font-extrabold">
                                            <ImSearch />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search Area / Manager"
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            className="border border-gray-500 border-l-0 px-3 py-1 rounded-r-full focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto mb-3">
                                <table className="table w-full border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="text-center">Sl. No.</th>
                                            <th>Area</th>
                                            <th>Area Manager</th>
                                            <th>Zonal Manager</th>
                                            <th className="text-center">Product Wise View</th>
                                            <th className="text-right">Total Target</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentAreas.length > 0 ? (
                                            currentAreas.map((area, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="text-center">{startIndex + idx + 1}</td>
                                                    <td className="font-bold">{area.parentTerritory}</td>
                                                    <td>{area.areaManager}</td>
                                                    <td>{area.zonalManager}</td>
                                                    <td className="text-center">
                                                        <button
                                                            title="View Product Targets"
                                                            className="p-2 rounded hover:bg-green-100 transition"
                                                            onClick={() => openModal(area)}
                                                        >
                                                            <FaEye className="text-green-600" />
                                                        </button>
                                                    </td>
                                                    <td className="text-right font-semibold">{area.totalTarget}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-gray-500">No areas found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 0 && (
                                <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => changePage(currentPage - 1)}
                                        className="disabled:opacity-50 hover:text-blue-700 transition-all"
                                    >
                                        <BsArrowLeftSquareFill className="w-6 h-6" />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1)
                                        .reduce((acc, page, index, array) => {
                                            if (index > 0 && page - array[index - 1] > 1) acc.push("...");
                                            acc.push(page);
                                            return acc;
                                        }, [])
                                        .map((page, index) => (
                                            <button
                                                key={index}
                                                disabled={page === "..."}
                                                onClick={() => page !== "..." && changePage(page)}
                                                className={`mx-1 h-6 flex items-center justify-center text-xs font-bold border
                                            ${currentPage === page
                                                        ? "bg-[#3B82F6] text-white border-green-900"
                                                        : "border-gray-400 hover:bg-blue-100"
                                                    }
                                            ${page === "..."
                                                        ? "cursor-default text-gray-500 border-none"
                                                        : ""
                                                    }
                                            ${String(page).length === 1 ? "w-6 px-2 rounded-md" : "px-2 rounded-md"}
                                        `}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => changePage(currentPage + 1)}
                                        className="disabled:opacity-50 hover:text-blue-700 transition-all"
                                    >
                                        <BsArrowRightSquareFill className="w-6 h-6" />
                                    </button>
                                </div>
                            )}

                            {/* Modal */}
                            {
                                modalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
                                            {/* Modal Header */}
                                            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 rounded-t-xl">
                                                <div className="flex-1 text-center">
                                                    <h2 className="leading-tight">
                                                        <span className="block text-[12px] uppercase tracking-wide text-gray-500 font-medium">
                                                            Product Targets For
                                                        </span>
                                                        <span className="block text-xl font-semibold text-gray-800 mt-1">
                                                            {modalTitle}
                                                        </span>
                                                    </h2>
                                                    <p className="mt-1 text-sm text-gray-600 flex justify-center items-center gap-4">
                                                        <span className="flex justify-center items-center gap-1">
                                                            <FaBullseye className="text-yellow-600" />
                                                            <span>
                                                                <span className="font-medium">Total</span> {selectedProducts.reduce((sum, p) => sum + (p.total || 0), 0)}
                                                            </span>
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={closeModal}
                                                    className="text-gray-400 hover:text-red-500 transition duration-300 ease-in-out"
                                                    aria-label="Close"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Products Table */}
                                            <table className="w-full text-sm mt-4">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left py-1">Product Name</th>
                                                        <th className="text-left py-1 text-center">Net Weight</th>
                                                        <th className="text-center py-1">Target Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedProducts.length > 0 ? (
                                                        selectedProducts.map((product, idx) => (
                                                            <tr key={idx} className="border-t">
                                                                <td className="text-left py-1">
                                                                    <div className="font-semibold">{product.productName}</div>
                                                                    <div className="text-gray-500 text-xs">{product.productCode}</div>
                                                                </td>
                                                                <td className="py-1 text-center">{product.netWeight}</td>
                                                                <td className="py-1 text-center font-semibold">{product.total}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="text-center py-4 text-gray-500">
                                                                No products found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>

                                            {/* Modal Footer */}
                                            <div className="mt-4 flex justify-center items-center gap-2">
                                                <button
                                                    onClick={closeModal}
                                                    className="px-4 py-2 rounded bg-red-500 hover:bg-red-700 text-white font-bold"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </>
            }
        </div>
    );
};

export default AreasTarget;