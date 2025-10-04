// frontend/src/components/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI, likesAPI, bookmarksAPI, commentsAPI } from '../services/api';

const PostDetail = () => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await postsAPI.getPost(id);
            setPost(response.data);
        } catch (error) {
            console.error('Error:', error);
            alert('Post not found');
            navigate('/posts');
        } finally {
            setLoading(false);
        }
    };


    const handleLike = async () => {
        try {
            const response = await likesAPI.toggleLike(id);
            setPost({
                ...post,
                is_liked: response.data.liked,
                likes_count: response.data.liked ? post.likes_count + 1 : post.likes_count - 1
            });
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleBookmark = async () => {
        try {
            const response = await bookmarksAPI.toggleBookmark(id);
            setPost({
                ...post,
                is_bookmarked: response.data.bookmarked
            });
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };
// frontend/src/components/PostDetail.jsx
// Comment submit function এবং fetchComments function replace করুন

const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
        alert('Please write something!');
        return;
    }

    try {
        const response = await commentsAPI.createComment(id, newComment);
        console.log('Comment created:', response.data);
        setNewComment('');
        fetchComments(); // Refresh comments
        // Update comment count
        setPost({ ...post, comments_count: post.comments_count + 1 });
        alert('Comment added successfully!');
    } catch (error) {
        console.error('Error adding comment:', error);
        console.error('Error response:', error.response?.data);
        alert(`Failed to add comment: ${error.response?.data?.detail || error.message}`);
    }
};

const fetchComments = async () => {
    try {
        const response = await commentsAPI.getPostComments(id);
        console.log('Comments fetched:', response.data);
        setComments(response.data.results || response.data);
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
};

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Delete this comment?')) {
            try {
                await commentsAPI.deleteComment(commentId);
                fetchComments();
                setPost({ ...post, comments_count: post.comments_count - 1 });
            } catch (error) {
                alert('Failed to delete comment');
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await postsAPI.deletePost(id);
                alert('Post deleted successfully!');
                navigate('/posts');
            } catch (error) {
                alert('Failed to delete post');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-2xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Post Image */}
                {post.image && (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-96 object-cover"
                    />
                )}

                <div className="p-8">
                    {/* Category Badge */}
                    {post.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded mb-4">
                            {post.category.name}
                        </span>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
                        <div className="flex items-center gap-2">
                            {post.author.profile?.avatar && (
                                <img
                                    src={post.author.profile.avatar}
                                    alt={post.author.username}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <span>By: {post.author.username}</span>
                        </div>
                        <span>📅 {new Date(post.created_at).toLocaleString()}</span>
                        <span>👁️ {post.views_count} views</span>
                        <span>❤️ {post.likes_count} likes</span>
                        <span>💬 {post.comments_count} comments</span>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.map(tag => (
                                <span key={tag.id} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose max-w-none mb-8">
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button
                            onClick={handleLike}
                            className={`px-6 py-3 rounded-lg font-medium transition ${
                                post.is_liked
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                        >
                            {post.is_liked ? '❤️ Liked' : '🤍 Like'}
                        </button>

                        <button
                            onClick={handleBookmark}
                            className={`px-6 py-3 rounded-lg font-medium transition ${
                                post.is_bookmarked
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                        >
                            {post.is_bookmarked ? '🔖 Saved' : '📑 Save'}
                        </button>

                        <Link
                            to="/posts"
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition inline-flex items-center"
                        >
                            ← Back
                        </Link>

                        <Link
                            to={`/posts/${id}/edit`}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
                        >
                            Edit
                        </Link>

                        <button
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition"
                        >
                            Delete
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t pt-8">
                        <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

                        {/* Add Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="mb-8">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                rows="3"
                                required
                            />
                            <button
                                type="submit"
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                            >
                                Post Comment
                            </button>
                        </form>

                        {/* Comments List */}
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {comment.author.profile?.avatar && (
                                                    <img
                                                        src={comment.author.profile.avatar}
                                                        alt={comment.author.username}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {comment.author.username}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-8 mt-4 space-y-3">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="bg-white rounded p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold text-sm text-gray-900">
                                                                {reply.author.username}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(reply.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{reply.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;