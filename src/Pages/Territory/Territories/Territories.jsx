import axios from "axios";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import Swal from "sweetalert2";
import useAllUsers from "../../../Hooks/useAllUsers";
import useApiConfig from "../../../Hooks/useApiConfig";

const Territories = ({ territories, refetch }) => {
    const baseUrl = useApiConfig();
    const [users] = useAllUsers();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        parentTerritory: "",
        areaManager: "",
        amEmail: "",
        zonalManager: "",
        zmEmail: ""
    });

    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedTerritory, setSelectedTerritory] = useState(null);
    const [marketPointInput, setMarketPointInput] = useState("");
    const [marketPoints, setMarketPoints] = useState([]);

    const handleEdit = (territory) => {
        setEditingId(territory._id);
        setEditData({
            parentTerritory: territory.parentTerritory,
            areaManager: territory.areaManager,
            amEmail: territory.amEmail || null,
            zonalManager: territory.zonalManager,
            zmEmail: territory.zmEmail || null,
        });
    };

    const handleUpdate = async (id) => {
        try {
            const response = await axios.patch(`${baseUrl}/territories/${id}`, {
                parentTerritory: editData.parentTerritory,
                areaManager: editData.areaManager,
                amEmail: editData.amEmail,
                zonalManager: editData.zonalManager,
                zmEmail: editData.zmEmail,
            });
            if (response.data.modifiedCount > 0) {
                Swal.fire({
                    icon: "success",
                    title: "Territory updated",
                    timer: 1500,
                    showConfirmButton: false,
                });
                setEditingId(null);
                refetch();
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Failed to update",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    const openAssignModal = (territory) => {
        setSelectedTerritory(territory);
        setMarketPoints(territory.marketPoints || []);
        setAssignModalOpen(true);
    };

    const handleAddMarketPoint = () => {
        if (marketPointInput.trim() && !marketPoints.includes(marketPointInput.trim())) {
            setMarketPoints([...marketPoints, marketPointInput.trim()]);
            setMarketPointInput("");
        }
    };

    const handleRemoveMarketPoint = (point) => {
        setMarketPoints(marketPoints.filter(p => p !== point));
    };

    const handleSaveMarketPoints = async () => {
        try {
            const response = await axios.patch(`${baseUrl}/tmpoints/${selectedTerritory._id}`, {
                marketPoints
            });
            if (response.data.modifiedCount > 0) {
                Swal.fire({
                    icon: "success",
                    title: "Market points updated",
                    timer: 1500,
                    showConfirmButton: false,
                });
                setAssignModalOpen(false);
                refetch();
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Failed to update market points",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-2 w-[15%]">Territory</th>
                            <th className="px-4 py-2 w-[15%]">Area</th>
                            <th className="px-4 py-2 w-[20%]">Area Manager</th>
                            <th className="px-4 py-2 w-[20%]">Zonal Manager</th>
                            <th className="px-4 py-2 text-center w-[18%]">Actions</th>
                            <th className="px-4 py-2 text-center  w-[12%]">Market Point</th>
                        </tr>
                    </thead>
                    <tbody>
                        {territories?.map((t) => (
                            <tr key={t._id} className="border-b">
                                <td className="px-4 py-2">{t.territory}</td>
                                <td className="px-4 py-2">
                                    {editingId === t._id ? (
                                        <select
                                            className="border px-2 py-1 rounded w-full"
                                            value={editData.parentTerritory}
                                            onChange={(e) =>
                                                setEditData((prev) => ({ ...prev, parentTerritory: e.target.value }))
                                            }
                                        >
                                            <option value="">Select area</option>
                                            {territories?.map((ter) => (
                                                <option key={ter._id} value={ter.territory}>
                                                    {ter.territory}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        t.parentTerritory || "-"
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {editingId === t._id ? (
                                        <select
                                            className="border px-2 py-1 rounded w-full"
                                            value={`${editData.areaManager || ""}|||${editData.amEmail || ""}`}
                                            onChange={(e) => {
                                                const [selectedName, selectedEmail] = e.target.value.split("|||");
                                                setEditData(prev => ({
                                                    ...prev,
                                                    areaManager: selectedName || "",
                                                    amEmail: selectedEmail || ""
                                                }));
                                            }}
                                        >
                                            <option value="|||">Select Area Manager</option>
                                            <option value="Vacant|||">Vacant</option>

                                            {users
                                                .filter(user =>
                                                    ["Area Manager", "Sr. Area Manager"].includes(user.designation)
                                                )
                                                .map(user => (
                                                    <option
                                                        key={user._id}
                                                        value={`${user.name}|||${user.email}`}
                                                    >
                                                        {user.name} - {user.email}
                                                    </option>
                                                ))}
                                        </select>
                                    ) : (
                                        t.areaManager || "-"
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    {editingId === t._id ? (
                                        <select
                                            className="border px-2 py-1 rounded w-full"
                                            value={`${editData.zonalManager || ""}|||${editData.zmEmail || ""}`}
                                            onChange={(e) => {
                                                const [selectedName, selectedEmail] = e.target.value.split("|||");
                                                setEditData(prev => ({
                                                    ...prev,
                                                    zonalManager: selectedName || "",
                                                    zmEmail: selectedEmail || ""
                                                }));
                                            }}
                                        >
                                            <option value="|||">Select Zonal Manager</option>
                                            <option value="Vacant|||">Vacant</option>

                                            {users
                                                .filter(user =>
                                                    ["Zonal Manager"].includes(user.designation)
                                                )
                                                .map(user => (
                                                    <option
                                                        key={user._id}
                                                        value={`${user.name}|||${user.email}`}
                                                    >
                                                        {user.name} - {user.email}
                                                    </option>
                                                ))}
                                        </select>
                                    ) : (
                                        t.zonalManager || "-"
                                    )}
                                </td>
                                <td className="flex justify-center items-center px-4 py-2 space-x-2">
                                    {editingId === t._id ? (
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => handleUpdate(t._id)}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(t)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-center items-center space-x-2">
                                        {
                                            (
                                                t?.territory === t?.parentTerritory
                                                ||
                                                t?.parentTerritory === null
                                                ||
                                                t?.parentTerritory === undefined
                                            )
                                                ?
                                                null
                                                :
                                                <>
                                                    <button
                                                        onClick={() => openAssignModal(t)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                                                    >
                                                        <PiMapPinSimpleAreaBold /> Assign
                                                    </button>
                                                </>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Assign Modal */}
            {assignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-5">
                        <h2 className="flex flex-col items-center mb-4">
                            <span className="text-sm text-gray-500">Assign Market Points for</span>
                            <span className="text-lg font-semibold text-gray-800">{selectedTerritory?.territory}</span>
                        </h2>

                        {/* Search/Add Box */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={marketPointInput}
                                onChange={(e) => setMarketPointInput(e.target.value)}
                                placeholder="Search or add market point"
                                className="border rounded px-2 py-1 flex-1"
                            />
                            <button
                                onClick={handleAddMarketPoint}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                                Add
                            </button>
                        </div>

                        {/* Filtered & Scrollable List */}
                        <ul className="mb-4 space-y-2 max-h-28 overflow-y-auto rounded p-2">
                            {
                                marketPoints
                                    .filter(point =>
                                        point.toLowerCase().includes(marketPointInput.toLowerCase())
                                    )
                                    .sort((a, b) => {
                                        if (a.toLowerCase() === marketPointInput.toLowerCase()) return -1;
                                        if (b.toLowerCase() === marketPointInput.toLowerCase()) return 1;
                                        return 0;
                                    })
                                    .map((point, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between items-center border-b pb-1"
                                        >
                                            {point}
                                            <button
                                                onClick={() => handleRemoveMarketPoint(point)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </li>
                                    ))
                            }
                            {
                                marketPoints.filter(point =>
                                    point.toLowerCase().includes(marketPointInput.toLowerCase())
                                ).length === 0 && (
                                    <li className="text-center text-gray-500 text-sm py-2">
                                        No market point(s) available
                                    </li>
                                )
                            }
                        </ul>

                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setAssignModalOpen(false)}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveMarketPoints}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Territories;