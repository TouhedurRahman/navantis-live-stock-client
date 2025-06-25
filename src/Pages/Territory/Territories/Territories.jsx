import axios from "axios";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="px-4 py-2 w-[15%]">Territory</th>
                        <th className="px-4 py-2 w-[15%]">Parent Territory</th>
                        <th className="px-4 py-2 w-[27%]">Area Manager</th>
                        <th className="px-4 py-2 w-[27%]">Zonal Manager</th>
                        <th className="px-4 py-2 text-center w-[16%]">Actions</th>
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Territories;