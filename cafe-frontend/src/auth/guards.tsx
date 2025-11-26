// src/auth/guards.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Box, CircularProgress } from '@mui/material';

interface RoleRouteProps {
  allow: Array<'admin' | 'customer' | 'staff'>;
}

export const RoleRoute = ({ allow }: RoleRouteProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Nếu chưa đăng nhập (không có profile), chuyển đến trang login
  if (!profile) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu đã đăng nhập nhưng không có quyền, chuyển về trang chủ
  if (!allow.includes(profile.role)) {
    // alert("Bạn không có quyền truy cập trang này."); // Tạm thời tắt alert để tránh phiền nhiễu
    return <Navigate to="/" replace />;
  }

  // Nếu có quyền, cho phép render các route con
  return <Outlet />;
};