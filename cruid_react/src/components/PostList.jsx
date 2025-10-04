// frontend/src/components/PostList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, likesAPI, bookmarksAPI, categoriesAPI } from '../services/api';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, [page, search, selectedCategory]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const params = { page };
            if (search) params.search = search;
            if (selectedCategory) params.category = selectedCategory;
            
            const response = await postsAPI.getAllPosts(params);
            setPosts(response.data.results || response.data);
            
            if (response.data.count) {
                setTotalPages(Math.ceil(response.data.count / 10));
            }
        } catch (error) {
            setError('Failed to fetch posts');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchPosts();
    };

    const handleLike = async (postId) => {
        try {
            const response = await likesAPI.toggleLike(postId);
            // Update the post in the list
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        is_liked: response.data.liked,
                        likes_count: response.data.liked ? post.likes_count + 1 : post.likes_count - 1
                    }
                    : post
            ));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleBookmark = async (postId) => {
        try {
            const response = await bookmarksAPI.toggleBookmark(postId);
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { ...post, is_bookmarked: response.data.bookmarked }
                    : post
            ));
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await postsAPI.deletePost(id);
                setPosts(posts.filter(post => post.id !== id));
                alert('Post deleted successfully');
            } catch (error) {
                alert('Failed to delete post');
                console.error('Error:', error);
            }
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-2xl text-gray-600">Loading...</div>
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
            {/* Header with Search */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">All Posts</h2>
                    <Link
                        to="/create-post"
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                        Create New Post
                    </Link>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-500">No posts found. Create your first post!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                            >
                                {/* Post Image */}
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}

                                <div className="p-6">
                                    {/* Category Badge */}
                                    {post.category && (
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                                            {post.category.name}
                                        </span>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {post.title}
                                    </h3>

                                    {/* Content Preview */}
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {post.content.substring(0, 150)}...
                                    </p>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags.map(tag => (
                                                <span key={tag.id} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                    #{tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                        <span>By: {post.author.username}</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                            {post.views_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            ❤️ {post.likes_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            💬 {post.comments_count}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            to={`/posts/${post.id}`}
                                            className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm"
                                        >
                                            View
                                        </Link>
                                        
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className={`px-4 py-2 rounded transition text-sm ${
                                                post.is_liked 
                                                    ? 'bg-red-500 text-white' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {post.is_liked ? '❤️' : '🤍'}
                                        </button>

                                        <button
                                            onClick={() => handleBookmark(post.id)}
                                            className={`px-4 py-2 rounded transition text-sm ${
                                                post.is_bookmarked 
                                                    ? 'bg-yellow-500 text-white' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {post.is_bookmarked ? '🔖' : '📑'}
                                        </button>

                                        <Link
                                            to={`/posts/${post.id}/edit`}
                                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition text-sm"
                                        >
                                            Edit
                                        </Link>
                                        
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                            >
                                Previous
                            </button>
                            
                            <span className="px-4 py-2">
                                Page {page} of {totalPages}
                            </span>
                            
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PostList;