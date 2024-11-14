import { FaTimes } from "react-icons/fa";

const DepotProductCard = ({ product, refetch }) => {
    const totalPrice = product.price * product.quantity;

    const handleRemove = () => {
        console.log("Remove product:", product._id);
    };

    return (
        <>
            <tr>
                <td className='flex justify-center items-center'>
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
                                <img
                                    src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAUDI3l9CWbO3p3SzSAzGD6rr_pMxbRjs_oA&s"}
                                    alt="Loading..." />
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <div className="font-bold">{product.name}</div>
                    </div>
                </td>
                <td className='text-center'>
                    {product.lot} <br />
                    {product.expire}
                </td>
                <td className='text-center'>
                    {product.quantity}
                </td>
                <td className='text-right'>
                    {product.price.toLocaleString('en-IN')}/-
                </td>
                <td className='text-right'>
                    {totalPrice.toLocaleString('en-IN')}/-
                </td>
                <th>
                    <div className="flex justify-center items-center space-x-4 text-md">
                        <button
                            onClick={handleRemove}
                            title="Remove product from warehouse"
                            className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                        >
                            <FaTimes className="text-red-500" />
                        </button>
                    </div>
                </th>
            </tr>
        </>
    );
};

export default DepotProductCard;
