import axios from 'axios';
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const WarehouseProductCard = ({ product, refetch }) => {
    return (
        <tr>
            <td>
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
            <td>
                {product.price}
            </td>
            <td>
                {product.quantity}
            </td>
            <td>
                {(product.price) * (product.quantity)}
            </td>
            {/* <th>
                <div className="flex justify-center items-center space-x-4 text-md">
                    <Link to={`/product/${product._id}`}>
                        <button className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none">
                            <FaEye className="text-green-500" />
                        </button>
                    </Link>
                    <Link to={`/update-product/${product._id}`}>
                        <button className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none">
                            <FaEdit className="text-orange-500" />
                        </button>
                    </Link>
                    <button
                        onClick={() => handleDelete()}
                        className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                    >
                        <FaTrashAlt className="text-red-500" />
                    </button>
                </div>
            </th> */}
        </tr>
    );
};

export default WarehouseProductCard;