// frontend/src/components/Bookmarks.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarksAPI } from '../services/api';

const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const response = await bookmarksAPI.getMyBookmarks();
            setBookmarks(response.data.results || response.data);
        } catch (error) {
            setError('Failed to fetch bookmarks');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (postId) => {
        if (window.confirm('Remove this bookmark?')) {
            try {
                await bookmarksAPI.toggleBookmark(postId);
                setBookmarks(bookmarks.filter(b => b.post.id !== postId));
            } catch (error) {
                alert('Failed to remove bookmark');
                console.error('Error:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-2xl text-gray-600">Loading bookmarks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookmarks</h2>
                <p className="text-gray-600">Posts you've saved for later</p>
            </div>

            {bookmarks.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🔖</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookmarks yet</h3>
                    <p className="text-gray-600 mb-6">
                        Start saving posts you want to read later
                    </p>
                    <Link
                        to="/posts"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
                    >
                        Browse Posts
                    </Link>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 mb-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Saved</p>
                                <p className="text-4xl font-bold">{bookmarks.length}</p>
                            </div>
                            <div className="text-6xl opacity-50">🔖</div>
                        </div>
                    </div>

                    {/* Bookmarks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarks.map(({ post, created_at }) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                            >
                                {/* Post Image */}
                                {post.image && (
                                    <div className="relative">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <button
                                                onClick={() => handleRemoveBookmark(post.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition shadow-lg"
                                                title="Remove bookmark"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Saved Date */}
                                    <p className="text-xs text-gray-500 mb-2">
                                        Saved on {new Date(created_at).toLocaleDateString()}
                                    </p>

                                    {/* Category Badge */}
                                    {post.category && (
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                                            {post.category.name}
                                        </span>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                        {post.title}
                                    </h3>

                                    {/* Content Preview */}
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {post.content.substring(0, 150)}...
                                    </p>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {post.tags.slice(0, 3).map(tag => (
                                                <span key={tag.id} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                    #{tag.name}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{post.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Author Info */}
                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                                        <span>By {post.author.username}</span>
                                        <span>•</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b">
                                        <span className="flex items-center gap-1">
                                            👁️ {post.views_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            ❤️ {post.likes_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            💬 {post.comments_count}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/posts/${post.id}`}
                                            className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                                        >
                                            Read Post
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveBookmark(post.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                                            title="Remove"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Bookmarks;