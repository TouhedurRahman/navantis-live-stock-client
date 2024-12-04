import {
    FaArrowDown, FaArrowUp, FaExclamationCircle, FaListUl, FaShoppingCart, FaTrashAlt, FaTruck, FaUserCog, FaWarehouse
} from 'react-icons/fa';
import { FcExpired } from 'react-icons/fc';
import { GiDustCloud } from 'react-icons/gi';
import { IoIosAddCircle } from 'react-icons/io';
import { TbCoinTakaFilled } from 'react-icons/tb';
import { VscGitPullRequestGoToChanges } from 'react-icons/vsc';

const useMenuConfig = () => {
    const menuConfig = {
        admin: {
            icon: <FaUserCog className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/admin-po', icon: <FaShoppingCart className='me-2' />, label: 'Purchase Order' },
                { to: '/purchase-list', icon: <FaListUl className='me-2' />, label: 'Purchase List' },
                { to: '/warehouse-request', icon: <VscGitPullRequestGoToChanges className='me-2' />, label: 'Warehouse Request' },
                { to: '/missing-products', icon: <FaExclamationCircle className='me-2' />, label: 'Missing Products' },
                { to: '/admin-warehouse-in', icon: <FaArrowDown className='me-2' />, label: 'Warehouse In' },
                { to: '/admin-warehouse-out', icon: <FaArrowUp className='me-2' />, label: 'Warehouse Out' },
                { to: '/price-update', icon: <TbCoinTakaFilled className='me-2' />, label: 'Price Update' },
                { to: '/dmg-exp', icon: <FaTrashAlt className='me-2' />, label: 'Damaged & Exp.' },
            ],
        },
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