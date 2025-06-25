import axios from "axios";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import Loader from "../../../Components/Loader/Loader";
import useAllUsers from "../../../Hooks/useAllUsers";
import useApiConfig from "../../../Hooks/useApiConfig";
import useTerritories from "../../../Hooks/useTerritories";

const Territories = () => {
    const baseUrl = useApiConfig();
    const [territories, loading, refetch] = useTerritories();
    const [users, allUsersLoading, allUsersRefetch] = useAllUsers();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        parentTerritory: "",
        areaManager: "",
        amEmail: ""
    });

    const handleEdit = (territory) => {
        setEditingId(territory._id);
        setEditData({
            parentTerritory: territory.parentTerritory,
            areaManager: territory.areaManager || "Vacant",
            amEmail: territory.amEmail || null
        });
    };

    const handleUpdate = async (id) => {
        try {
            const response = await axios.patch(`${baseUrl}/territories/${id}`, {
                parentTerritory: editData.parentTerritory,
                areaManager: editData.areaManager,
                amEmail: editData.amEmail
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

    if (loading) return <Loader />;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="px-4 py-2 w-[20%]">Territory</th>
                        <th className="px-4 py-2 w-[20%]">Parent Territory</th>
                        <th className="px-4 py-2 w-[40%]">Area Manager</th>
                        <th className="px-4 py-2 text-center w-[20%]">Actions</th>
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
                                        value={`${editData.areaManager}|||${editData.amEmail}`}
                                        onChange={(e) => {
                                            const [selectedName, selectedEmail] = e.target.value.split("|||");
                                            setEditData(prev => ({
                                                ...prev,
                                                areaManager: selectedName,
                                                amEmail: selectedEmail
                                            }));
                                        }}
                                    >
                                        <option value="">Select Area Manager</option>
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