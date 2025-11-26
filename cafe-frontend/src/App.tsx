// src/App.tsx

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { RoleRoute } from "./auth/guards";
import Navbar from "@/components/site/Navbar";

// Pages
import CustomerHome from "@/pages/customer/CustomerHome";
import ProductPage from "@/pages/customer/ProductPage";
import MyOrders from "@/pages/customer/MyOrders";
import Login from "@/pages/auth/Login";
import SignUpPage from "@/pages/auth/SignUpPage";
import AdminLayout from "@/pages/admin/AdminLayout";

// Component layout chính cho trang khách hàng
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* === PUBLIC & CUSTOMER ROUTES (CÓ NAVBAR) === */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<CustomerHome />} />
        <Route path="/products/:id" element={<ProductPage />} />
        
        {/* Customer Protected Route */}
        <Route element={<RoleRoute allow={["customer", "admin", "staff"]} />}>
            <Route path="/my-orders" element={<MyOrders />} />
        </Route>
      </Route>
      
      {/* === AUTH ROUTES (KHÔNG CÓ NAVBAR VÀ CÓ NỀN RIÊNG) === */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* === ADMIN PROTECTED ROUTES === */}
      <Route element={<RoleRoute allow={["admin"]} />}>
        {/* Tất cả các route con của AdminLayout sẽ được định nghĩa bên trong nó */}
        <Route path="/admin/*" element={<AdminLayout />} />
      </Route>

      {/* Route mặc định nếu không khớp */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}