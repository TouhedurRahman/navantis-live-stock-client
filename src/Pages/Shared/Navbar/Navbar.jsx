import { faAngleDown, faAngleRight, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { FaCircleUser, FaUsers } from "react-icons/fa6";
import { FiTarget } from "react-icons/fi";
import { PiMapPinAreaFill } from "react-icons/pi";
import { RiLogoutCircleRFill } from "react-icons/ri";
import { Link, Outlet } from 'react-router-dom';
import useAuth from '../../../Hooks/useAuth';
import useLogOut from '../../../Hooks/useLogOut';
import useMenuConfig from '../../../Hooks/useMenuConfig';
import useSingleUser from '../../../Hooks/useSingleUser';

const Navbar = () => {
    const { menuConfig } = useMenuConfig();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const today = new Date();
    const year = today.getFullYear();

    const handleLogOut = useLogOut();

    const { user } = useAuth();
    const [singleUser, loadingSingleUser] = useSingleUser();

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
                className={`${isSidebarOpen ? 'w-64' : 'w-16'} 
              bg-blue-500 pt-5 text-white transition-all duration-300 ease-in-out 
              hidden md:flex flex-col h-screen`}
            >
                {/* Top Logo Section (Fixed) */}
                {
                    isSidebarOpen
                        ? <div className='flex flex-col justify-center items-center'>
                            <div className="w-full p-2 pt-0 mb-10">
                                <Link to='/' className="w-full">
                                    <img src="https://i.ibb.co.com/j9d727Dz/npl-updated-logo-white.png" alt="Navantis Pharma Logo" />
                                </Link>
                            </div>
                        </div>
                        : <div className="avatar p-2 pt-0">
                            <div
                                className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 cursor-pointer"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <img src="https://i.ibb.co/4d7LsvY/navantis-3d-logo.gif" alt="Navantis Logo" />
                            </div>
                        </div>
                }

                {/* Scrollable Menu Section */}
                <div className='mt-10 mx-2 flex-1 overflow-y-auto'>
                    {Object.entries(menuConfig).map(([menu, { icon, links }]) => (
                        <div className="relative w-full" key={menu}>
                            {/* Menu Header */}
                            <div
                                onClick={() => {
                                    toggleDropdown(menu);
                                    setSidebarOpen(true);
                                }}

                                className={`flex items-center cursor-pointer px-3 py-2 transition-colors duration-300 rounded-md 
                      hover:bg-gray-700 hover:text-yellow-400
                      ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{icon}</span>
                                    {isSidebarOpen && (
                                        <span className="font-medium text-sm tracking-wide">
                                            {menu.charAt(0).toUpperCase() + menu.slice(1)}
                                        </span>
                                    )}
                                </div>
                                {isSidebarOpen && (
                                    <FontAwesomeIcon
                                        icon={showDropdown[menu] ? faAngleDown : faAngleRight}
                                        className="ml-2 text-sm transition-transform duration-300"
                                    />
                                )}
                            </div>

                            {/* Dropdown Links */}
                            <div
                                className={`pl-4 mt-1 overflow-hidden transition-all duration-300 ease-in-out
                      ${showDropdown[menu] && isSidebarOpen ? 'opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                {links.map(({ to, icon, label }) => (
                                    <Link to={to} key={to} className="block">
                                        <div
                                            className="flex items-center gap-3 px-4 py-1.5 rounded-md cursor-pointer 
                            text-white hover:bg-yellow-400 hover:text-black 
                            transition-all duration-300 transform hover:translate-x-1"
                                        >
                                            <span className="text-base">{icon}</span>
                                            <span className="text-sm">{label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
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
                        <button className="btn btn-ghost text-white">Hi, {user?.displayName}</button>
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
                                                                    `${singleUser?.profilePicture}`
                                                                    :
                                                                    "https://i.ibb.co/6r3zmMg/user.jpg"
                                                            }
                                                        />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-[#1F2937] rounded-lg w-52 rounded-t-none shadow-0">
                                        {
                                            singleUser?.permissions?.includes("territory")
                                            &&
                                            <li><Link to="territory" className='text-white hover:bg-yellow-400 hover:text-black' onClick={() => document.activeElement.blur()}><PiMapPinAreaFill />Territory</Link></li>
                                        }
                                        {
                                            singleUser?.permissions?.includes("target")
                                            &&
                                            <li><Link to="set-target" className='text-white hover:bg-yellow-400 hover:text-black' onClick={() => document.activeElement.blur()}><FiTarget />Target</Link></li>
                                        }
                                        <li><Link to="profile" className='text-white hover:bg-yellow-400 hover:text-black' onClick={() => document.activeElement.blur()}><FaCircleUser />Profile</Link></li>
                                        {
                                            singleUser?.permissions?.includes("all-users")
                                            &&
                                            <li><Link to="all-users" className='text-white hover:bg-yellow-400 hover:text-black' onClick={() => document.activeElement.blur()}><FaUsers />All Users</Link></li>
                                        }
                                        <li><Link onClick={() => { handleLogOut(); document.activeElement.blur(); }} className='text-white hover:bg-yellow-400 hover:text-black'><RiLogoutCircleRFill />Log Out</Link></li>
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
                <div
                    className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} 
              w-1/2 h-screen absolute top-[80px] z-10 
              bg-[#1F2937] p-4 text-white overflow-y-auto`}
                >
                    {Object.entries(menuConfig).map(([menu, { icon, links }]) => (
                        <div className="relative w-full" key={menu}>
                            {/* Menu Header */}
                            <div
                                onClick={() => toggleDropdown(menu)}
                                className={`flex items-center cursor-pointer px-3 py-1.5 transition-colors duration-300 rounded-md 
                    hover:bg-gray-700 hover:text-yellow-400
                    ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{icon}</span>
                                    {isSidebarOpen && (
                                        <span className="font-medium text-sm tracking-wide">
                                            {menu.charAt(0).toUpperCase() + menu.slice(1)}
                                        </span>
                                    )}
                                </div>
                                {isSidebarOpen && (
                                    <FontAwesomeIcon
                                        icon={showDropdown[menu] ? faAngleDown : faAngleRight}
                                        className="ml-2 text-sm transition-transform duration-300"
                                    />
                                )}
                            </div>

                            {/* Dropdown Links */}
                            <div
                                className={`pl-4 mt-1 overflow-hidden transition-all duration-300 ease-in-out
                    ${showDropdown[menu] && isSidebarOpen ? 'opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                {links.map(({ to, icon, label }) => (
                                    <Link to={to} key={to} className="block">
                                        <div
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer text-white hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:translate-x-1"
                                        >
                                            <span className="text-base">{icon}</span>
                                            <span className="text-sm">{label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
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