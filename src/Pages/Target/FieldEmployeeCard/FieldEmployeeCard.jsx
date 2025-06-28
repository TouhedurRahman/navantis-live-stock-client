import { FaEdit } from "react-icons/fa";

const FieldEmployeeCard = ({ idx, user, refetch, managerDesignations }) => {
    const nonManager = !managerDesignations.includes(user.designation);

    return (
        <>
            <tr>
                <td className='flex justify-center items-center'>
                    {idx}
                </td>
                <td>
                    <div className="font-bold">{user.territory}</div>
                </td>
                <td>
                    {user.name}
                </td>
                <td>
                    {user.designation}
                </td>
                {
                    nonManager
                    &&
                    <td className="text-center">
                        <button
                            onClick={() => handleUpdate()}
                            title="Update Order"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaEdit className="text-yellow-500" />
                        </button>
                    </td>
                }
                <td className='text-right'>
                    {user?.totalTaget || 0}
                </td>
            </tr>
        </>
    );
};

export default FieldEmployeeCard;