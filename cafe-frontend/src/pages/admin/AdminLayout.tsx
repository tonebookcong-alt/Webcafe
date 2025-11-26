// src/pages/admin/AdminLayout.tsx

import * as React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, IconButton, Typography, CssBaseline, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Box, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CoffeeIcon from "@mui/icons-material/Coffee";
import GroupsIcon from "@mui/icons-material/Groups";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import HomeIcon from "@mui/icons-material/Home";
import RateReviewIcon from '@mui/icons-material/RateReview';

// Import các trang admin
import AdminHome from '@/pages/admin/AdminHome';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminFeedback from '@/pages/admin/AdminFeedback';
import AdminLoyalty from '@/pages/admin/AdminLoyalty';

const drawerWidth = 240;

const NAVS = [
  { to: "/admin", text: "Tổng quan", icon: <DashboardIcon /> },
  { to: "/admin/orders", text: "Đơn hàng", icon: <ReceiptLongIcon /> },
  { to: "/admin/products", text: "Sản phẩm", icon: <CoffeeIcon /> },
  { to: "/admin/users", text: "Người dùng", icon: <GroupsIcon /> },
  { to: "/admin/inventory", text: "Kho", icon: <Inventory2Icon /> },
  { to: "/admin/feedback", text: "Phản hồi chung", icon: <RateReviewIcon /> },
  { to: "/admin/loyalty", text: "Tích điểm", icon: <LoyaltyIcon /> },
];

export default function AdminLayout() {
  const [open, setOpen] = React.useState(true);
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "rgba(255,255,255,0.8)", color: "text.primary", backdropFilter: "saturate(180%) blur(10px)" }} elevation={0}>
        <Toolbar>
          <IconButton onClick={() => setOpen(!open)} edge="start" color="inherit" sx={{ mr: 2 }}><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, mr: 2 }}>SERENITE Admin</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton component={Link} to="/" color="inherit"><HomeIcon /></IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="persistent" open={open} sx={{ width: drawerWidth, flexShrink: 0, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}>
        <Toolbar />
        <Divider />
        <List>
          {NAVS.map((n) => (
            <ListItemButton key={n.to} component={Link} to={n.to} selected={pathname === n.to}>
              <ListItemIcon>{n.icon}</ListItemIcon>
              <ListItemText primary={n.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, transition: 'margin-left .3s', marginLeft: open ? 0 : `-${drawerWidth}px` }}>
        <Toolbar />
        {/* Định nghĩa các route con của admin ở đây */}
        <Routes>
            <Route index element={<AdminHome />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="loyalty" element={<AdminLoyalty />} />
        </Routes>
      </Box>
    </Box>
  );
}