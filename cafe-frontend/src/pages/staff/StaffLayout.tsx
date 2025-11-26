import * as React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, IconButton, Typography, CssBaseline, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Box, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import HomeIcon from "@mui/icons-material/Home";

const drawerWidth = 240;

// Cập nhật lại NAVS cho Staff
const NAVS = [
  { to: "/staff/orders", text: "Đơn hàng", icon: <ReceiptLongIcon /> },
  { to: "/staff/inventory", text: "Kho", icon: <Inventory2Icon /> },
  { to: "/staff/loyalty", text: "Tích điểm", icon: <LoyaltyIcon /> }, // THÊM MỚI: Menu Tích điểm
];

export default function StaffLayout() {
  const [open, setOpen] = React.useState(true);
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "rgba(255,255,255,0.8)",
          color: "text.primary",
          backdropFilter: "saturate(180%) blur(10px)",
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton onClick={() => setOpen(!open)} edge="start" color="inherit" sx={{ mr: 2 }}><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800, mr: 2 }}>SERENITE Staff</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton component={Link} to="/" color="inherit"><HomeIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent" open={open}
        sx={{
          width: drawerWidth, flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {NAVS.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <ListItemButton key={n.to} component={Link} to={n.to} selected={active}>
                <ListItemIcon>{n.icon}</ListItemIcon>
                <ListItemText primary={n.text} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, transition: 'margin-left .3s', marginLeft: open ? 0 : `-${drawerWidth}px` }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}