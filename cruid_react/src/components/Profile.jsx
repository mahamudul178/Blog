// frontend/src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, postsAPI } from '../services/api';

const Profile = () => {
    const { user } = useAuth();
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        bio: '',
        location: '',
        website: '',
        avatar: null
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchMyPosts();
        if (user?.profile) {
            setProfileData({
                bio: user.profile.bio || '',
                location: user.profile.location || '',
                website: user.profile.website || '',
                avatar: null
            });
        }
    }, [user]);

    const fetchMyPosts = async () => {
        try {
            const response = await postsAPI.getMyPosts();
            setMyPosts(response.data.results || response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData({ ...profileData, avatar: file });
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            await authAPI.updateProfile(profileData);
            alert('Profile updated successfully!');
            setEditMode(false);
            // Refresh page to show updated profile
            window.location.reload();
        } catch (error) {
            alert('Failed to update profile');
            console.error('Error:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-2xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                        {/* Avatar */}
                        <div className="text-center mb-6">
                            <div className="relative inline-block">
                                {user?.profile?.avatar || avatarPreview ? (
                                    <img
                                        src={avatarPreview || user.profile.avatar}
                                        alt={user?.username}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mt-4">
                                {user?.first_name} {user?.last_name}
                            </h2>
                            <p className="text-gray-600">@{user?.username}</p>
                            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6 text-center border-t border-b py-4">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{myPosts.length}</p>
                                <p className="text-sm text-gray-600">Posts</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{user?.followers_count || 0}</p>
                                <p className="text-sm text-gray-600">Followers</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{user?.following_count || 0}</p>
                                <p className="text-sm text-gray-600">Following</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {user?.profile?.bio && !editMode && (
                            <div className="mb-4">
                                <p className="text-gray-700 text-sm">{user.profile.bio}</p>
                            </div>
                        )}

                        {/* Location & Website */}
                        {!editMode && (
                            <div className="space-y-2 mb-6 text-sm">
                                {user?.profile?.location && (
                                    <p className="flex items-center text-gray-600">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        {user.profile.location}
                                    </p>
                                )}
                                {user?.profile?.website && (
                                    <p className="flex items-center text-blue-600">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                        </svg>
                                        <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {user.profile.website}
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Edit Profile Button */}
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditMode(false)}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    {editMode ? (
                        /* Edit Profile Form */
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-2xl font-bold mb-6">Edit Profile</h3>
                            
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                {/* Avatar Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Picture
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        placeholder="Tell us about yourself..."
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="4"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Dhaka, Bangladesh"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://yourwebsite.com"
                                        value={profileData.website}
                                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={updating}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* My Posts */
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">My Posts ({myPosts.length})</h3>
                                <Link
                                    to="/create-post"
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                                >
                                    Create New
                                </Link>
                            </div>

                            {myPosts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">You haven't created any posts yet.</p>
                                    <Link
                                        to="/create-post"
                                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
                                    >
                                        Create Your First Post
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myPosts.map(post => (
                                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                            <div className="flex gap-4">
                                                {post.image && (
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="w-24 h-24 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <Link to={`/posts/${post.id}`}>
                                                        <h4 className="font-bold text-lg hover:text-blue-600 mb-1">
                                                            {post.title}
                                                        </h4>
                                                    </Link>
                                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                        {post.content.substring(0, 150)}...
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>👁️ {post.views_count} views</span>
                                                        <span>❤️ {post.likes_count} likes</span>
                                                        <span>💬 {post.comments_count} comments</span>
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            post.status === 'published' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {post.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Link
                                                        to={`/posts/${post.id}/edit`}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <Link
                                                        to={`/posts/${post.id}`}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;