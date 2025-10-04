// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="text-white text-2xl font-bold hover:text-gray-300 transition"
                    >
                        Blog
                    </Link>
                    
                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                <Link 
                                    to="/posts" 
                                    className="text-white hover:text-gray-300 transition"
                                >
                                    Posts
                                </Link>
                                <Link 
                                    to="/create-post" 
                                    className="text-white hover:text-gray-300 transition"
                                >
                                    Create Post
                                </Link>
                                <Link 
                                    to="/bookmarks" 
                                    className="text-white hover:text-gray-300 transition flex items-center gap-1"
                                >
                                    🔖 Bookmarks
                                </Link>
                                <Link 
                                    to="/profile" 
                                    className="text-white hover:text-gray-300 transition flex items-center gap-2"
                                >
                                    {user?.profile?.avatar ? (
                                        <img 
                                            src={user.profile.avatar} 
                                            alt={user.username}
                                            className="w-8 h-8 rounded-full border-2 border-white"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="hidden md:inline">{user?.username}</span>
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-white hover:text-gray-300 transition"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;