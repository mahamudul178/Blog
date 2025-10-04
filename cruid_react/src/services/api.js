// frontend/src/services/api.js
// এই file টি frontend/src/services/ folder এ থাকবে
// পুরনো api.js file replace করুন

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_URL}token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (error) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

// ==================== Authentication API ====================
export const authAPI = {
    register: (userData) => api.post('register/', userData),
    login: (credentials) => api.post('login/', credentials),
    getProfile: () => api.get('profile/'),
    updateProfile: (profileData) => {
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== null && profileData[key] !== undefined) {
                formData.append(key, profileData[key]);
            }
        });
        return api.patch('profile/update/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};

// ==================== Posts API ====================
export const postsAPI = {
    getAllPosts: (params) => api.get('posts/', { params }),
    getPost: (id) => api.get(`posts/${id}/`),
    getMyPosts: () => api.get('posts/my/'),
    createPost: (postData) => {
        const formData = new FormData();
        Object.keys(postData).forEach(key => {
            if (key === 'tag_ids' && Array.isArray(postData[key])) {
                postData[key].forEach(id => formData.append('tag_ids', id));
            } else if (postData[key] !== null && postData[key] !== undefined) {
                formData.append(key, postData[key]);
            }
        });
        return api.post('posts/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updatePost: (id, postData) => {
        const formData = new FormData();
        Object.keys(postData).forEach(key => {
            if (key === 'tag_ids' && Array.isArray(postData[key])) {
                postData[key].forEach(id => formData.append('tag_ids', id));
            } else if (postData[key] !== null && postData[key] !== undefined) {
                formData.append(key, postData[key]);
            }
        });
        return api.put(`posts/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deletePost: (id) => api.delete(`posts/${id}/`),
    searchPosts: (query) => api.get('search/', { params: { q: query } }),
};

// ==================== Categories API ====================
export const categoriesAPI = {
    getAll: () => api.get('categories/'),
    getOne: (slug) => api.get(`categories/${slug}/`),
    create: (data) => api.post('categories/', data),
};

// ==================== Tags API ====================
export const tagsAPI = {
    getAll: () => api.get('tags/'),
    getOne: (slug) => api.get(`tags/${slug}/`),
    create: (data) => api.post('tags/', data),
};


// ==================== Comments API (FIXED) ====================
export const commentsAPI = {
    getPostComments: (postId) => api.get(`posts/${postId}/comments/`),
    createComment: (postId, content, parentId = null) => {
        const data = { content };
        if (parentId) {
            data.parent = parentId;
        }
        return api.post(`posts/${postId}/comments/`, data);
    },
    updateComment: (id, content) => api.put(`comments/${id}/`, { content }),
    deleteComment: (id) => api.delete(`comments/${id}/`),
};

// ==================== Likes API ====================
export const likesAPI = {
    toggleLike: (postId) => api.post(`posts/${postId}/like/`),
    getPostLikes: (postId) => api.get(`posts/${postId}/likes/`),
};

// ==================== Bookmarks API ====================
export const bookmarksAPI = {
    toggleBookmark: (postId) => api.post(`posts/${postId}/bookmark/`),
    getMyBookmarks: () => api.get('bookmarks/'),
};

// ==================== Follow API ====================
export const followAPI = {
    toggleFollow: (userId) => api.post(`users/${userId}/follow/`),
    getMyFollowing: () => api.get('following/'),
    getMyFollowers: () => api.get('followers/'),
};

// ==================== Timeline API ====================
export const timelineAPI = {
    getFeed: () => api.get('timeline/'),
};

export default api;