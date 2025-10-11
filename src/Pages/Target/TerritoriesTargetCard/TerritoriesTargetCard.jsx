import { FaEdit } from "react-icons/fa";

const TerritoriesTargetCard = ({ idx, territory, refetch }) => {
    return (
        <>
            <tr>
                <td className='flex justify-center items-center'>{idx}</td>
                <td><div className="font-bold">{territory.territory}</div></td>
                <td>{territory.areaManager}</td>
                <td>{territory.zonalManager}</td>
                <td className="text-center">
                    <button
                        // onClick={}
                        title="Set Target"
                        className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                    >
                        <FaEdit className="text-yellow-500" />
                    </button>
                </td>
                <td className='text-right'>{territory?.totalTarget || 0}</td>
            </tr>
        </ >
    );
};

export default TerritoriesTargetCard;