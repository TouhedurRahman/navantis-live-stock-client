import { AiFillMedicineBox } from "react-icons/ai";
import {
    FaArrowDown, FaArrowUp, FaCartPlus, FaExclamationCircle, FaListUl, FaShoppingCart, FaTrashAlt, FaTruck, FaUserCog, FaWarehouse
} from 'react-icons/fa';
import { FcExpired } from 'react-icons/fc';
import { GiDustCloud } from 'react-icons/gi';
import { IoIosAddCircle } from 'react-icons/io';
import { MdOutlineShoppingBag, MdPayment } from 'react-icons/md';
import { TbCoinTakaFilled } from 'react-icons/tb';
import { VscGitPullRequestGoToChanges } from 'react-icons/vsc';
import useSingleUser from './useSingleUser';

const useMenuConfig = () => {
    const [singleUser] = useSingleUser();

    const allowedDesignations = {
        admin: ["Managing Director"],
        warehouse: ["Managing Director", "Warehouse Incharge"],
        depot: ["Managing Director", "Depot Incharge"],
        customer: ["Managing Director", "IT Officer"],
        order: ["Managing Director", "IT Officer", "Skin Care Coordinator", "Medical Promotion Officer", "Area Sales Executive"]
    };

    const baseMenuConfig = {};

    if (allowedDesignations.admin.includes(singleUser?.designation)) {
        baseMenuConfig.admin = {
            icon: <FaUserCog className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/admin-po', icon: <FaShoppingCart className='me-2' />, label: 'Purchase Order' },
                { to: '/purchase-list', icon: <FaListUl className='me-2' />, label: 'Purchase List' },
                { to: '/warehouse-request', icon: <VscGitPullRequestGoToChanges className='me-2' />, label: 'Warehouse Request' },
                { to: '/damage-request', icon: <VscGitPullRequestGoToChanges className='me-2' />, label: 'Damage Request' },
                { to: '/depot-request', icon: <VscGitPullRequestGoToChanges className='me-2' />, label: 'Depot Request' },
                { to: '/expire-request', icon: <VscGitPullRequestGoToChanges className='me-2' />, label: 'Expire Request' },
                { to: '/missing-products', icon: <FaExclamationCircle className='me-2' />, label: 'Missing Products' },
                { to: '/price-update', icon: <TbCoinTakaFilled className='me-2' />, label: 'Price Update' },
                { to: '/dmg-exp', icon: <FaTrashAlt className='me-2' />, label: 'Damaged & Exp.' },
            ],
        };
    }

    if (allowedDesignations.warehouse.includes(singleUser?.designation)) {
        baseMenuConfig.warehouse = {
            icon: <FaWarehouse className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/add-product-warehouse', icon: <IoIosAddCircle className='me-2' />, label: 'Add new' },
                { to: '/depot-delivery', icon: <FaTruck className='me-2' />, label: 'Depot Delivery' },
                { to: '/warehouse-list', icon: <FaListUl className='me-2' />, label: 'List' },
                { to: '/warehouse-in', icon: <FaArrowDown className='me-2' />, label: 'Stock In' },
                { to: '/warehouse-out', icon: <FaArrowUp className='me-2' />, label: 'Stock Out' },
                { to: '/damaged-in-warehouse', icon: <GiDustCloud className='me-2' />, label: 'Damaged' },
            ],
        };
    }

    if (allowedDesignations.depot.includes(singleUser?.designation)) {
        baseMenuConfig.depot = {
            icon: <FaTruck className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/depot-receive-request', icon: <VscGitPullRequestGoToChanges className='me-2' />, label: 'Receive Request' },
                { to: '/depot-list', icon: <FaListUl className='me-2' />, label: 'List' },
                { to: '/depot-in', icon: <FaArrowDown className='me-2' />, label: 'Stock In' },
                { to: '/depot-out', icon: <FaArrowUp className='me-2' />, label: 'Stock Out' },
                { to: '/depot-expired', icon: <FcExpired className='me-2' />, label: 'Expired' },
                { to: '/order-delivery', icon: <FaShoppingCart className='me-2' />, label: 'Order Delivery' },
                { to: '/invoice-payment', icon: <MdPayment className='me-2' />, label: 'Invoice & Payment' },
            ],
        };
    }

    if (allowedDesignations.customer.includes(singleUser?.designation)) {
        baseMenuConfig.customer = {
            icon: <AiFillMedicineBox className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/customer-request', icon: <VscGitPullRequestGoToChanges className='me-2' />, label: 'Customer Request' },
                { to: '/add-customer', icon: <IoIosAddCircle className='me-2' />, label: 'Add new' },
                { to: '/customer-list', icon: <FaListUl className='me-2' />, label: 'Customer List' },
            ],
        };
    }

    if (allowedDesignations.order.includes(singleUser?.designation)) {
        baseMenuConfig.order = {
            icon: <MdOutlineShoppingBag className="mr-2" onClick={() => setSidebarOpen(true)} />,
            links: [
                { to: '/place-order', icon: <FaCartPlus className='me-2' />, label: 'Place Order' },
            ],
        };
    }

    return { menuConfig: baseMenuConfig };
};

export default useMenuConfig;