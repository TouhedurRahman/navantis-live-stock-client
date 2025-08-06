import { FaEye, FaTimes } from "react-icons/fa";

const DoctorRequestCard = ({ idx, doctor, refetch }) => {
    return (
        <>
            <tr>
                <td className="text-center">{idx}</td>
                <td><div className="font-bold">{doctor.name}</div></td>
                <td>{doctor.visitingAddress}</td>
                <td className="text-center">{doctor.territory}</td>
                <td>{doctor.addedBy}</td>
                <td className="text-center">
                    {new Date(doctor.date).toISOString().split("T")[0].split("-").reverse().join("-")}
                </td>
                <td className="text-center">
                    <button
                        // onClick={() => setModalOpen(true)}
                        title="Details"
                        className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                    >
                        <FaEye className="text-orange-500" />
                    </button>
                </td>
                <td className="text-center">
                    <button
                        // onClick={handleDeny}
                        title="Deny Request"
                        className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                    >
                        <FaTimes className="text-red-500" />
                    </button>
                </td>
            </tr>
        </ >
    );
};

export default DoctorRequestCard;