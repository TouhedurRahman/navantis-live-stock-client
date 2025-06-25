import axios from "axios";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import useApiConfig from "../../../Hooks/useApiConfig";
import useTerritories from "../../../Hooks/useTerritories";

const Territories = () => {
    const baseUrl = useApiConfig();
    const [territories, loading, refetch] = useTerritories();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        areaTerritory: "",
        areaManager: "",
    });

    const handleEdit = (territory) => {
        setEditingId(territory._id);
        setEditData({
            areaTerritory: territory.areaTerritory || "",
            areaManager: territory.areaManager || "",
        });
    };

    const handleUpdate = async (id) => {
        try {
            const response = await axios.patch(`${baseUrl}/territories/${id}`, editData);
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

    if (loading) return <p className="text-center py-10">Loading territories...</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="px-4 py-2">Territory</th>
                        <th className="px-4 py-2">Area Territory</th>
                        <th className="px-4 py-2">Area Manager</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {territories.map((t) => (
                        <tr key={t._id} className="border-b">
                            <td className="px-4 py-2">{t.territory}</td>
                            <td className="px-4 py-2">
                                {editingId === t._id ? (
                                    <select
                                        className="border px-2 py-1 rounded w-full"
                                        value={editData.areaTerritory}
                                        onChange={(e) =>
                                            setEditData((prev) => ({ ...prev, areaTerritory: e.target.value }))
                                        }
                                    >
                                        <option value="">Select area</option>
                                        {territories.map((ter) => (
                                            <option key={ter._id} value={ter.territory}>
                                                {ter.territory}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    t.areaTerritory || "-"
                                )}
                            </td>
                            <td className="px-4 py-2">
                                {editingId === t._id ? (
                                    <input
                                        type="text"
                                        className="border px-2 py-1 rounded w-full"
                                        value={editData.areaManager}
                                        onChange={(e) =>
                                            setEditData((prev) => ({ ...prev, areaManager: e.target.value }))
                                        }
                                    />
                                ) : (
                                    t.areaManager || "-"
                                )}
                            </td>
                            <td className="px-4 py-2 space-x-2">
                                {editingId === t._id ? (
                                    <>
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
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleEdit(t)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Territories;