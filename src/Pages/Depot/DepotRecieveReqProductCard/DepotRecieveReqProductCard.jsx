import { FaCheck } from "react-icons/fa";
import Swal from "sweetalert2";

const DepotRecieveReqProductCard = ({ idx, product, refetch }) => {
    const { user } = true;

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleReceive = () => {
        Swal.fire({
            title: "Sure to Receive?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, damage!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    refetch();

                    Swal.fire({
                        title: "Success!",
                        text: "Products received.",
                        icon: "success",
                        showConfirmButton: false,
                        confirmButtonColor: "#3B82F6",
                        timer: 1500
                    });
                } catch (error) {
                    Swal.fire({
                        title: "Error!",
                        text: "Faild. Please try again.",
                        icon: "error",
                        showConfirmButton: false,
                        confirmButtonColor: "#d33",
                        timer: 1500
                    });
                }
            }
        });
    };

    return (
        <>
            <tr>
                <td className='text-center'>
                    {idx}
                </td>
                <td>
                    <div className="font-bold">{product.productName}</div>
                </td>
                <td className='text-center'>
                    {product.batch}
                </td>
                <td className='text-center'>
                    {product.expire}
                </td>
                <td className='text-center'>
                    {product.totalQuantity}
                </td>
                <td className='text-center'>
                    {new Date(product.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                </td>
                <td className='text-center'>
                    <button
                        onClick={handleReceive}
                        title="Remove product from warehouse"
                        className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                    >
                        <FaCheck className="text-green-500" />
                    </button>
                </td>
            </tr >
        </>
    );
};

export default DepotRecieveReqProductCard;
