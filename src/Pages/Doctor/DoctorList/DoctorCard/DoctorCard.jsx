import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import { Link } from "react-router-dom";
import useSingleUser from "../../../../Hooks/useSingleUser";

const DoctorCard = ({ idx, doctor }) => {
    const [singleUser] = useSingleUser();

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td className='text-center'>
                    {doctor?.doctorId}
                </td>
                <td>
                    {doctor?.name}
                </td>
                <td>
                    {doctor?.visitingAddress}
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            // onClick={() => setModalOpen(true)}
                            title="doctor Details"
                            className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                        >
                            <FaEye className="text-orange-500" />
                        </button>
                        <>
                            {
                                (
                                    !["Managing Director", "Zonal Manager", "Area Manager", "Sr. Area Manager"].includes(singleUser?.designation)
                                )
                                &&
                                <Link
                                    to={`/update-doctor/${doctor._id}`}
                                    title="Edit/update doctor"
                                    className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                                >
                                    <FaEdit className="text-yellow-500" />
                                </Link>
                            }
                        </>
                        <button
                            // onClick={handleRemove}
                            title="Remove doctor"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTrashAlt className="text-red-500" />
                        </button>
                    </div>
                </th>
            </tr>

        </>
    );
};

export default DoctorCard;