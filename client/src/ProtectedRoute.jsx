import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, adminRoute }) => {
    const { isAuthenticated, user } = useAuth();

    return isAuthenticated ? (adminRoute && user.role != 'admin') ? <Navigate to='/login?admin=true' /> : children : <Navigate to="/login" />;
};

export default ProtectedRoute;