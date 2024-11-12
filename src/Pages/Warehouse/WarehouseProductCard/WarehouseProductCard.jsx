import { useState } from 'react';
import { FaSyncAlt, FaBox, FaTruck, FaTimes } from "react-icons/fa";
import OperationModal from '../../../Components/OperationModal/OperationModal';

const WarehouseProductCard = ({ product, refetch }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });

    const totalPrice = (product.price) * (product.quantity);

    const openModal = (title, body) => {
        setModalContent({ title, body });
        setModalOpen(true);
    };

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
                            onClick={() => openModal("Update Product", `Are you sure you want to update ${product.name}?`)}
                            title="Update product"
                            className="p-2 rounded-[5px] hover:bg-blue-100 focus:outline-none"
                        >
                            <FaSyncAlt className="text-blue-500" />
                        </button>
                        <button
                            onClick={() => openModal("Stock In", `Add stock for ${product.name}?`)}
                            title="Stock In New Quantity"
                            className="p-2 rounded-[5px] hover:bg-green-100 focus:outline-none"
                        >
                            <FaBox className="text-green-500" />
                        </button>
                        <button
                            onClick={() => openModal("Send to Depot", `Send ${product.name} to depot?`)}
                            title="Send product to depot"
                            className="p-2 rounded-[5px] hover:bg-yellow-100 focus:outline-none"
                        >
                            <FaTruck className="text-yellow-500" />
                        </button>
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

            <OperationModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title={modalContent.title}
                product={product}
                refetch={refetch}
            >
                <p>{modalContent.body}</p>
            </OperationModal>
        </>
    );
};

export default WarehouseProductCard;
