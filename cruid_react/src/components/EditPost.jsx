// frontend/src/components/EditPost.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI, categoriesAPI, tagsAPI } from '../services/api';

const EditPost = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: null,
        category_id: '',
        tag_ids: [],
        status: 'published',
    });
    const [currentImage, setCurrentImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPost();
        fetchCategories();
        fetchTags();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await postsAPI.getPost(id);
            const post = response.data;
            setFormData({
                title: post.title,
                content: post.content,
                image: null,
                category_id: post.category?.id || '',
                tag_ids: post.tags?.map(t => t.id) || [],
                status: post.status,
            });
            setCurrentImage(post.image);
        } catch (error) {
            alert('Post not found');
            navigate('/posts');
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

    const fetchTags = async () => {
        try {
            const response = await tagsAPI.getAll();
            setTags(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleTagChange = (tagId) => {
        const tagIdNum = parseInt(tagId);
        setFormData(prev => ({
            ...prev,
            tag_ids: prev.tag_ids.includes(tagIdNum)
                ? prev.tag_ids.filter(id => id !== tagIdNum)
                : [...prev.tag_ids, tagIdNum]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await postsAPI.updatePost(id, formData);
            alert('Post updated successfully!');
            navigate(`/posts/${id}`);
        } catch (error) {
            setError('Failed to update post');
        } finally {
            setSubmitting(false);
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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit Post</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Post Title *
                        </label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            placeholder="Enter your post title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Select a category (optional)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <label key={tag.id} className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.tag_ids.includes(tag.id)}
                                        onChange={() => handleTagChange(tag.id)}
                                        className="mr-2"
                                    />
                                    <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                                        {tag.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Current Image */}
                    {currentImage && !imagePreview && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Image
                            </label>
                            <img
                                src={currentImage}
                                alt="Current"
                                className="w-full max-h-64 object-cover rounded-lg"
                            />
                        </div>
                    )}

                    {/* New Image Upload */}
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                            {currentImage ? 'Change Image' : 'Upload Image'}
                        </label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            Post Content *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            placeholder="Write your post content here..."
                            value={formData.content}
                            onChange={handleChange}
                            rows="12"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y"
                            required
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Updating...' : 'Update Post'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/posts/${id}`)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPost;