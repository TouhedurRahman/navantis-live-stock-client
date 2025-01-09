const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-96 p-4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-red-500  rounded-full px-2 hover:bg-red-500 hover:text-white"
                >
                    &times;
                </button>
                <div className="flex justify-center items-center mb-4">
                    <div className="avatar">
                        <div className="mask mask-squircle h-24 w-24">
                            <img
                                src={
                                    user.profilePicture
                                        ? `${user.profilePicture}`
                                        : "https://i.ibb.co/6r3zmMg/user.jpg"
                                }
                                alt="User Avatar"
                            />
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="">{user.designation && user.designation}</p>
                    <p className="text-sm text-gray-500 mt-3">✉ {user.email}</p>
                    <p className="text-sm text-gray-500">{user.mobile && `✆ ${user.mobile}`}</p>
                    <p className="mt-3">{!user?.designation && 'Requested to assign designation'}</p>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;