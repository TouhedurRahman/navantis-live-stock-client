const StockInCard = ({ product }) => {
    const tp = (product.price) * (product.quantity);

    return (
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
            <td className='text-right'>
                {product.price.toLocaleString('en-IN')}/-
            </td>
            <td className='text-center'>
                {product.quantity}
            </td>
            <td className='text-right'>
                {tp.toLocaleString('en-IN')}/-
            </td>
            <td className='text-center'>
                {new Date(product.date).toISOString().split('T')[0].split('-').reverse().join('-')}
                {/* {new Date(product.date).toLocaleDateString('en-GB')} */}
            </td>
        </tr>
    );
};

export default StockInCard;