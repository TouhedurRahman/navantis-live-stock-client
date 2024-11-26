import { FaArrowDown, FaArrowUp, FaListUl, FaTruck, FaWarehouse } from 'react-icons/fa';
import { FcExpired } from 'react-icons/fc';
import { GiDustCloud } from 'react-icons/gi';
import { IoIosAddCircle } from 'react-icons/io';

const useMenuConfig = () => {
    const menuConfig = {
        warehouse: {
            icon: <FaWarehouse className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/add-product-warehouse', icon: <IoIosAddCircle className='me-2' />, label: 'Add new' },
                { to: '/warehouse-list', icon: <FaListUl className='me-2' />, label: 'List' },
                { to: '/warehouse-in', icon: <FaArrowDown className='me-2' />, label: 'Stock In' },
                { to: '/warehouse-out', icon: <FaArrowUp className='me-2' />, label: 'Stock Out' },
                { to: '/damaged-in-warehouse', icon: <GiDustCloud className='me-2' />, label: 'Damaged' },
            ],
        },
        depot: {
            icon: <FaTruck className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/depot-list', icon: <FaListUl className='me-2' />, label: 'List' },
                { to: '/depot-in', icon: <FaArrowDown className='me-2' />, label: 'Stock In' },
                { to: '/depot-expired', icon: <FcExpired className='me-2' />, label: 'Expired' },
            ],
        },
    };

    return { menuConfig };
};

export default useMenuConfig;