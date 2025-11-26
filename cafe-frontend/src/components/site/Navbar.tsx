// src/components/site/Navbar.tsx - PHIÊN BẢN SỬA LỖI LAYOUT

import * as React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Button, Box, Typography, IconButton, Badge, Menu, MenuItem, Divider
} from "@mui/material";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'; // Icon cho Staff

import { useAuth } from "@/auth/AuthProvider";
import { useCart } from "@/lib/cart/CartContext";
import CheckoutDialog from "@/components/site/CheckoutDialog";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { cartItems } = useCart();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isCheckoutOpen, setCheckoutOpen] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut();
    navigate("/login");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleOrdersClick = () => {
    handleClose();
    navigate("/my-orders");
  };

  const handleAdminDashboardClick = () => {
    handleClose();
    navigate("/admin");
  };

  // THÊM MỚI: Hàm điều hướng cho Staff
  const handleStaffDashboardClick = () => {
    handleClose();
    navigate("/staff/orders"); // Điều hướng đến trang mặc định của staff
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'grey.200', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, mx: 'auto', width: '100%' }}>
          {/* SỬA LỖI: Bỏ flexGrow: 1 khỏi đây */}
          <Typography 
            variant="h6" component={RouterLink} to="/" 
            sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 700, mr: 4 }}>
            Serenite Café
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button color="primary" component={RouterLink} to="/">Menu</Button>
            <Button color="primary" component={RouterLink} to="/about">Giới thiệu</Button>
          </Box>

          {/* THÊM MỚI: "Cục đẩy" vô hình để đẩy các nút còn lại sang phải */}
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="primary" onClick={() => setCheckoutOpen(true)} sx={{ mr: 1 }}>
              <Badge badgeContent={cartItems.length} color="secondary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>

            {user ? (
              <>
                <IconButton color="primary" onClick={handleMenu}>
                    <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleOrdersClick}><ListAltIcon fontSize="small" sx={{ mr: 1.5 }} /> Đơn hàng của tôi</MenuItem>
                  
                  {profile?.role === 'admin' && (
                    <MenuItem onClick={handleAdminDashboardClick}><DashboardIcon fontSize="small" sx={{ mr: 1.5 }} /> Admin Dashboard</MenuItem>
                  )}
                  
                  {/* === THÊM MỚI LOGIC CHO STAFF === */}
                  {profile?.role === 'staff' && (
                    <MenuItem onClick={handleStaffDashboardClick}><SupervisedUserCircleIcon fontSize="small" sx={{ mr: 1.5 }} /> Staff Dashboard</MenuItem>
                  )}
                  
                  <Divider />
                  <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Đăng xuất</MenuItem>
                </Menu>
              </>
            ) : (
              <Button variant="outlined" color="primary" startIcon={<LoginIcon />} onClick={handleLoginClick}>
                Đăng nhập
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <CheckoutDialog open={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
