import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link, Outlet } from 'react-router-dom';
import { MdCallReceived } from "react-icons/md";
import { FaCircleUser, FaTruck, FaUsers, FaWarehouse } from "react-icons/fa6";
import { RiLogoutCircleRFill } from "react-icons/ri";
import { IoIosAddCircle } from "react-icons/io";
import { FaArrowDown, FaArrowUp, FaListUl } from "react-icons/fa";

const Navbar = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const today = new Date();
    const year = today.getFullYear();

    const user = true;
    const loadingSingleUser = false;
    const singleUser = false;

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const [showDropdown, setShowDropdown] = useState({
        warehouse: false,
        depot: false
    });

    const toggleDropdown = (menu) => {
        setShowDropdown((prev) => ({
            // ...prev,
            [menu]: !prev[menu],
        }));
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div
                className={`${isSidebarOpen ? 'w-48' : 'w-16'} bg-blue-500 pt-5 text-white transition-all duration-300 ease-in-out hidden md:block`}
            >
                {
                    isSidebarOpen
                        ? <div className='flex flex-col justify-center items-center'>
                            <div className="w-full p-2 pt-0">
                                <Link to='/' className="w-fullm">
                                    <img src="https://i.ibb.co/pfr6VxM/Logo-Navantis-png-white.png" />
                                </Link>
                            </div>
                            <label className='mt-20 font-bold font-playwrite text-xl text-center'>
                                <p>Live Stock</p>
                            </label>
                            <hr className='text-center w-[25%] border-2 border-white' />
                        </div>
                        : <div className="avatar p-2 pt-0">
                            <div
                                className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 cursor-pointer"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <img src="https://i.ibb.co/4d7LsvY/navantis-3d-logo.gif" />
                            </div>
                        </div>
                }

                <div className='mt-10 mx-2'>
                    {['warehouse', 'depot'].map((menu, index) => (
                        <div className="relative inline-block w-full" key={index}>
                            <div onClick={() => toggleDropdown(menu)} className={`flex items-center cursor-pointer ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                                <div className="flex items-center py-2">
                                    {menu === 'warehouse' && <FaWarehouse onClick={() => setSidebarOpen(true)} className="mr-2" />}
                                    {menu === 'depot' && <FaTruck onClick={() => setSidebarOpen(true)} className="mr-2" />}
                                    {isSidebarOpen && (
                                        <span>{menu.charAt(0).toUpperCase() + menu.slice(1)}</span>
                                    )}
                                </div>
                                {isSidebarOpen && (
                                    <FontAwesomeIcon icon={showDropdown[menu] ? faAngleDown : faAngleRight} />
                                )}
                            </div>
                            {showDropdown[menu] && isSidebarOpen && (
                                <div className="m-2 pl-4">
                                    {menu === 'warehouse' && (
                                        <>
                                            <Link to='/add-product-warehouse' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <IoIosAddCircle className='me-2' />
                                                    <span>Add new</span>
                                                </div>
                                            </Link>
                                            <Link to='/warehouse-list' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaListUl className='me-2' />
                                                    <span>List</span>
                                                </div>
                                            </Link>
                                            <Link to='/warehouse-in' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaArrowDown className='me-2' />
                                                    <span>Stock In</span>
                                                </div>
                                            </Link>
                                            <Link to='/warehouse-out' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaArrowUp className='me-2' />
                                                    <span>Stock Out</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                    {menu === 'depot' && (
                                        <>
                                            <Link to='/depot-list' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaListUl className='me-2' />
                                                    <span>List</span>
                                                </div>
                                            </Link>
                                            <Link to='/depot-in' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaArrowDown className='me-2' />
                                                    <span>Stock In</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between bg-gray-800 p-4">
                    <button onClick={toggleSidebar} className="text-white hidden md:block">
                        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
                    </button>
                    <button onClick={toggleMobileMenu} className="text-white md:hidden">
                        <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
                    </button>
                    <div className='flex justify-center items-center'>
                        <button className="btn btn-ghost text-white">Hi, {user.displayName}</button>
                        {/***** Login & profile section *****/}
                        {
                            user
                                ?
                                <div className="dropdown dropdown-bottom dropdown-end my-auto">
                                    <div tabIndex={0} role="button" className="mt-2">
                                        <div className="avatar">
                                            <div
                                                className="w-8 h-8 rounded-full ring ring-[#3B82F6] ring-offset-white ring-offset-2">
                                                {
                                                    loadingSingleUser
                                                        ?
                                                        ""
                                                        :
                                                        <img
                                                            src={
                                                                singleUser.profilePicture
                                                                    ?
                                                                    `${singleUser.profilePicture}`
                                                                    :
                                                                    "https://i.ibb.co/6r3zmMg/user.jpg"
                                                            }
                                                        />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-[#1F2937] rounded-lg w-52 rounded-t-none shadow-0">
                                        <li><Link to="my-profile" className='text-white' onClick={() => document.activeElement.blur()}><FaCircleUser />Profile</Link></li>
                                        <li><Link to="all-users" className='text-white' onClick={() => document.activeElement.blur()}><FaUsers />All Users</Link></li>
                                        <li><Link onClick={() => { handleLogOut(); document.activeElement.blur(); }} className='text-white'><RiLogoutCircleRFill />Log Out</Link></li>
                                    </ul>
                                </div>
                                :
                                <div className="my-auto ">
                                    <Link to="/login" className="btn btn-ghost mx-3 border-b-4 rounded-none border-b-transparent hover:border-b-white hover:bg-transparent">Login</Link>
                                </div>
                        }
                    </div>
                </div>

                {/* for mobile screen */}
                <div className={`md:hidden ${isMobileMenuOpen ? 'block w-1/2 h-full absolute mt-[80px] z-10' : 'hidden'} bg-[#1F2937] p-4 text-white`}>
                    {['warehouse', 'depot'].map((menu, index) => (
                        <div className="relative inline-block w-full" key={index}>
                            <div onClick={() => toggleDropdown(menu)} className={`flex items-center cursor-pointer ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                                <div className="flex items-center py-2">
                                    {menu === 'warehouse' && <FaWarehouse onClick={() => setSidebarOpen(true)} className="mr-2" />}
                                    {menu === 'depot' && <FaTruck onClick={() => setSidebarOpen(true)} className="mr-2" />}
                                    {isSidebarOpen && (
                                        <span>{menu.charAt(0).toUpperCase() + menu.slice(1)}</span>
                                    )}
                                </div>
                                {isSidebarOpen && (
                                    <FontAwesomeIcon icon={showDropdown[menu] ? faAngleDown : faAngleRight} />
                                )}
                            </div>
                            {showDropdown[menu] && isSidebarOpen && (
                                <div className="m-2 pl-4">
                                    {menu === 'warehouse' && (
                                        <>
                                            <Link to='/add-product-warehouse' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <IoIosAddCircle className='me-2' />
                                                    <span>Add new</span>
                                                </div>
                                            </Link>
                                            <Link to='/warehouse-list' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaListUl className='me-2' />
                                                    <span>List</span>
                                                </div>
                                            </Link>
                                            <Link to='/warehouse-in' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaArrowDown className='me-2' />
                                                    <span>Stock In</span>
                                                </div>
                                            </Link>
                                            <Link to='/warehouse-out' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaArrowUp className='me-2' />
                                                    <span>Stock Out</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                    {menu === 'depot' && (
                                        <>
                                            <Link to='/depot-list' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaListUl className='me-2' />
                                                    <span>List</span>
                                                </div>
                                            </Link>
                                            <Link to='/depot-in' className="w-full text-left px-4 text-white flex">
                                                <div className='flex justify-start items-center cursor:pointer'>
                                                    <FaArrowDown className='me-2' />
                                                    <span>Stock In</span>
                                                </div>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 bg-[#E5E7EB]">
                    <Outlet />
                </div>

                <div className="bg-white p-5">
                    <p className='text-gray-500 font-extrabold'><small>Copyright © {year} by Navantis Pharma Ltd.</small></p>
                </div>
            </div>
        </div>
    );
};

export default Navbar;