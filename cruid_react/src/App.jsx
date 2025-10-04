// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import Profile from './components/Profile';
import Bookmarks from './components/Bookmarks';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Navigate to="/posts" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Protected Routes - Posts */}
                        <Route 
                            path="/posts" 
                            element={
                                <PrivateRoute>
                                    <PostList />
                                </PrivateRoute>
                            } 
                        />
                        
                        <Route 
                            path="/posts/:id" 
                            element={
                                <PrivateRoute>
                                    <PostDetail />
                                </PrivateRoute>
                            } 
                        />
                        
                        <Route 
                            path="/create-post" 
                            element={
                                <PrivateRoute>
                                    <CreatePost />
                                </PrivateRoute>
                            } 
                        />
                        
                        <Route 
                            path="/posts/:id/edit" 
                            element={
                                <PrivateRoute>
                                    <EditPost />
                                </PrivateRoute>
                            } 
                        />

                        {/* Protected Routes - User */}
                        <Route 
                            path="/profile" 
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } 
                        />

                        <Route 
                            path="/bookmarks" 
                            element={
                                <PrivateRoute>
                                    <Bookmarks />
                                </PrivateRoute>
                            } 
                        />

                        {/* 404 Not Found */}
                        <Route 
                            path="*" 
                            element={
                                <div className="flex flex-col items-center justify-center min-h-screen">
                                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                                    <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">
                                        Go Home
                                    </a>
                                </div>
                            } 
                        />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;